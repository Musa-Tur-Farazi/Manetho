import { renderHook, act, waitFor } from '@testing-library/react'
import { useFileUpload } from '@/hooks/useFileUpload'

// Mock fetch
global.fetch = jest.fn()

describe('useFileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFileUpload())

    expect(result.current.uploading).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBe(null)
    expect(result.current.uploadedFile).toBe(null)
  })

  it('should upload file successfully', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        file: {
          id: 'file-123',
          name: 'test.txt',
          size: 12,
          type: 'text/plain',
          url: 'https://example.com/test.txt',
          downloadUrl: 'https://example.com/download/test.txt',
          previewUrl: 'https://example.com/preview/test.txt'
        }
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    let uploadedFile;
    await act(async () => {
      uploadedFile = await result.current.uploadFile(mockFile)
    })

    expect(uploadedFile).toEqual({
      id: 'file-123',
      name: 'test.txt',
      size: 12,
      type: 'text/plain',
      url: 'https://example.com/test.txt',
      downloadUrl: 'https://example.com/download/test.txt',
      previewUrl: 'https://example.com/preview/test.txt'
    })

    expect(result.current.uploadedFile).toEqual({
      id: 'file-123',
      name: 'test.txt',
      size: 12,
      type: 'text/plain',
      url: 'https://example.com/test.txt',
      downloadUrl: 'https://example.com/download/test.txt',
      previewUrl: 'https://example.com/preview/test.txt'
    })
    expect(result.current.error).toBe(null)
  })

  it('should handle upload error', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({ error: 'Upload failed' })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      const uploadedFile = await result.current.uploadFile(mockFile)
      expect(uploadedFile).toBe(null)
    })

    expect(result.current.error).toBe('Upload failed')
    expect(result.current.uploadedFile).toBe(null)
  })

  it('should handle network error', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      const uploadedFile = await result.current.uploadFile(mockFile)
      expect(uploadedFile).toBe(null)
    })

    expect(result.current.error).toBe('Network error')
  })

  it('should delete file successfully', async () => {
    const mockResponse = { 
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    let success;
    await act(async () => {
      success = await result.current.deleteFile('file-123')
    })

    expect(success).toBe(true)
  })

  it('should handle delete error', async () => {
    const mockResponse = { 
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Delete failed' })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      const success = await result.current.deleteFile('file-123')
      expect(success).toBe(false)
    })
  })

  it('should reset state', () => {
    const { result } = renderHook(() => useFileUpload())

    // Set some state
    act(() => {
      result.current.reset()
    })

    expect(result.current.uploading).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBe(null)
    expect(result.current.uploadedFile).toBe(null)
  })

  it('should handle file upload with FormData', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        file: {
          id: 'file-123',
          name: 'test.txt',
          size: 12,
          type: 'text/plain',
          url: 'https://example.com/test.txt',
          downloadUrl: 'https://example.com/download/test.txt'
        }
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    await act(async () => {
      await result.current.uploadFile(mockFile)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData)
    }))
  })

  it('should handle large files', async () => {
    const largeContent = 'x'.repeat(1024 * 1024) // 1MB
    const mockFile = new File([largeContent], 'large.txt', { type: 'text/plain' })
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        file: {
          id: 'file-123',
          name: 'large.txt',
          size: 1024 * 1024,
          type: 'text/plain',
          url: 'https://example.com/large.txt',
          downloadUrl: 'https://example.com/download/large.txt'
        }
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFileUpload())

    let uploadedFile;
    await act(async () => {
      uploadedFile = await result.current.uploadFile(mockFile)
    })
    
    expect(uploadedFile?.size).toBe(1024 * 1024)
  })
}) 