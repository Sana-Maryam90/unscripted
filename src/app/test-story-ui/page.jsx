'use client';

import StoryPage from '../../components/game/StoryPage';

export default function TestStoryUI() {
  // Mock session data for testing
  const mockSession = {
    id: 'test-session',
    roomCode: 'TEST',
    movieTitle: 'Harry Potter and the Philosopher\'s Stone',
    mode: 'single',
    players: [
      { id: 'player-1', name: 'Test Player', character: 'Harry Potter' }
    ],
    currentTurn: 'player-1',
    state: 'playing',
    storyProgress: {
      currentCheckpoint: 1,
      completedChoices: []
    }
  };

  const mockPlayer = {
    id: 'player-1',
    name: 'Test Player',
    character: 'Harry Potter'
  };

  const handleSessionUpdate = (updatedSession) => {
    console.log('Session updated:', updatedSession);
  };

  return (
    <StoryPage 
      session={mockSession}
      currentPlayer={mockPlayer}
      onSessionUpdate={handleSessionUpdate}
    />
  );
}