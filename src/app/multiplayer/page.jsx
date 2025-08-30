'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import MovieSection from '../../components/game/MovieSection';

// Mock movie data for selection
const availableMovies = [
  {
    id: 'harry-potter-1',
    title: 'Harry Potter and the Philosopher\'s Stone',
    description: 'Join Harry on his magical journey to Hogwarts and discover alternate paths in the wizarding world.',
    poster: '/images/moviePosters/Harry Potter.jpg',
    characters: [
      { id: 'harry', name: 'Harry Potter' },
      { id: 'hermione', name: 'Hermione Granger' },
      { id: 'ron', name: 'Ron Weasley' },
      { id: 'hagrid', name: 'Hagrid' }
    ]
  },
  {
    id: 'star-wars-4',
    title: 'Star Wars: A New Hope',
    description: 'Experience the galaxy far, far away and reshape the destiny of the Rebel Alliance.',
    poster: '/images/moviePosters/Star Wars.jpg',
    characters: [
      { id: 'luke', name: 'Luke Skywalker' },
      { id: 'leia', name: 'Princess Leia' },
      { id: 'han', name: 'Han Solo' },
      { id: 'obi-wan', name: 'Obi-Wan Kenobi' }
    ]
  },
  {
    id: 'stranger-things-1',
    title: 'Stranger Things: Season 1',
    description: 'Enter the Upside Down and help the kids of Hawkins face supernatural horrors.',
    poster: '/images/moviePosters/Stranger Things.jpg',
    characters: [
      { id: 'eleven', name: 'Eleven' },
      { id: 'mike', name: 'Mike Wheeler' },
      { id: 'dustin', name: 'Dustin Henderson' },
      { id: 'joyce', name: 'Joyce Byers' }
    ]
  }
];

export default function MultiplayerPage() {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [creating, setCreating] = useState(false);

  const createRoom = async () => {
    if (!selectedMovie || !playerName.trim()) return;

    setCreating(true);
    
    try {
      // Generate unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store player info in localStorage for room page
      localStorage.setItem('playerInfo', JSON.stringify({
        id: playerId,
        name: playerName.trim()
      }));
      
      // For now, create mock room (Socket.io integration in next step)
      const mockRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      // Redirect to room
      router.push(`/room/${mockRoomCode}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />
      
      <main className="relative pt-32 pb-20">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Create Multiplayer Room
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose a movie and create a room for up to 4 players to collaborate on an epic storytelling adventure
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Step 1: Movie Selection */}
            <Card variant="glass" className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 1: Choose Your Movie
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableMovies.map((movie) => (
                  <Card
                    key={movie.id}
                    variant="glass"
                    className={`p-0 overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedMovie?.id === movie.id ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedMovie(movie)}
                  >
                    {/* Movie Poster */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                        </svg>
                      </div>
                      {selectedMovie?.id === movie.id && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Selected
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {movie.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {movie.description}
                      </p>
                      
                      {/* Characters Preview */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Characters:</span>
                        <div className="flex -space-x-2">
                          {movie.characters.slice(0, 3).map((character, index) => (
                            <div
                              key={character.id}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white/20 flex items-center justify-center"
                              title={character.name}
                            >
                              <span className="text-xs text-white font-medium">
                                {character.name.charAt(0)}
                              </span>
                            </div>
                          ))}
                          {movie.characters.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-white/20 flex items-center justify-center">
                              <span className="text-xs text-white">+{movie.characters.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Step 2: Player Setup */}
            <Card variant="glass" className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 2: Enter Your Name
              </h2>
              
              <div className="max-w-md mx-auto">
                <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={20}
                />
                <p className="text-gray-400 text-sm mt-2">
                  This name will be visible to other players in your room
                </p>
              </div>
            </Card>

            {/* Step 3: Create Room */}
            <Card variant="glass" className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 3: Create Your Room
              </h2>
              
              {selectedMovie && playerName.trim() ? (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to Create:</h3>
                    <p className="text-gray-300">
                      <strong>{selectedMovie.title}</strong> room for <strong>{playerName}</strong>
                    </p>
                  </div>
                  
                  <Button 
                    size="xl" 
                    onClick={createRoom}
                    disabled={creating}
                    loading={creating}
                    className="min-w-64"
                  >
                    {creating ? 'Creating Room...' : 'Create Multiplayer Room'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Please complete the steps above to create your room
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className={`flex items-center space-x-2 ${selectedMovie ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${selectedMovie ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span>Movie Selected</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${playerName.trim() ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${playerName.trim() ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span>Name Entered</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Alternative Actions */}
            <div className="text-center mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/join" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">
                    Join Existing Room
                  </Button>
                </Link>
                <Link href="/single-player" className="flex-1">
                  <Button variant="ghost" size="lg" className="w-full text-gray-400 hover:text-white">
                    Play Solo Instead
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}