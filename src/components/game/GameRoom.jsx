'use client';

import { useState, useEffect } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';
import WaitingRoom from './WaitingRoom';
import CharacterSelection from './CharacterSelection';
import StoryProgression from './StoryProgression';
import GameComplete from './GameComplete';

const GameRoom = ({ session, playerId, onSessionUpdate }) => {
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    const player = session?.players?.find(p => p.id === playerId);
    setCurrentPlayer(player);
  }, [session, playerId]);

  if (!session || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <p className="text-white">Loading...</p>
        </Card>
      </div>
    );
  }

  // Render different components based on game state
  switch (session.state) {
    case 'waiting':
      return (
        <WaitingRoom 
          session={session}
          currentPlayer={currentPlayer}
          onSessionUpdate={onSessionUpdate}
        />
      );
    
    case 'character_selection':
      return (
        <CharacterSelection 
          session={session}
          currentPlayer={currentPlayer}
          onSessionUpdate={onSessionUpdate}
        />
      );
    
    case 'in_progress':
      return (
        <StoryProgression 
          session={session}
          currentPlayer={currentPlayer}
          onSessionUpdate={onSessionUpdate}
        />
      );
    
    case 'completed':
      return (
        <GameComplete 
          session={session}
          currentPlayer={currentPlayer}
        />
      );
    
    case 'paused':
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Container>
            <Card variant="glass" className="p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Game Paused</h2>
              <p className="text-gray-300 mb-6">
                Waiting for players to reconnect...
              </p>
              <div className="animate-pulse">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </Card>
          </Container>
        </div>
      );
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Container>
            <Card variant="glass" className="p-8 text-center max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">Unknown Game State</h2>
              <p className="text-gray-300 mb-6">
                Something went wrong. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </Card>
          </Container>
        </div>
      );
  }
};

export default GameRoom;