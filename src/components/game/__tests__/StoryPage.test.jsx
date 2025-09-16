import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoryPage from '../StoryPage';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
  useInView: () => true,
}));

// Mock components
vi.mock('../ui/Container', () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>
}));

vi.mock('../ui/Button', () => ({
  default: ({ children, onClick, disabled, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('../ui/Card', () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>
}));

describe('StoryPage Enhanced UI with Advanced Animations', () => {
  const mockSession = {
    id: 'test-session',
    roomCode: 'TEST',
    movieTitle: 'Test Movie',
    mode: 'single',
    currentTurn: 'player-1',
    players: [
      { id: 'player-1', name: 'Test Player' }
    ],
    storyProgress: {
      currentCheckpoint: 0,
      completedChoices: []
    }
  };

  const mockPlayer = {
    id: 'player-1',
    name: 'Test Player'
  };

  const mockOnSessionUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders story page with animated background elements', () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Check for main story container
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Room: TEST')).toBeInTheDocument();
  });

  it('displays base content with proper animations', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Wait for base content to appear
    await waitFor(() => {
      expect(screen.getByText(/The Great Hall of Hogwarts/)).toBeInTheDocument();
    });
  });

  it('shows choice selection with animations when it is player turn', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Wait for choices to appear
    await waitFor(() => {
      expect(screen.getByText('Choose Your Path')).toBeInTheDocument();
    });

    // Check for choice buttons
    expect(screen.getByText(/Step forward boldly/)).toBeInTheDocument();
    expect(screen.getByText(/Wait nervously/)).toBeInTheDocument();
    expect(screen.getByText(/Try to catch Harry Potter's eye/)).toBeInTheDocument();
  });

  it('handles choice selection with proper animations', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Wait for choices to appear
    await waitFor(() => {
      expect(screen.getByText('Choose Your Path')).toBeInTheDocument();
    });

    // Click on first choice
    const firstChoice = screen.getByText(/Step forward boldly/);
    fireEvent.click(firstChoice);

    // Check that loading state appears
    await waitFor(() => {
      expect(screen.getByText(/Weaving your choice into the story/)).toBeInTheDocument();
    });
  });

  it('displays turn indicator with proper animations', () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Check for turn indicator
    expect(screen.getByText('Your Turn')).toBeInTheDocument();
  });

  it('shows waiting state when not player turn', () => {
    const waitingSession = {
      ...mockSession,
      currentTurn: 'other-player',
      players: [
        { id: 'player-1', name: 'Test Player' },
        { id: 'other-player', name: 'Other Player' }
      ]
    };

    render(
      <StoryPage 
        session={waitingSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    expect(screen.getByText(/Waiting for Other Player/)).toBeInTheDocument();
  });

  it('applies correct CSS classes for enhanced dark theme', () => {
    const { container } = render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Check for dark theme background classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('bg-gradient-to-br');
    expect(mainContainer).toHaveClass('from-gray-900');
    expect(mainContainer).toHaveClass('via-black');
    expect(mainContainer).toHaveClass('to-gray-800');
  });

  it('renders roadmap-style layout with alternating content', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/The Great Hall of Hogwarts/)).toBeInTheDocument();
    });

    // Check for grid layout classes
    const { container } = render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    const gridElements = container.querySelectorAll('[class*="grid-cols"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('displays proper paragraph content without squared boxes', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    await waitFor(() => {
      const contentElement = screen.getByText(/The Great Hall of Hogwarts/);
      // Check that content is in proper paragraph format
      expect(contentElement.tagName).toBe('P');
      expect(contentElement.closest('.prose')).toBeInTheDocument();
    });
  });

  it('shows enhanced choice buttons with letter indicators', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Choose Your Path')).toBeInTheDocument();
    });

    // Check for letter indicators A, B, C
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('handles story progression with staggered animations', async () => {
    render(
      <StoryPage 
        session={mockSession}
        currentPlayer={mockPlayer}
        onSessionUpdate={mockOnSessionUpdate}
      />
    );

    // Wait for initial content
    await waitFor(() => {
      expect(screen.getByText(/The Great Hall of Hogwarts/)).toBeInTheDocument();
    });

    // Make a choice to trigger story progression
    const firstChoice = screen.getByText(/Step forward boldly/);
    fireEvent.click(firstChoice);

    // Verify session update was called
    await waitFor(() => {
      expect(mockOnSessionUpdate).toHaveBeenCalled();
    });
  });
});