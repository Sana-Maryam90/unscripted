'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Container from '../ui/Container';
import Button from '../ui/Button';

export default function SimpleSinglePlayerGame({ movie, onBack }) {
  const [gameState, setGameState] = useState('character-selection');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const [choices, setChoices] = useState([]);
  const [storyHistory, setStoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle character selection and start the game
  const handleCharacterSelect = async (character) => {
    setSelectedCharacter(character);
    setIsLoading(true);
    setError(null);

    try {
      // Initialize the story directly without sessions
      const response = await fetch('/api/story/simple/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          character: character.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start story');
      }

      const { baseContent, initialChoices } = await response.json();
      
      setStoryContent(baseContent);
      setChoices(initialChoices);
      setStoryHistory([{ type: 'story', content: baseContent }]);
      setGameState('playing');
      
    } catch (err) {
      console.error('Error starting story:', err);
      setError('Failed to start the story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle choice selection
  const handleChoiceSelect = async (choice) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/story/simple/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          character: selectedCharacter.name,
          choice: choice.text,
          storyHistory: storyHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to continue story');
      }

      const { nextContent, nextChoices } = await response.json();
      
      // Update story history
      const newHistory = [
        ...storyHistory,
        { type: 'choice', content: choice.text, character: selectedCharacter.name },
        { type: 'story', content: nextContent }
      ];
      
      setStoryHistory(newHistory);
      setStoryContent(nextContent);
      setChoices(nextChoices);
      
    } catch (err) {
      console.error('Error continuing story:', err);
      setError('Failed to continue the story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Character Selection Screen
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
                <p className="text-gray-300">Starting your adventure...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {movie.characters.map((character) => (
                  <motion.div
                    key={character.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-gray-700/50 hover:border-purple-500/50"
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
                      {character.traits && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {character.traits.map((trait, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
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

  // Game Playing Screen
  if (gameState === 'playing') {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="pt-32 pb-20">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Movie and Character Info */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {movie.title}
                </h1>
                <p className="text-lg text-purple-300">
                  Playing as {selectedCharacter?.name}
                </p>
              </div>

              {/* Story Content */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-8">
                <div className="prose prose-invert max-w-none">
                  {storyHistory.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.3 }}
                      className={`mb-6 ${entry.type === 'choice' ? 'text-purple-300 italic' : 'text-gray-100'}`}
                    >
                      {entry.type === 'choice' && (
                        <span className="text-sm text-purple-400 block mb-1">
                          {entry.character} chose:
                        </span>
                      )}
                      <p className="leading-relaxed">{entry.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Choices */}
              {choices.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    What do you do next?
                  </h3>
                  <AnimatePresence>
                    {choices.map((choice, index) => (
                      <motion.div
                        key={choice.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full text-left p-6 h-auto whitespace-normal"
                          onClick={() => handleChoiceSelect(choice)}
                          disabled={isLoading}
                        >
                          <span className="block text-lg">{choice.text}</span>
                          {choice.reasoning && (
                            <span className="block text-sm text-gray-400 mt-2">
                              {choice.reasoning}
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-300">Generating your story...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-center">{error}</p>
                </div>
              )}

              {/* Controls */}
              <div className="text-center mt-12">
                <Button variant="outline" onClick={onBack}>
                  End Game
                </Button>
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