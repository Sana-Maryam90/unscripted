'use client';

import { useState } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Container from '../ui/Container';
import Button from '../ui/Button';
import StoryPage from './StoryPage';

export default function SinglePlayerGame({ movie, onBack }) {
  const [gameState, setGameState] = useState('character-selection');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize story session when character is selected (no room logic for single-player)
  const initializeStorySession = async (character) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a unique session ID for solo play (not a room)
      const sessionId = `solo-session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Initialize story with AI via new solo API
      const response = await fetch('/api/story/solo/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          movieId: movie.id,
          character: character.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize story');
      }

      const { storyState } = await response.json();
      
      // Create session object compatible with StoryPage (no room logic)
      const newSession = {
        id: sessionId,
        movieTitle: movie.title,
        movieId: movie.id,
        mode: 'single',
        state: 'playing',
        currentTurn: 'player-1',
        players: [
          {
            id: 'player-1',
            name: 'Solo Player',
            characterId: character.id,
            characterName: character.name,
            isHost: true
          }
        ],
        storyProgress: {
          currentCheckpoint: 0,
          completedChoices: []
        },
        storyState,
        isSoloMode: true // Flag to indicate this is not a room-based session
      };

      setSession(newSession);
      setGameState('playing');
    } catch (err) {
      console.error('Error initializing story:', err);
      setError(err.message || 'Failed to initialize story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    initializeStorySession(character);
  };

  const handleSessionUpdate = (updatedSession) => {
    setSession(updatedSession);
    console.log('Solo session updated:', updatedSession);
  };

  if (gameState === 'character-selection') {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="pt-32 pb-20">
          <Container>
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Choose Your Character
              </h1>
              <p className="text-xl text-gray-300">
                Select which character's perspective you want to experience in {movie.title}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="text-red-300 text-center">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300">Initializing your story with AI...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {movie.characters.map((character) => (
                  <div
                    key={character.id} 
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 hover:bg-gray-700/50 hover:border-purple-500/50"
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {character.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {character.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {character.description}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {character.traits?.map((trait, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button variant="outline" onClick={onBack}>
                Back to Movie Selection
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // If we have a session and are playing, use the enhanced StoryPage
  if (gameState === 'playing' && session) {
    const currentPlayer = {
      id: 'player-1',
      name: 'Solo Player',
      characterId: selectedCharacter?.id,
      characterName: selectedCharacter?.name
    };

    return (
      <StoryPage 
        session={session}
        currentPlayer={currentPlayer}
        onSessionUpdate={handleSessionUpdate}
        onBack={onBack}
        isSoloMode={true}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="pt-32 pb-20">
          <Container>
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your story...</p>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="pt-32 pb-20">
          <Container>
            <div className="text-center">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-red-300 mb-4">Story Error</h2>
                <p className="text-red-300 mb-6">{error}</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setError(null)}>Try Again</Button>
                  <Button variant="outline" onClick={onBack}>Back to Movies</Button>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen relative">
      <Header />
      <main className="pt-32 pb-20">
        <Container>
          <div className="text-center">
            <p className="text-gray-300">Something went wrong. Please try again.</p>
            <Button onClick={onBack} className="mt-4">Back to Movies</Button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}