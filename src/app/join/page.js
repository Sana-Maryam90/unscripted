'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function JoinPage() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !playerName.trim()) {
      alert('Please enter both room code and your name');
      return;
    }

    setIsJoining(true);
    
    // Simulate joining room
    setTimeout(() => {
      window.location.href = `/room/${roomCode.toUpperCase()}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-blue-300 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Join Game Room
          </h1>
          <p className="text-xl text-blue-200">
            Enter the room code to join your friends
          </p>
        </div>

        {/* Join Form */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div>
                <label htmlFor="playerName" className="block text-white font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  maxLength={20}
                  required
                />
              </div>

              <div>
                <label htmlFor="roomCode" className="block text-white font-medium mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character room code"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-center text-lg"
                  maxLength={6}
                  required
                />
                <p className="text-blue-300 text-xs mt-1">
                  Example: ABC123
                </p>
              </div>

              <button
                type="submit"
                disabled={isJoining || !roomCode.trim() || !playerName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Joining Room...</span>
                  </>
                ) : (
                  <span>Join Room</span>
                )}
              </button>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <h3 className="text-white font-medium mb-4">Need Help?</h3>
            <div className="space-y-2 text-blue-200 text-sm">
              <p>• Ask your friend for the 6-character room code</p>
              <p>• Make sure you enter your name</p>
              <p>• Room codes are case-insensitive</p>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/multiplayer" 
                className="text-blue-300 hover:text-white underline"
              >
                Or create your own room
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}