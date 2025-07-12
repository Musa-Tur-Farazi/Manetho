import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import ChatSidebar from '../ChatSidebar';
import { customRender, mockApiResponse, mockApiError } from '../../__tests__/utils/test-utils';

// Mock console.log
console.log = jest.fn();

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ChatSidebar', () => {
  const mockUser = {
    id: 'user-123',
    fullName: 'Test User',
    email: 'test@example.com',
  };

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render search input', () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse({ users: [] }));
    customRender(<ChatSidebar />)
    expect(screen.getByPlaceholderText('Search learning partners...')).toBeInTheDocument()
  })

  it('should display loading state initially', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    customRender(<ChatSidebar />)
    // Should show loading spinner (div with animate-spin class)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  })

  it('should display learning partners when data is loaded', async () => {
    const mockUsers = [
      {
        userId: 'user-1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
    ];
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: mockUsers })); // fetchFollowingUsers
    customRender(<ChatSidebar />)
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
      expect(screen.getByText('Learning Partners')).toBeInTheDocument()
    })
  })

  it('should display empty state when no users', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: [] })); // fetchFollowingUsers
    customRender(<ChatSidebar />)
    await waitFor(() => {
      expect(screen.getByText('No learning partners yet')).toBeInTheDocument()
      expect(screen.getByText('Follow users to see them here')).toBeInTheDocument()
    })
  })

  it('should handle search functionality', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchFollowingUsers
      .mockResolvedValueOnce(mockApiResponse({ users: [] })); // searchUsers
    customRender(<ChatSidebar />)
    const searchInput = screen.getByPlaceholderText('Search learning partners...')
    fireEvent.change(searchInput, { target: { value: 'Bob' } })
    await waitFor(() => {
      expect(searchInput).toHaveValue('Bob')
      // Verify that fetch was called for search
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  it('should handle chat selection', async () => {
    const mockUsers = [
      {
        userId: 'user-1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
    ];
    
    // Mock all the API calls that will happen
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: mockUsers })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: mockUsers })) // fetchFollowingUsers
      .mockImplementation(() => mockApiResponse({ messages: [] })); // fetchMessages and any subsequent calls
    
    // Create a mock router with a jest spy
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    
    customRender(<ChatSidebar />)
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    })
    
    // Find the "Start chat" button (it's the one with the Send icon, title="Start chat")
    const chatButtons = document.querySelectorAll('button[title="Start chat"]');
    expect(chatButtons.length).toBeGreaterThan(0);
    fireEvent.click(chatButtons[0]);
    
    // Verify router was called
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith(expect.stringContaining('user-1'));
    });
  })

  it('should handle profile visits', async () => {
    const mockUsers = [
      {
        userId: 'user-1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
    ];
    
    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: mockUsers })); // fetchFollowingUsers
    
    // Create a mock router with a jest spy
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    
    customRender(<ChatSidebar />)
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    })
    
    // Find and click the profile button (it's the one with the User icon, title="Visit profile")
    const profileButtons = document.querySelectorAll('button[title="Visit profile"]');
    expect(profileButtons.length).toBeGreaterThan(0);
    fireEvent.click(profileButtons[0]);
    
    // Router should be called with the correct URL
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith('/profile/user-1');
    });
  })

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    customRender(<ChatSidebar />)
    await waitFor(() => {
      expect(screen.getByText('No learning partners yet')).toBeInTheDocument()
    })
  })

  it('should display recent conversations when available', async () => {
    const mockRecentChats = [
      {
        userId: 'user-1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
        lastMessageTime: '2024-01-01T10:00:00Z',
        lastMessage: 'Hello there!',
      },
    ];
    
    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: mockRecentChats })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: [] })); // fetchFollowingUsers
    
    customRender(<ChatSidebar />)
    
    // Wait for the component to render with data
    await waitFor(() => {
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });
  })

  it('should handle search results', async () => {
    const mockUsers = [
      {
        userId: 'user-1',
        fullName: 'John Doe',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
    ];
    
    // Mock API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchRecentChats
      .mockResolvedValueOnce(mockApiResponse({ users: [] })) // fetchFollowingUsers
      .mockResolvedValueOnce(mockApiResponse({ users: mockUsers })); // searchUsers
    
    customRender(<ChatSidebar />)
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Perform search
    const searchInput = screen.getByPlaceholderText('Search learning partners...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  })
}) 