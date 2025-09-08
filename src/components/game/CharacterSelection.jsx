'use client';

import { useState, useEffect } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getMovieByIdClient } from '../../lib/moviesClient';

const CharacterSelection = ({ session, currentPlayer, onSessionUpdate }) => {
  const [movie, setMovie] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(currentPlayer.characterId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const movieData = await getMovieByIdClient(session.movieId);
        setMovie(movieData);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [session.movieId]);

  const selectCharacter = (characterId) => {
    // Check if character is already taken in multiplayer
    if (session.mode === 'multiplayer') {
      const characterTaken = session.players.some(p => 
        p.characterId === characterId && p.id !== currentPlayer.id
      );
      if (characterTaken) return;
    }

    setSelectedCharacter(characterId);
    
    // Update session (mock - in real app this would call API/Socket)
    const updatedSession = {
      ...session,
      players: session.players.map(p => 
        p.id === currentPlayer.id 
          ? { ...p, characterId }
          : p
      )
    };
    onSessionUpdate(updatedSession);
  };

  const startGame = () => {
    // Check if all players have characters
    const allHaveCharacters = session.players.every(p => p.characterId);
    if (!allHaveCharacters) return;

    // Start the game (mock - in real app this would call API/Socket)
    const updatedSession = {
      ...session,
      state: 'in_progress',
      currentTurn: session.players[0].id,
      storyProgress: {
        ...session.storyProgress,
        currentCheckpoint: 0
      }
    };
    onSessionUpdate(updatedSession);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading characters...</p>
        </Card>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <p className="text-white">Movie not found</p>
        </Card>
      </div>
    );
  }

  const allPlayersHaveCharacters = session.players.every(p => p.characterId);

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your Character
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Select which character's perspective you want to play from in <strong>{movie.title}</strong>
          </p>
        </div>

        {/* Room Info */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
            <span className="text-gray-300 text-sm">Room:</span>
            <span className="text-white font-mono text-lg ml-2">{session.roomCode}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
            <span className="text-gray-300 text-sm">Mode:</span>
            <span className="text-white ml-2 capitalize">{session.mode} Player</span>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {movie.characters.map((character) => {
            const isSelected = selectedCharacter === character.id;
            const isTaken = session.mode === 'multiplayer' && 
              session.players.some(p => p.characterId === character.id && p.id !== currentPlayer.id);
            const takenBy = isTaken ? 
              session.players.find(p => p.characterId === character.id)?.name : null;

            return (
              <Card
                key={character.id}
                variant="glass"
                className={`p-0 overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-purple-500 scale-105' : 
                  isTaken ? 'opacity-50 cursor-not-allowed' : 
                  'hover:scale-105'
                }`}
                onClick={() => !isTaken && selectCharacter(character.id)}
              >
                {/* Character Avatar */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {character.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Selected
                    </div>
                  )}
                  {isTaken && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Taken
                    </div>
                  )}
                </div>

                {/* Character Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {character.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {character.description}
                  </p>
                  
                  {/* Personality Traits */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Personality:</span>
                    <p className="text-xs text-gray-300 mt-1">{character.personality}</p>
                  </div>

                  {/* Taken By */}
                  {isTaken && (
                    <div className="text-center">
                      <span className="text-red-400 text-sm">Chosen by {takenBy}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Players Status */}
        <Card variant="glass" className="p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Player Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {session.players.map((player) => (
              <div 
                key={player.id}
                className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm truncate">{player.name}</span>
                    {player.id === currentPlayer.id && (
                      <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {player.characterId ? (
                      <span className="text-green-400">
                        Playing as {movie.characters.find(c => c.id === player.characterId)?.name}
                      </span>
                    ) : (
                      <span className="text-yellow-400">Choosing character...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="text-center">
          {currentPlayer.isHost ? (
            <Button 
              size="lg" 
              onClick={startGame}
              disabled={!allPlayersHaveCharacters}
              className="min-w-48"
            >
              {allPlayersHaveCharacters ? 'Start Story' : 'Waiting for all players...'}
            </Button>
          ) : (
            <div className="p-4 bg-white/10 rounded-xl border border-white/20 inline-block">
              <span className="text-gray-300">
                {selectedCharacter ? 'Waiting for host to start the story...' : 'Please select a character'}
              </span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card variant="glass" className="mt-8 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Character Selection Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="text-white font-medium mb-2">Single Player Mode:</h4>
              <ul className="space-y-1">
                <li>• Choose any character you want to play as</li>
                <li>• You'll make all decisions from their perspective</li>
                <li>• Story will focus on your character's journey</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Multiplayer Mode:</h4>
              <ul className="space-y-1">
                <li>• Each player chooses a different character</li>
                <li>• Take turns making decisions for your character</li>
                <li>• Collaborate to create a unique story together</li>
              </ul>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default CharacterSelection;