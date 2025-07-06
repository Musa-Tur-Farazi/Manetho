import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnlineUsers from '../OnlineUsers';
import { customRender, mockApiResponse, mockApiError } from '../../__tests__/utils/test-utils';

// Mock console.log
console.log = jest.fn();

// Mock fetch
global.fetch = jest.fn();

describe('OnlineUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    customRender(<OnlineUsers />);
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render online users when data is available', async () => {
    const mockUsers = [
      {
        userId: '1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
        lastActiveAt: '2024-01-01T10:00:00Z',
        status: 'online',
        currentActivity: 'Studying Mathematics'
      },
      {
        userId: '2',
        fullName: 'Jane Smith',
        avatarUrl: 'https://example.com/avatar2.jpg',
        lastActiveAt: '2024-01-01T09:30:00Z',
        status: 'away',
        currentActivity: 'Working on Physics'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({ users: mockUsers }));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Studying Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Working on Physics')).toBeInTheDocument();
    });
  });

  it('should render empty state when no users are online', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({ users: [] }));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText('No users online')).toBeInTheDocument();
      expect(screen.getByText('Check back later')).toBeInTheDocument();
    });
  });

  it('should handle chat button click', async () => {
    const mockUsers = [
      {
        userId: '1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
        lastActiveAt: '2024-01-01T10:00:00Z',
        status: 'online',
        currentActivity: 'Studying Mathematics'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({ users: mockUsers }));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const chatButton = screen.getByTitle('Start chat');
    fireEvent.click(chatButton);

    // Should trigger chat action (console.log in this case)
    expect(console.log).toHaveBeenCalledWith('Starting chat with user:', '1');
  });

  it('should handle follow button click', async () => {
    const mockUsers = [
      {
        userId: '1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
        lastActiveAt: '2024-01-01T10:00:00Z',
        status: 'online',
        currentActivity: 'Studying Mathematics'
      }
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: mockUsers })) // fetchOnlineUsers
      .mockResolvedValueOnce(mockApiResponse({ success: true })); // followUser

    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const followButton = screen.getByTitle('Follow user');
    fireEvent.click(followButton);

    // Should trigger follow action
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/community/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: '1',
          action: 'follow',
        }),
      });
    });
  });

  it('should display user activity correctly', async () => {
    const mockUsers = [
      {
        userId: '1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
        lastActiveAt: '2024-01-01T10:00:00Z',
        status: 'online',
        currentActivity: 'Studying Mathematics'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({ users: mockUsers }));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText('Studying Mathematics')).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText('No users online')).toBeInTheDocument();
    });
  });

  it('should show status indicators', async () => {
    const mockUsers = [
      {
        userId: '1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
        lastActiveAt: '2024-01-01T10:00:00Z',
        status: 'online',
        currentActivity: 'Studying Mathematics'
      },
      {
        userId: '2',
        fullName: 'Jane Smith',
        avatarUrl: 'https://example.com/avatar2.jpg',
        lastActiveAt: '2024-01-01T09:30:00Z',
        status: 'away',
        currentActivity: 'Working on Physics'
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({ users: mockUsers }));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      // Check for the green status indicator for online user
      const onlineIndicator = document.querySelector('.bg-green-500');
      expect(onlineIndicator).toBeInTheDocument();
      
      // Check for the yellow status indicator for away user
      const awayIndicator = document.querySelector('.bg-yellow-500');
      expect(awayIndicator).toBeInTheDocument();
    });
  });

  it('should show view all button when many users are online', async () => {
    const mockUsers = Array.from({ length: 12 }, (_, i) => ({
      userId: `${i}`,
      fullName: `User ${i}`,
      avatarUrl: `https://example.com/avatar${i}.jpg`,
      lastActiveAt: '2024-01-01T10:00:00Z',
      status: 'online',
      currentActivity: 'Studying'
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({ users: mockUsers }));
    customRender(<OnlineUsers />);

    await waitFor(() => {
      expect(screen.getByText(/View All Online/)).toBeInTheDocument();
      expect(screen.getByText(/17\+/)).toBeInTheDocument(); // 12 + 5
    });
  });
}); 