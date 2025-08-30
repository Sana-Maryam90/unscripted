'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
      // socket?.disconnect();
    };
  }, []);

  const createRoom = (movieId, mode, playerName, playerId) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('create-room', { movieId, mode, playerName, playerId });
      
      socket.once('room-created', (data) => {
        resolve(data);
      });
      
      socket.once('error', (error) => {
        reject(error);
      });
    });
  };

  const joinRoom = (roomCode, playerName, playerId) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('join-room', { roomCode, playerName, playerId });
      
      socket.once('session-updated', (session) => {
        resolve(session);
      });
      
      socket.once('error', (error) => {
        reject(error);
      });
    });
  };

  const selectCharacter = (roomId, playerId, characterId) => {
    if (socket) {
      socket.emit('select-character', { roomId, playerId, characterId });
    }
  };

  const startCharacterSelection = (roomId) => {
    if (socket) {
      socket.emit('start-character-selection', { roomId });
    }
  };

  const startStory = (roomId) => {
    if (socket) {
      socket.emit('start-story', { roomId });
    }
  };

  const makeChoice = (roomId, playerId, choice) => {
    if (socket) {
      socket.emit('make-choice', { roomId, playerId, choice });
    }
  };

  const onSessionUpdate = (callback) => {
    if (socket) {
      socket.on('session-updated', callback);
      return () => socket.off('session-updated', callback);
    }
  };

  return {
    socket,
    isConnected,
    createRoom,
    joinRoom,
    selectCharacter,
    startCharacterSelection,
    startStory,
    makeChoice,
    onSessionUpdate
  };
};