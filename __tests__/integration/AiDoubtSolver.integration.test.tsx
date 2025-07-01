import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiDoubtSolver from '@/components/homepage/AiDoubtSolver';

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test', email: 'test@example.com' } }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ reply: 'Integration test AI reply.' }),
  })
) as jest.Mock;

describe('AiDoubtSolver (integration, with mocks)', () => {
  it('sends a message and receives a reply', async () => {
    render(<AiDoubtSolver expanded />);
    const input = screen.getByPlaceholderText('Ask any question about your studies...');
    fireEvent.change(input, { target: { value: 'Integration test?' } });
    const sendButton = screen.getByLabelText('send');
    fireEvent.click(sendButton);
    await waitFor(() =>
      expect(screen.getByText('Integration test AI reply.')).toBeInTheDocument()
    );
  });
}); 