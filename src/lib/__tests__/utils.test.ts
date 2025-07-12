import { cn, downloadFile } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid')
    })

    it('should handle empty strings', () => {
      expect(cn('base', '', 'valid')).toBe('base valid')
    })

    it('should handle objects with boolean values', () => {
      expect(cn('base', { 'conditional': true, 'hidden': false })).toBe('base conditional')
    })

    it('should handle arrays', () => {
      expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2')
    })

    it('should handle mixed inputs', () => {
      expect(cn('base', 'class1', { 'conditional': true }, ['array1', 'array2'])).toBe('base class1 conditional array1 array2')
    })
  })

  describe('downloadFile', () => {
    beforeEach(() => {
      // Mock fetch
      global.fetch = jest.fn()
      
      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
      
      // Mock document.createElement
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn(),
      }
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      
      // Mock document.body.appendChild and removeChild
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should download file successfully', async () => {
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['test content'])),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await downloadFile('https://example.com/file.pdf', 'test.pdf')

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/file.pdf')
      expect(mockResponse.blob).toHaveBeenCalled()
    })

    it('should use fallback URL when primary fails', async () => {
      const mockResponse = {
        ok: true,
        blob: jest.fn().mockResolvedValue(new Blob(['test content'])),
      }
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(mockResponse)

      await downloadFile('https://example.com/file.pdf', 'test.pdf', 'https://fallback.com/file.pdf')

      expect(global.fetch).toHaveBeenCalledWith('https://fallback.com/file.pdf')
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      // The function should not throw but handle the error gracefully
      await expect(downloadFile('https://example.com/file.pdf', 'test.pdf')).resolves.toBeUndefined()
    })

    it('should handle response errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // The function should not throw but handle the error gracefully
      await expect(downloadFile('https://example.com/file.pdf', 'test.pdf')).resolves.toBeUndefined()
    })
  })
}) 