'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PhaserGameRoom from '../../../components/game/PhaserGameRoom';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const roomCode = params.code;

  useEffect(() => {
    // Get player info from localStorage
    const playerName = localStorage.getItem('playerName');
    const currentRoomCode = localStorage.getItem('currentRoomCode');

    if (!playerName) {
      // Redirect to quiz-game page if no player info
      router.push('/quiz-game');
      return;
    }

    if (currentRoomCode !== roomCode) {
      // Update current room code
      localStorage.setItem('currentRoomCode', roomCode);
    }

    // Generate or get player ID
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = 'player_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('playerId', playerId);
    }

    setPlayerInfo({
      id: playerId,
      name: playerName,
      roomCode
    });

    setIsLoading(false);
  }, [roomCode, router]);

  const handleLeaveRoom = () => {
    router.push('/quiz-game');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading room {roomCode}...</p>
        </div>
      </div>
    );
  }

  if (!playerInfo) {
    return null;
  }

  return (
    <PhaserGameRoom
      roomCode={roomCode}
      playerId={playerInfo.id}
      playerName={playerInfo.name}
      onLeave={handleLeaveRoom}
    />
  );
}