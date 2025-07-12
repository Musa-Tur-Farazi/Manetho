import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { createMockFile, createMockImage } from '@/__tests__/utils/test-utils'
import FileUpload from '../FileUpload'

// Mock the upload API
const mockUploadFile = jest.fn()
jest.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
    uploadFile: mockUploadFile,
    deleteFile: jest.fn(),
    reset: jest.fn(),
  }),
}))

// Mock window.alert
const mockAlert = jest.fn()
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
})

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<FileUpload />)
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
    })

    it('renders with custom accept prop', () => {
      render(<FileUpload accept="image/*" />)
      const input = screen.getByText(/click to upload/i)
      expect(input).toBeInTheDocument()
    })

    it('renders with custom maxSize prop', () => {
      render(<FileUpload maxSize={5} />)
      expect(screen.getByText(/5/)).toBeInTheDocument()
      expect(screen.getByText(/MB/)).toBeInTheDocument()
    })

    it('renders disabled state', () => {
      render(<FileUpload disabled />)
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      expect(uploadArea).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('renders with custom className', () => {
      render(<FileUpload className="custom-upload" />)
      const container = screen.getByText(/click to upload/i).closest('.custom-upload')
      expect(container).toBeInTheDocument()
    })
  })

  describe('File Selection', () => {
    it('handles file input change', async () => {
      const mockOnFileUploaded = jest.fn()
      render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
      
      const file = createMockFile('test.txt', 'test content')
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      
      if (uploadArea) {
        fireEvent.click(uploadArea)
      }
      
      // Simulate file selection
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } })
      }
      
      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(file)
      })
    })

    it('handles image file selection', async () => {
      const mockOnFileUploaded = jest.fn()
      render(<FileUpload onFileUploaded={mockOnFileUploaded} accept="image/*" />)
      
      const imageFile = createMockImage('test.jpg', 100, 100)
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      
      if (uploadArea) {
        fireEvent.click(uploadArea)
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [imageFile] } })
      }
      
      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(imageFile)
      })
    })
  })

  describe('Drag and Drop', () => {
    it('handles drag over event', () => {
      render(<FileUpload />)
      const dropZone = screen.getByText(/drag and drop/i).closest('div')
      
      if (dropZone) {
        fireEvent.dragOver(dropZone)
        expect(dropZone).toHaveClass('border-blue-400', 'bg-blue-50')
      }
    })

    it('handles drag leave event', () => {
      render(<FileUpload />)
      const dropZone = screen.getByText(/drag and drop/i).closest('div')
      
      if (dropZone) {
        fireEvent.dragOver(dropZone)
        fireEvent.dragLeave(dropZone)
        expect(dropZone).not.toHaveClass('border-blue-400', 'bg-blue-50')
      }
    })

    it('handles drop event', async () => {
      const mockOnFileUploaded = jest.fn()
      render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
      
      const file = createMockFile('dropped.txt', 'dropped content')
      const dropZone = screen.getByText(/drag and drop/i).closest('div')
      
      if (dropZone) {
        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file],
          },
        })
        
        await waitFor(() => {
          expect(mockUploadFile).toHaveBeenCalledWith(file)
        })
      }
    })
  })

  describe('File Validation', () => {
    it('validates file size', async () => {
      const mockOnFileUploaded = jest.fn()
      render(<FileUpload maxSize={1} onFileUploaded={mockOnFileUploaded} />)
      
      // Create a file larger than 1MB
      const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', {
        type: 'text/plain',
      })
      
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      if (uploadArea) {
        fireEvent.click(uploadArea)
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [largeFile] } })
      }
      
      // Should show alert for large file
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('File too large. Maximum size is 1MB.')
      })
    })

    it('validates file type', async () => {
      const mockOnFileUploaded = jest.fn()
      render(<FileUpload accept="image/*" onFileUploaded={mockOnFileUploaded} />)
      
      const textFile = createMockFile('test.txt', 'text content')
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      
      if (uploadArea) {
        fireEvent.click(uploadArea)
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [textFile] } })
      }
      
      // Should still process the file as the validation is handled by the browser
      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(textFile)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty file list', () => {
      render(<FileUpload />)
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      
      if (uploadArea) {
        fireEvent.click(uploadArea)
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [] } })
      }
      
      // Should not throw error
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
    })

    it('handles multiple file selection', async () => {
      const mockOnFileUploaded = jest.fn()
      render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
      
      const file1 = createMockFile('file1.txt', 'content 1')
      const file2 = createMockFile('file2.txt', 'content 2')
      
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      if (uploadArea) {
        fireEvent.click(uploadArea)
      }
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file1, file2] } })
      }
      
      await waitFor(() => {
        // Should only process the first file
        expect(mockUploadFile).toHaveBeenCalledWith(file1)
      })
    })

    it('handles disabled state correctly', () => {
      render(<FileUpload disabled />)
      const uploadArea = screen.getByText(/click to upload/i).closest('div')
      expect(uploadArea).toHaveClass('opacity-50', 'cursor-not-allowed')
      
      if (uploadArea) {
        fireEvent.click(uploadArea)
        // Should not trigger file selection when disabled
        expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
      }
    })
  })
}) 