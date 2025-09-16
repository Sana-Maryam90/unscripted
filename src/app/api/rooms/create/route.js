import { NextResponse } from 'next/server';
import { createGameSession, createPlayer, addPlayerToSession } from '../../../../lib/gameSession';
import { getMovieById } from '../../../../lib/movies';

// In-memory storage for demo (replace with Redis in production)
const gameSessions = new Map();

export async function POST(request) {
  try {
    const { movieId, mode, playerName, playerId } = await request.json();

    // Validate input
    if (!movieId || !mode || !playerName || !playerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate movie exists
    const movie = await getMovieById(movieId);
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Validate mode
    if (!['single', 'multiplayer'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid game mode' },
        { status: 400 }
      );
    }

    // Create game session
    const session = createGameSession(movieId, mode, playerId);
    
    // Create and add host player
    const hostPlayer = createPlayer(playerId, playerName);
    hostPlayer.isHost = true;
    addPlayerToSession(session, hostPlayer);

    // Store session
    gameSessions.set(session.id, session);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        roomCode: session.roomCode,
        movieId: session.movieId,
        mode: session.mode,
        state: session.state,
        players: session.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          characterId: p.characterId
        }))
      }
    });

  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

// Export the sessions map for other API routes
export { gameSessions };