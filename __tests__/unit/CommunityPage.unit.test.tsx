import { render, screen } from '@testing-library/react';
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test', email: 'test@example.com' } }),
}));
import CommunityPage from '@/app/(pages)/community/page';

describe('CommunityPage', () => {
  it('renders Community page', () => {
    render(<CommunityPage />);
    // Check for the 'Manetho' brand text in the navbar as a unique, always-present element
    expect(screen.getByText('Manetho')).toBeInTheDocument();
  });
  // Add more tests for threads, posts, comments, etc. as needed
}); 