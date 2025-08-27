import { NextResponse } from 'next/server';
import { generateRoomCode } from '../../../../lib/utils';

export async function POST(request) {
  try {
    const { movieId, mode } = await request.json();
    
    if (!movieId || !mode) {
      return NextResponse.json(
        { error: 'Movie ID and mode are required' },
        { status: 400 }
      );
    }

    // Generate a unique room code
    const roomCode = generateRoomCode();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real app, you'd save this to Redis/database
    const roomData = {
      id: roomId,
      code: roomCode,
      movieId,
      mode,
      players: [],
      status: 'waiting',
      createdAt: new Date().toISOString(),
      maxPlayers: mode === 'multiplayer' ? 4 : 1
    };

    console.log('Created room:', roomData);

    return NextResponse.json({
      roomId,
      roomCode,
      message: 'Room created successfully'
    });

  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}