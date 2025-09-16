'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const joinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      setError('Please enter both room code and your name');
      return;
    }

    if (roomCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setJoining(true);
    setError('');
    
    try {
      // Generate unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store player info in localStorage for room page
      localStorage.setItem('playerInfo', JSON.stringify({
        id: playerId,
        name: playerName.trim()
      }));
      
      // For demo, accept any 6-character code
      const cleanCode = roomCode.toUpperCase().trim();
      
      // Redirect to room
      router.push(`/room/${cleanCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please check the room code and try again.');
      setJoining(false);
    }
  };

  const handleRoomCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(value);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  // Demo room codes for testing
  const demoRoomCodes = ['DEMO01', 'TEST42', 'PLAY99'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />
      
      <main className="relative pt-32 pb-20">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Join a Game
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Enter a room code to join your friends' storytelling adventure
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card variant="glass" className="p-8 mb-6">
              <div className="w-16 h-16 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={20}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div>
                  <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={handleRoomCodeChange}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-widest"
                    maxLength={6}
                    onKeyPress={handleKeyPress}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Ask your friend for the 6-character room code
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={joinRoom}
                  disabled={joining || !roomCode.trim() || !playerName.trim()}
                  loading={joining}
                >
                  {joining ? 'Joining Room...' : 'Join Game'}
                </Button>
                
                <div className="text-center">
                  <span className="text-gray-400 text-sm">Don't have a code? </span>
                  <Link href="/quiz-game" className="text-purple-400 hover:text-purple-300 text-sm">
                    Create a room
                  </Link>
                </div>
              </div>
            </Card>

            {/* Demo Room Codes */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 text-center">
                Try Demo Rooms
              </h3>
              <p className="text-gray-300 text-sm text-center mb-4">
                Use these codes to test the multiplayer functionality
              </p>
              <div className="grid grid-cols-3 gap-2">
                {demoRoomCodes.map((code) => (
                  <Button
                    key={code}
                    variant="secondary"
                    size="sm"
                    className="font-mono"
                    onClick={() => {
                      setRoomCode(code);
                      if (!playerName.trim()) {
                        setPlayerName('Demo Player');
                      }
                    }}
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}