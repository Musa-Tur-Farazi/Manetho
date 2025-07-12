import { GET } from '@/app/api/proxy-image/route'
import { NextRequest } from 'next/server'

jest.mock('next/server', () => {
  const json = (body: any, init?: any) => ({ status: init?.status ?? 200, json: async () => body })
  function NextResponse(body?: any, init?: any) {
    return { status: init?.status ?? 200, body }
  }
  NextResponse.json = json
  return {
    NextRequest: jest.fn((url: string) => ({ url, headers: new Headers(), method: 'GET' })),
    NextResponse,
  }
})

// Mock global fetch
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('/api/proxy-image', () => {
  it('returns 400 when url param missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy-image') as any
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/no image url provided/i)
  })

  it('proxies successful image fetch', async () => {
    const arrayBuf = new ArrayBuffer(8)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'image/png' }),
      arrayBuffer: () => Promise.resolve(arrayBuf),
    })

    const req = new NextRequest('http://localhost:3000/api/proxy-image?url=https%3A%2F%2Fexample.com%2Fimg.png') as any
    const res: any = await GET(req)

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/img.png', expect.any(Object))
    expect(res.status).toBe(200)
  })

  it('passes through fetch error status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })

    const req = new NextRequest('http://localhost:3000/api/proxy-image?url=https%3A%2F%2Fexample.com%2Fmissing.jpg') as any
    const res: any = await GET(req)

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/failed to fetch image/i)
  })
}) 