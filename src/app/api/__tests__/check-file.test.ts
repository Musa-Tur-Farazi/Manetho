import { GET } from '@/app/api/check-file/route'
import { NextRequest } from 'next/server'

// ---- Mock next/server helpers ----
jest.mock('next/server', () => ({
  NextRequest: jest.fn((input: string) => ({
    url: input,
    headers: new Headers(),
    method: 'GET',
  })),
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: new Headers(),
    })),
  },
}))

// ---- Mock node-appwrite Client & Storage ----
jest.mock('node-appwrite', () => {
  const getFileMock = jest.fn()
  return {
    Client: jest.fn().mockImplementation(() => ({
      setEndpoint: jest.fn().mockReturnThis(),
      setProject: jest.fn().mockReturnThis(),
      setKey: jest.fn().mockReturnThis(),
    })),
    Storage: jest.fn().mockImplementation(() => ({
      getFile: getFileMock,
    })),
    __getFileMock: getFileMock,
  }
})

// Re-import after mocks
import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __getFileMock: mockGetFile } = require('node-appwrite')

describe('/api/check-file', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID = 'bucket123'
  })

  it('returns 400 if fileId query param missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/check-file') as any

    const res = await GET(req)

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/no file id provided/i)
  })

  it('returns exists=true when storage.getFile succeeds', async () => {
    mockGetFile.mockResolvedValueOnce({
      $id: 'file123',
      name: 'test.pdf',
      sizeOriginal: 2048,
      mimeType: 'application/pdf',
      $permissions: [],
      $createdAt: '2023-01-01',
      $updatedAt: '2023-01-01',
    })

    const req = new NextRequest('http://localhost:3000/api/check-file?fileId=file123') as any
    const res = await GET(req)

    expect(mockGetFile).toHaveBeenCalledWith('bucket123', 'file123')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.exists).toBe(true)
    expect(body.file.id).toBe('file123')
  })

  it('returns exists=false when storage throws not-found error', async () => {
    const notFoundErr: any = new Error('Not Found')
    notFoundErr.code = 404
    notFoundErr.type = 'not_found'
    mockGetFile.mockRejectedValueOnce(notFoundErr)

    const req = new NextRequest('http://localhost:3000/api/check-file?fileId=missing') as any
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.exists).toBe(false)
    expect(body.error).toMatch(/not found/i)
  })
}) 