import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/ui/PageHeader';

describe('PageHeader Component', () => {
  it('renders correctly with title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    render(<PageHeader title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
