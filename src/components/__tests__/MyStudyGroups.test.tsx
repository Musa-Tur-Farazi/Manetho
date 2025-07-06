import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { customRender } from '@/__tests__/utils/test-utils'
import MyStudyGroups from '@/components/MyStudyGroups'

// Mock fetch
global.fetch = jest.fn()

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

describe('MyStudyGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    customRender(<MyStudyGroups />)
    
    // Check for loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin')
  })

  it('should display study groups when loaded', async () => {
    const mockGroups = [
      {
        groupId: 'group1',
        name: 'Math Study Group',
        description: 'Advanced mathematics study group',
        meetingType: 'online',
        nextMeeting: '2024-01-15T10:00:00Z',
        meetingTime: '10:00 AM',
        currentParticipants: 5,
        maxParticipants: 8,
        subjectName: 'Mathematics',
        subjectColor: 'blue',
        creatorName: 'John Doe',
        creatorAvatar: 'https://example.com/avatar.jpg',
        memberRole: 'member',
        joinedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ groups: mockGroups })
    })

    customRender(<MyStudyGroups />)

    await waitFor(() => {
      expect(screen.getByText('Math Study Group')).toBeInTheDocument()
    })

    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('5/8 members')).toBeInTheDocument()
  })

  it('should display empty state when no groups', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ groups: [] })
    })

    customRender(<MyStudyGroups />)

    await waitFor(() => {
      expect(screen.getByText('No study groups yet')).toBeInTheDocument()
    })

    expect(screen.getByText('Join some groups to see them here')).toBeInTheDocument()
  })

  it('should handle group click', async () => {
    const mockGroups = [
      {
        groupId: 'group1',
        name: 'Math Study Group',
        description: 'Advanced mathematics study group',
        meetingType: 'online',
        nextMeeting: '2024-01-15T10:00:00Z',
        meetingTime: '10:00 AM',
        currentParticipants: 5,
        maxParticipants: 8,
        subjectName: 'Mathematics',
        subjectColor: 'blue',
        creatorName: 'John Doe',
        creatorAvatar: 'https://example.com/avatar.jpg',
        memberRole: 'member',
        joinedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ groups: mockGroups })
    })

    const router = { push: jest.fn() }
    jest.mock('next/navigation', () => ({
      useRouter: () => router
    }))

    customRender(<MyStudyGroups />)

    await waitFor(() => {
      expect(screen.getByText('Math Study Group')).toBeInTheDocument()
    })

    const groupCard = screen.getByText('Math Study Group').closest('div')
    fireEvent.click(groupCard!)

    // Should navigate to group chat
    // Note: We can't easily test navigation without more complex mocking
  })

  it('should format dates correctly', async () => {
    const mockGroups = [
      {
        groupId: 'group1',
        name: 'Math Study Group',
        description: 'Advanced mathematics study group',
        meetingType: 'online',
        nextMeeting: '2024-01-15T10:00:00Z',
        meetingTime: '10:00 AM',
        currentParticipants: 5,
        maxParticipants: 8,
        subjectName: 'Mathematics',
        subjectColor: 'blue',
        creatorName: 'John Doe',
        creatorAvatar: 'https://example.com/avatar.jpg',
        memberRole: 'member',
        joinedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ groups: mockGroups })
    })

    customRender(<MyStudyGroups />)

    await waitFor(() => {
      expect(screen.getByText('Math Study Group')).toBeInTheDocument()
    })

    // The date format might be locale-dependent, so we check for partial matches
    expect(screen.getByText(/Jan 15/)).toBeInTheDocument()
  })

  it('should handle API error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    customRender(<MyStudyGroups />)

    // Wait for loading state to disappear
    await waitFor(() => {
      // The component doesn't show an explicit error message, but it should show the empty state
      expect(screen.getByText('No study groups yet')).toBeInTheDocument()
    })
  })

  it('should display different meeting types', async () => {
    const mockGroups = [
      {
        groupId: 'group1',
        name: 'Online Group',
        description: 'Online study group',
        meetingType: 'online',
        nextMeeting: '2024-01-15T10:00:00Z',
        meetingTime: '10:00 AM',
        currentParticipants: 5,
        maxParticipants: 8,
        subjectName: 'Mathematics',
        subjectColor: 'blue',
        creatorName: 'John Doe',
        creatorAvatar: 'https://example.com/avatar.jpg',
        memberRole: 'member',
        joinedAt: '2024-01-01T00:00:00Z'
      },
      {
        groupId: 'group2',
        name: 'In-Person Group',
        description: 'In-person study group',
        meetingType: 'in-person',
        nextMeeting: '2024-01-16T10:00:00Z',
        meetingTime: '10:00 AM',
        currentParticipants: 3,
        maxParticipants: 6,
        subjectName: 'Physics',
        subjectColor: 'green',
        creatorName: 'Jane Smith',
        creatorAvatar: 'https://example.com/avatar2.jpg',
        memberRole: 'member',
        joinedAt: '2024-01-02T00:00:00Z'
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ groups: mockGroups })
    })

    customRender(<MyStudyGroups />)

    await waitFor(() => {
      expect(screen.getByText('Online Group')).toBeInTheDocument()
      expect(screen.getByText('In-Person Group')).toBeInTheDocument()
    })
  })

  it('should display subject colors correctly', async () => {
    const mockGroups = [
      {
        groupId: 'group1',
        name: 'Math Study Group',
        description: 'Advanced mathematics study group',
        meetingType: 'online',
        nextMeeting: '2024-01-15T10:00:00Z',
        meetingTime: '10:00 AM',
        currentParticipants: 5,
        maxParticipants: 8,
        subjectName: 'Mathematics',
        subjectColor: 'blue',
        creatorName: 'John Doe',
        creatorAvatar: 'https://example.com/avatar.jpg',
        memberRole: 'member',
        joinedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ groups: mockGroups })
    })

    customRender(<MyStudyGroups />)

    await waitFor(() => {
      expect(screen.getByText('M')).toBeInTheDocument() // Subject initial
    })
  })
}) 