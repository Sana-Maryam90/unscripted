'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';

const WaitingRoom = ({ session, currentPlayer, onSessionUpdate }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(session.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const startCharacterSelection = () => {
    // Mock function - in real app this would call API
    const updatedSession = {
      ...session,
      state: 'character_selection'
    };
    onSessionUpdate(updatedSession);
  };

  const leaveRoom = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Game Room
          </h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
              <span className="text-gray-300 text-sm">Room Code:</span>
              <span className="text-white font-mono text-lg ml-2">{session.roomCode}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyRoomCode}
              className="text-purple-400 hover:text-white"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Movie Info */}
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Selected Movie</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-4 h-48 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {session.movieId === 'harry-potter-1' ? 'Harry Potter and the Philosopher\'s Stone' : 'Loading...'}
                </h3>
                <p className="text-gray-300 text-sm">
                  Join Harry on his magical journey to Hogwarts and discover alternate paths in the wizarding world.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {session.mode === 'single' ? 'Single Player' : 'Multiplayer'}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  45-60 min
                </span>
              </div>
            </div>
          </Card>

          {/* Players */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Players ({session.players.length}/{session.maxPlayers})
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Waiting</span>
              </div>
            </div>

            <div className="space-y-3">
              {session.players.map((player, index) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{player.name}</span>
                        {player.isHost && (
                          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                            Host
                          </span>
                        )}
                        {player.id === currentPlayer.id && (
                          <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-400 text-xs">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: session.maxPlayers - session.players.length }).map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10 border-dashed opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-400">Waiting for player...</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            {currentPlayer.isHost ? (
              <Button 
                size="lg" 
                onClick={startCharacterSelection}
                disabled={session.players.length === 0}
                className="flex-1"
              >
                Start Game
              </Button>
            ) : (
              <div className="flex-1 p-3 bg-white/10 rounded-xl border border-white/20 text-center">
                <span className="text-gray-300">Waiting for host to start the game...</span>
              </div>
            )}
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={leaveRoom}
              className="flex-1"
            >
              Leave Room
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Card variant="glass" className="mt-8 p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <p><strong className="text-white">Choose Characters:</strong> Each player selects a character perspective</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <p><strong className="text-white">Make Choices:</strong> Take turns making decisions that shape the story</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <p><strong className="text-white">Watch Story Unfold:</strong> AI generates unique content based on your choices</p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default WaitingRoom;