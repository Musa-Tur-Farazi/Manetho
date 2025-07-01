import { render, screen } from '@testing-library/react';
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test', email: 'test@example.com' } }),
}));
import CommunityPage from '@/app/(pages)/community/page';

describe('CommunityPage (integration)', () => {
  it('renders Community page for authenticated user', () => {
    render(<CommunityPage />);
    expect(screen.getByText('Manetho')).toBeInTheDocument();
  });
}); 