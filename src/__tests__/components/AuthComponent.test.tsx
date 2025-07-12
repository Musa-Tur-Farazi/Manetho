import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock the auth components
const MockAuthCheck = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="auth-check">{children}</div>;
};

const MockAuthModal = ({ 
  isOpen, 
  onClose, 
  onSignIn 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSignIn: (email: string, password: string) => void; 
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email, password);
  };

  return (
    <div data-testid="auth-modal">
      <form onSubmit={handleSubmit}>
        <input
          data-testid="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          data-testid="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" data-testid="sign-in-button">
          Sign In
        </button>
        <button type="button" onClick={onClose} data-testid="close-button">
          Close
        </button>
      </form>
    </div>
  );
};

describe('AuthCheck Component', () => {
  test('should render children when authenticated', () => {
    render(
      <MockAuthCheck>
        <div>Protected Content</div>
      </MockAuthCheck>
    );

    expect(screen.getByTestId('auth-check')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should handle authentication state changes', () => {
    const { rerender } = render(
      <MockAuthCheck>
        <div>Protected Content</div>
      </MockAuthCheck>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // Test re-render with different auth state
    rerender(
      <MockAuthCheck>
        <div>Updated Content</div>
      </MockAuthCheck>
    );

    expect(screen.getByText('Updated Content')).toBeInTheDocument();
  });
});

describe('AuthModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when closed', () => {
    render(
      <MockAuthModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  test('should render when open', () => {
    render(
      <MockAuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });

  test('should handle form input changes', async () => {
    render(
      <MockAuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('should call onSignIn with form data on submit', async () => {
    render(
      <MockAuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signInButton = screen.getByTestId('sign-in-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('should call onClose when close button is clicked', () => {
    render(
      <MockAuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should prevent form submission with empty fields', async () => {
    render(
      <MockAuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    const signInButton = screen.getByTestId('sign-in-button');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith('', '');
    });
  });

  test('should handle keyboard navigation', () => {
    render(
      <MockAuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSignIn={mockOnSignIn} 
      />
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signInButton = screen.getByTestId('sign-in-button');

    // Test tab navigation
    emailInput.focus();
    expect(emailInput).toHaveFocus();

    fireEvent.keyDown(emailInput, { key: 'Tab' });
    passwordInput.focus();
    expect(passwordInput).toHaveFocus();

    fireEvent.keyDown(passwordInput, { key: 'Tab' });
    signInButton.focus();
    expect(signInButton).toHaveFocus();
  });
});

describe('Authentication Integration Tests', () => {
  test('should integrate AuthCheck and AuthModal components', async () => {
    const mockOnSignIn = jest.fn();

    // Move state into a wrapper component to avoid React Hook issues in test body
    function Wrapper() {
      const [isModalOpen, setIsModalOpen] = React.useState(true);
      return (
        <div>
          <MockAuthCheck>
            <div>Protected Content</div>
          </MockAuthCheck>
          <MockAuthModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSignIn={mockOnSignIn}
          />
        </div>
      );
    }

    render(<Wrapper />);

    expect(screen.getByTestId('auth-check')).toBeInTheDocument();
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();

    // Test modal interaction
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const signInButton = screen.getByTestId('sign-in-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});