import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import FileUpload from '../FileUpload'

// Build dummy uploaded file data
const uploadedFile = {
  id: 'file123',
  name: 'demo.pdf',
  size: 1024 * 1024,
  type: 'application/pdf',
  url: 'https://example.com/demo.pdf',
  downloadUrl: 'https://example.com/download/demo.pdf',
}

const mockDeleteFile = jest.fn(() => Promise.resolve(true))

// Mock useFileUpload so component renders in "uploaded" state
jest.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploading: false,
    error: null,
    uploadedFile,
    uploadFile: jest.fn(),
    deleteFile: mockDeleteFile,
    reset: jest.fn(),
  }),
}))

describe('FileUpload – delete flow', () => {
  it('invokes deleteFile and onFileRemoved callback', async () => {
    const onFileRemoved = jest.fn()
    render(<FileUpload onFileRemoved={onFileRemoved} showPreview />)

    // Grab the buttons rendered inside preview (preview, download, remove)
    const buttons = screen.getAllByRole('button')
    const removeBtn = buttons[buttons.length - 1]
    fireEvent.click(removeBtn)

    await waitFor(() => {
      expect(mockDeleteFile).toHaveBeenCalledWith(uploadedFile.id)
      expect(onFileRemoved).toHaveBeenCalled()
    })
  })
}) 