'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatRoom from '../../components/game/ChatRoom';
import Button from '../../components/ui/Button';

export default function TestChatPage() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Generate or retrieve player ID
    let storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      storedPlayerId = 'player_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('playerId', storedPlayerId);
    }
    setPlayerId(storedPlayerId);

    // Get player name from localStorage or prompt
    const storedPlayerName = localStorage.getItem('playerName');
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
    }
  }, []);

  const createRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsCreating(true);
    localStorage.setItem('playerName', playerName);
    
    // Generate room code
    const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomCode(newRoomCode);
    setIsInRoom(true);
    setIsCreating(false);
  };

  const joinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter room code');
      return;
    }

    localStorage.setItem('playerName', playerName);
    setIsInRoom(true);
  };

  const leaveRoom = () => {
    setIsInRoom(false);
    setRoomCode('');
  };

  if (isInRoom && roomCode && playerId && playerName) {
    return (
      <ChatRoom 
        roomCode={roomCode}
        playerId={playerId}
        playerName={playerName}
        onLeave={leaveRoom}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Real-time Chat Test
          </h1>
          <p className="text-gray-400">
            Test multiplayer functionality with real-time chat
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={createRoom}
              disabled={!playerName.trim() || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">or</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Button
            onClick={joinRoom}
            disabled={!playerName.trim() || !roomCode.trim()}
            variant="secondary"
            className="w-full"
          >
            Join Room
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Open multiple browser tabs/windows to test multiplayer
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}