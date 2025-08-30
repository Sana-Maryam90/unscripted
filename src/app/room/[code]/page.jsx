'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Container from '../../../components/ui/Container';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import GameRoom from '../../../components/game/GameRoom';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code;

  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);

  useEffect(() => {
    // Get player info from localStorage
    const storedPlayerInfo = localStorage.getItem('playerInfo');
    if (storedPlayerInfo) {
      const info = JSON.parse(storedPlayerInfo);
      setPlayerInfo(info);
      
      // Check if session already exists in sessionStorage (shared across tabs)
      const sessionKey = `session_${roomCode.toUpperCase()}`;
      let existingSession = null;
      
      try {
        const storedSession = sessionStorage.getItem(sessionKey);
        if (storedSession) {
          existingSession = JSON.parse(storedSession);
        }
      } catch (e) {
        console.log('No existing session found');
      }
      
      if (existingSession) {
        // Add player to existing session if not already there
        const playerExists = existingSession.players.some(p => p.id === info.id);
        if (!playerExists) {
          existingSession.players.push({
            id: info.id,
            name: info.name,
            isHost: false,
            characterId: null
          });
          sessionStorage.setItem(sessionKey, JSON.stringify(existingSession));
        }
        setGameSession(existingSession);
      } else {
        // Create new session
        const mockSession = {
          id: `session_${roomCode}`,
          roomCode: roomCode.toUpperCase(),
          movieId: 'harry-potter-1',
          mode: 'multiplayer',
          state: 'waiting',
          players: [
            {
              id: info.id,
              name: info.name,
              isHost: true,
              characterId: null
            }
          ],
          currentTurn: null,
          storyProgress: {
            currentCheckpoint: 0,
            completedChoices: [],
            generatedContent: []
          }
        };
        
        sessionStorage.setItem(sessionKey, JSON.stringify(mockSession));
        setGameSession(mockSession);
      }
    } else {
      // No player info, redirect to join page
      router.push('/join');
      return;
    }
    
    setLoading(false);
  }, [roomCode, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading game room...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Container>
          <Card variant="glass" className="p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">Room Not Found</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push('/join')} className="flex-1">
                Try Another Code
              </Button>
              <Button variant="secondary" onClick={() => router.push('/')} className="flex-1">
                Back to Home
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative">
        <GameRoom 
          session={gameSession}
          playerId={playerInfo?.id}
          onSessionUpdate={setGameSession}
        />
      </main>
    </div>
  );
}