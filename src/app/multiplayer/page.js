'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MultiplayerPage() {
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (movieId) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, mode: 'multiplayer' })
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/room/${data.roomCode}`;
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      window.location.href = `/room/${roomCode.toUpperCase()}`;
    }
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
            Multiplayer Mode
          </h1>
          <p className="text-xl text-blue-200">
            Create a room or join an existing one
          </p>
        </div>

        {/* Join Room Section */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Join Existing Room
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter room code (e.g. ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                maxLength={6}
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Create Room Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Or Create New Room
          </h2>
          <p className="text-blue-200 text-center mb-12">
            Choose a movie to start a new multiplayer session
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Movie 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
              <div className="aspect-[3/4] bg-gradient-to-b from-red-600 to-yellow-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <div className="text-sm font-medium">Movie Poster</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Harry Potter and the Philosopher's Stone
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  A young wizard discovers his magical heritage and begins his journey at Hogwarts.
                </p>
                <div className="flex justify-between text-xs text-blue-300 mb-4">
                  <span>Fantasy</span>
                  <span>4 characters</span>
                </div>
                <button
                  onClick={() => handleCreateRoom('harry-potter-1')}
                  disabled={isCreating}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>

            {/* Movie 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
              <div className="aspect-[3/4] bg-gradient-to-b from-black to-blue-900 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="text-sm font-medium">Movie Poster</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Star Wars: A New Hope
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  A young farm boy joins a rebellion against an evil galactic empire.
                </p>
                <div className="flex justify-between text-xs text-blue-300 mb-4">
                  <span>Sci-Fi</span>
                  <span>4 characters</span>
                </div>
                <button
                  onClick={() => handleCreateRoom('star-wars-4')}
                  disabled={isCreating}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>

            {/* Movie 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
              <div className="aspect-[3/4] bg-gradient-to-b from-green-800 to-yellow-700 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">💍</div>
                  <div className="text-sm font-medium">Movie Poster</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  The Lord of the Rings: Fellowship
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  A hobbit inherits a mysterious ring and must embark on a perilous journey.
                </p>
                <div className="flex justify-between text-xs text-blue-300 mb-4">
                  <span>Fantasy</span>
                  <span>4 characters</span>
                </div>
                <button
                  onClick={() => handleCreateRoom('lotr-1')}
                  disabled={isCreating}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}