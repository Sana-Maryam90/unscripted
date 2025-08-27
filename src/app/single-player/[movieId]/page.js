'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const movieData = {
  'harry-potter-1': {
    title: 'Harry Potter and the Philosopher\'s Stone',
    characters: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Draco Malfoy']
  },
  'star-wars-4': {
    title: 'Star Wars: A New Hope',
    characters: ['Luke Skywalker', 'Princess Leia', 'Han Solo', 'Darth Vader']
  },
  'lotr-1': {
    title: 'The Lord of the Rings: Fellowship',
    characters: ['Frodo Baggins', 'Gandalf', 'Aragorn', 'Boromir']
  }
};

export default function SinglePlayerGamePage() {
  const params = useParams();
  const movieId = params.movieId;
  const movie = movieData[movieId];
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Movie Not Found</h1>
          <Link href="/single-player" className="text-blue-300 hover:text-white">
            ← Back to Movie Selection
          </Link>
        </div>
      </div>
    );
  }

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl font-bold mb-4">Starting Your Adventure</h1>
          <p className="text-xl text-blue-200 mb-2">
            {movie.title}
          </p>
          <p className="text-lg text-blue-300 mb-8">
            Playing as: {selectedCharacter}
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/single-player" className="text-blue-300 hover:text-white mb-4 inline-block">
            ← Back to Movies
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            {movie.title}
          </h1>
          <p className="text-xl text-blue-200">
            Choose your character to begin the story
          </p>
        </div>

        {/* Character Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Select Your Character
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {movie.characters.map((character, index) => (
              <div
                key={character}
                onClick={() => setSelectedCharacter(character)}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCharacter === character 
                    ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400' 
                    : 'border-white/20 hover:bg-white/20'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {index === 0 ? '⚡' : index === 1 ? '📚' : index === 2 ? '🗡️' : '👑'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {character}
                  </h3>
                  <p className="text-blue-200 text-sm">
                    Experience the story from {character}'s perspective
                  </p>
                  {selectedCharacter === character && (
                    <div className="mt-4">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
                        Selected
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Game Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Game Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-2">Single Player Mode</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>✓ Play at your own pace</li>
                  <li>✓ Make choices for all characters</li>
                  <li>✓ No time pressure</li>
                  <li>✓ Save and resume anytime</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">AI-Powered Story</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>✓ Dynamic story generation</li>
                  <li>✓ Multiple story paths</li>
                  <li>✓ Character-driven choices</li>
                  <li>✓ Unique alternate endings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              disabled={!selectedCharacter}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
            >
              {selectedCharacter ? `Start as ${selectedCharacter}` : 'Select a Character'}
            </button>
            <p className="text-blue-200 text-sm mt-2">
              {selectedCharacter 
                ? 'Ready to begin your cinematic adventure!' 
                : 'Choose a character to start playing'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}