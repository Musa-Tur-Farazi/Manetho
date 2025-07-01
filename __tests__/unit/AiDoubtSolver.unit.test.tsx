import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiDoubtSolver from '@/components/homepage/AiDoubtSolver';

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test', email: 'test@example.com' } }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ reply: 'This is a mock AI response.' }),
  })
) as jest.Mock;

describe('AiDoubtSolver', () => {
  it('renders collapsed by default', () => {
    render(<AiDoubtSolver />);
    expect(screen.getByText(/AI Study Assistant/i)).toBeInTheDocument();
    // Input should not be in the document when collapsed
    expect(screen.queryByPlaceholderText('Ask any question about your studies...')).toBeNull();
  });

  it('shows input when expanded', () => {
    render(<AiDoubtSolver expanded />);
    expect(screen.getByPlaceholderText('Ask any question about your studies...')).toBeInTheDocument();
  });

  it('renders and sends a message, showing AI reply', async () => {
    render(<AiDoubtSolver expanded />);
    const input = screen.getByPlaceholderText('Ask any question about your studies...');
    fireEvent.change(input, { target: { value: 'What is AI?' } });
    const sendButton = screen.getByLabelText('send');
    fireEvent.click(sendButton);
    await waitFor(() =>
      expect(screen.getByText('This is a mock AI response.')).toBeInTheDocument()
    );
  });

  it('clears input when clear button is clicked', () => {
    render(<AiDoubtSolver expanded />);
    const input = screen.getByPlaceholderText('Ask any question about your studies...');
    fireEvent.change(input, { target: { value: 'test question' } });
    expect(input).toHaveValue('test question');
    const clearButton = screen.getByLabelText('clear');
    fireEvent.click(clearButton);
    expect(input).toHaveValue('');
  });

  it('shows loading when submitting', async () => {
    render(<AiDoubtSolver expanded />);
    const input = screen.getByPlaceholderText(/Ask any question/i);
    fireEvent.change(input, { target: { value: 'test question' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  // Add more tests for conversation updates, error handling, etc.
}); 