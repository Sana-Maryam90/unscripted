import { NextResponse } from 'next/server';
import { createPlayer, addPlayerToSession } from '../../../../lib/gameSession';

// Import the sessions map from create route
import { gameSessions } from '../create/route';

export async function POST(request) {
  try {
    const { roomCode, playerName, playerId } = await request.json();

    // Validate input
    if (!roomCode || !playerName || !playerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find session by room code
    let targetSession = null;
    for (const [sessionId, session] of gameSessions.entries()) {
      if (session.roomCode === roomCode.toUpperCase()) {
        targetSession = session;
        break;
      }
    }

    if (!targetSession) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room is full
    if (targetSession.players.length >= targetSession.maxPlayers) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      );
    }

    // Check if game has already started
    if (targetSession.state === 'in_progress') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Create and add player
    const newPlayer = createPlayer(playerId, playerName);
    addPlayerToSession(targetSession, newPlayer);

    return NextResponse.json({
      success: true,
      session: {
        id: targetSession.id,
        roomCode: targetSession.roomCode,
        movieId: targetSession.movieId,
        mode: targetSession.mode,
        state: targetSession.state,
        players: targetSession.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          characterId: p.characterId
        }))
      }
    });

  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join room' },
      { status: 500 }
    );
  }
}