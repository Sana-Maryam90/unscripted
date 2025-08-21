// Application constants
export const GAME_CONFIG = {
  MAX_PLAYERS_PER_ROOM: 4,
  ROOM_CODE_LENGTH: 6,
  TURN_TIMEOUT: 300000, // 5 minutes in milliseconds
  MAX_STORY_CHECKPOINTS: 10,
  AI_GENERATION_TIMEOUT: 30000, // 30 seconds
};

export const GAME_MODES = {
  SINGLE_PLAYER: 'single',
  MULTIPLAYER: 'multiplayer',
};

export const GAME_STATES = {
  WAITING: 'waiting',
  CHARACTER_SELECTION: 'character_selection',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  PLAYER_DISCONNECTED: 'player-disconnected',
  STORY_UPDATE: 'story-update',
  STORY_UPDATED: 'story-updated',
  TURN_CHANGE: 'turn-change',
  TURN_CHANGED: 'turn-changed',
  CHOICE_MADE: 'choice-made',
  CHOICE_RECEIVED: 'choice-received',
};

export const API_ENDPOINTS = {
  CREATE_ROOM: '/api/rooms/create',
  JOIN_ROOM: '/api/rooms/join',
  GET_ROOM: '/api/rooms',
  UPDATE_ROOM: '/api/rooms/update',
  GET_MOVIES: '/api/movies',
  GET_MOVIE: '/api/movies',
  PROCESS_CHOICE: '/api/game/choice',
  GENERATE_CONTENT: '/api/ai/generate',
};