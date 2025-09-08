// Game session management utilities

/**
 * Game session states
 */
export const GAME_STATES = {
  WAITING: 'waiting',           // Waiting for players to join
  CHARACTER_SELECTION: 'character_selection', // Players selecting characters
  IN_PROGRESS: 'in_progress',   // Game is active
  PAUSED: 'paused',            // Game paused (player disconnected)
  COMPLETED: 'completed',       // Story finished
  ABANDONED: 'abandoned'        // All players left
};

/**
 * Player states
 */
export const PLAYER_STATES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CHOOSING: 'choosing',         // Currently making a choice
  WAITING: 'waiting'           // Waiting for turn
};

/**
 * Create a new game session
 */
export function createGameSession(movieId, mode = 'multiplayer', hostPlayerId) {
  return {
    id: generateSessionId(),
    roomCode: generateRoomCode(),
    movieId,
    mode, // 'single' | 'multiplayer'
    state: GAME_STATES.WAITING,
    hostPlayerId,
    players: [],
    maxPlayers: mode === 'single' ? 1 : 4,
    currentTurn: null,
    turnIndex: 0,
    storyProgress: {
      currentCheckpoint: 0,
      completedChoices: [],
      generatedContent: [],
      alternateScript: '',
      branchingPath: []
    },
    settings: {
      turnTimeLimit: 300000, // 5 minutes in milliseconds
      autoProgressOnTimeout: true,
      allowSpectators: false
    },
    createdAt: new Date(),
    lastActivity: new Date()
  };
}

/**
 * Create a player object
 */
export function createPlayer(playerId, playerName, socketId = null) {
  return {
    id: playerId,
    name: playerName,
    socketId,
    characterId: null,
    state: PLAYER_STATES.CONNECTED,
    isHost: false,
    joinedAt: new Date(),
    lastSeen: new Date(),
    choicesMade: 0,
    score: 0 // For future scoring system
  };
}

/**
 * Add player to session
 */
export function addPlayerToSession(session, player) {
  // Check if session is full
  if (session.players.length >= session.maxPlayers) {
    throw new Error('Session is full');
  }

  // Check if player already exists
  const existingPlayer = session.players.find(p => p.id === player.id);
  if (existingPlayer) {
    // Update existing player (reconnection)
    existingPlayer.state = PLAYER_STATES.CONNECTED;
    existingPlayer.socketId = player.socketId;
    existingPlayer.lastSeen = new Date();
    return session;
  }

  // Add new player
  session.players.push(player);
  session.lastActivity = new Date();

  // If this is the first player and no host is set, make them host
  if (session.players.length === 1 && !session.hostPlayerId) {
    player.isHost = true;
    session.hostPlayerId = player.id;
  }

  return session;
}

/**
 * Remove player from session
 */
export function removePlayerFromSession(session, playerId) {
  const playerIndex = session.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return session;

  const removedPlayer = session.players[playerIndex];
  
  // If removing current turn player, advance turn
  if (session.currentTurn === playerId) {
    session = advanceTurn(session);
  }

  // Remove player
  session.players.splice(playerIndex, 1);
  session.lastActivity = new Date();

  // If host left, assign new host
  if (removedPlayer.isHost && session.players.length > 0) {
    session.players[0].isHost = true;
    session.hostPlayerId = session.players[0].id;
  }

  // If no players left, mark as abandoned
  if (session.players.length === 0) {
    session.state = GAME_STATES.ABANDONED;
  }

  return session;
}

/**
 * Start character selection phase
 */
export function startCharacterSelection(session) {
  if (session.players.length === 0) {
    throw new Error('No players in session');
  }

  session.state = GAME_STATES.CHARACTER_SELECTION;
  session.lastActivity = new Date();
  
  return session;
}

/**
 * Assign character to player
 */
export function assignCharacterToPlayer(session, playerId, characterId) {
  const player = session.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  // Check if character is already taken (in multiplayer)
  if (session.mode === 'multiplayer') {
    const characterTaken = session.players.some(p => p.characterId === characterId && p.id !== playerId);
    if (characterTaken) {
      throw new Error('Character already taken');
    }
  }

  player.characterId = characterId;
  session.lastActivity = new Date();

  return session;
}

/**
 * Check if all players have selected characters
 */
export function allPlayersHaveCharacters(session) {
  return session.players.every(player => player.characterId !== null);
}

/**
 * Start the game (story progression)
 */
export function startGame(session) {
  if (!allPlayersHaveCharacters(session)) {
    throw new Error('Not all players have selected characters');
  }

  session.state = GAME_STATES.IN_PROGRESS;
  session.currentTurn = session.players[0].id;
  session.turnIndex = 0;
  session.lastActivity = new Date();

  return session;
}

/**
 * Advance to next player's turn
 */
export function advanceTurn(session) {
  if (session.mode === 'single') {
    // In single player, same player always has the turn
    return session;
  }

  // Find next active player
  const activePlayers = session.players.filter(p => p.state === PLAYER_STATES.CONNECTED);
  if (activePlayers.length === 0) {
    session.state = GAME_STATES.PAUSED;
    return session;
  }

  session.turnIndex = (session.turnIndex + 1) % activePlayers.length;
  session.currentTurn = activePlayers[session.turnIndex].id;
  session.lastActivity = new Date();

  return session;
}

/**
 * Process a player's choice
 */
export function processPlayerChoice(session, playerId, choiceId, checkpointId) {
  // Validate it's the player's turn (or single player mode)
  if (session.mode === 'multiplayer' && session.currentTurn !== playerId) {
    throw new Error('Not your turn');
  }

  const player = session.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  // Record the choice
  const choice = {
    id: generateChoiceId(),
    checkpointId,
    playerId,
    characterId: player.characterId,
    choiceId,
    timestamp: new Date()
  };

  session.storyProgress.completedChoices.push(choice);
  session.storyProgress.branchingPath.push(choiceId);
  player.choicesMade++;
  session.lastActivity = new Date();

  // Advance turn for multiplayer
  if (session.mode === 'multiplayer') {
    session = advanceTurn(session);
  }

  return session;
}

/**
 * Add generated content to session
 */
export function addGeneratedContent(session, content) {
  const contentItem = {
    id: generateContentId(),
    type: content.type, // 'text' | 'image'
    content: content.content,
    context: content.context,
    checkpointId: content.checkpointId,
    timestamp: new Date()
  };

  session.storyProgress.generatedContent.push(contentItem);
  session.lastActivity = new Date();

  return session;
}

/**
 * Complete the game session
 */
export function completeGame(session) {
  session.state = GAME_STATES.COMPLETED;
  session.currentTurn = null;
  session.lastActivity = new Date();

  return session;
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate room code
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate choice ID
 */
function generateChoiceId() {
  return `choice_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Generate content ID
 */
function generateContentId() {
  return `content_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}