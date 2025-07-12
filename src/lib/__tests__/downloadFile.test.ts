import { downloadFile } from '../utils'

// Provide DOM APIs missing in JSDOM
beforeAll(() => {
  // @ts-ignore
  global.Blob = class {
    size = 1
    type = 'text/plain'
    constructor(parts?: any, options?: any) {}
  }
})

describe('downloadFile utility', () => {
  const origCreate = window.URL.createObjectURL
  const origRevoke = window.URL.revokeObjectURL

  let createSpy: jest.SpyInstance, revokeSpy: jest.SpyInstance

  beforeEach(() => {
    // spies for URL helpers
    createSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    revokeSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    // stub append/removeChild
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
  })

  afterEach(() => {
    createSpy.mockRestore()
    revokeSpy.mockRestore()
    jest.resetAllMocks()
  })

  it('downloads successfully when fetch ok', async () => {
    const clickMock = jest.fn()
    // intercept created link to capture click
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return { click: clickMock } as any
      return document.createElement(tag)
    })

    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any

    await downloadFile('https://example.com/file.txt', 'file.txt')

    expect(fetch).toHaveBeenCalledWith('https://example.com/file.txt')
    expect(clickMock).toHaveBeenCalled()
    expect(createSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()
  })

  it('falls back to fallbackUrl when initial fetch fails', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)

    global.fetch = jest
      .fn()
      // first attempt fails
      .mockResolvedValueOnce({ ok: false, status: 500 })
      // fallback succeeds
      .mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any

    await downloadFile('https://bad.com/file.pdf', 'file.pdf', 'https://backup.com/file.pdf')

    // Should try both URLs
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://bad.com/file.pdf')
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://backup.com/file.pdf')
    expect(openSpy).toHaveBeenCalledWith('https://backup.com/file.pdf', '_blank')
  })
}) 