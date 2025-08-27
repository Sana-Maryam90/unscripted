'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.code;
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Simulate joining room
    setPlayers([
      { id: '1', name: 'You', isHost: true },
    ]);
    setIsHost(true);
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl font-bold mb-4">Game Starting...</h1>
          <p className="text-xl text-blue-200">
            Preparing your cinematic adventure
          </p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/multiplayer" className="text-blue-300 hover:text-white mb-4 inline-block">
            ← Back to Multiplayer
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Room: {roomCode}
          </h1>
          <p className="text-xl text-blue-200">
            Waiting for players to join...
          </p>
        </div>

        {/* Room Info */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Players List */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Players ({players.length}/4)
              </h2>
              <div className="space-y-4">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{player.name}</span>
                    </div>
                    {player.isHost && (
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-medium">
                        Host
                      </span>
                    )}
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: 4 - players.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center space-x-3 bg-white/5 rounded-lg p-4 border-2 border-dashed border-white/20">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-gray-300">?</span>
                    </div>
                    <span className="text-gray-400">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Room Settings</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Room Code:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-lg bg-white/20 px-3 py-1 rounded">
                      {roomCode}
                    </span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(roomCode)}
                      className="text-blue-300 hover:text-white"
                      title="Copy room code"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Game Mode:</span>
                  <span className="text-white">Multiplayer</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Max Players:</span>
                  <span className="text-white">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Status:</span>
                  <span className="text-yellow-400">Waiting</span>
                </div>
              </div>

              {/* Share Room */}
              <div className="mt-8 p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <h3 className="text-white font-medium mb-2">Invite Friends</h3>
                <p className="text-blue-200 text-sm mb-3">
                  Share this room code with your friends:
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      alert('Room link copied to clipboard!');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      const text = `Join my Unscripted game! Room code: ${roomCode}`;
                      if (navigator.share) {
                        navigator.share({ title: 'Unscripted Game', text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert('Invite message copied to clipboard!');
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          {isHost && (
            <div className="text-center mt-12">
              <button
                onClick={handleStartGame}
                disabled={players.length < 1}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                {players.length < 2 ? 'Waiting for Players...' : 'Start Game'}
              </button>
              <p className="text-blue-200 text-sm mt-2">
                {players.length < 2 
                  ? 'Need at least 2 players to start' 
                  : 'All players ready! Click to begin the adventure.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}