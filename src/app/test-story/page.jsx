'use client';

import { useState } from 'react';
import StoryPage from '../../components/game/StoryPage';

export default function TestStoryPage() {
  const [session, setSession] = useState({
    id: 'test-session',
    roomCode: 'TEST',
    movieTitle: 'Harry Potter and the Philosopher\'s Stone',
    movieId: 'harry-potter-1',
    mode: 'single',
    state: 'playing',
    currentTurn: 'player-1',
    players: [
      {
        id: 'player-1',
        name: 'Test Player',
        characterId: 'harry',
        isHost: true
      }
    ],
    storyProgress: {
      currentCheckpoint: 0,
      completedChoices: []
    }
  });

  const currentPlayer = {
    id: 'player-1',
    name: 'Test Player',
    characterId: 'harry'
  };

  const handleSessionUpdate = (updatedSession) => {
    setSession(updatedSession);
    console.log('Session updated:', updatedSession);
  };

  return (
    <StoryPage 
      session={session}
      currentPlayer={currentPlayer}
      onSessionUpdate={handleSessionUpdate}
    />
  );
}