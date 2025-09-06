'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TurnBasedQuizRoom from '../../components/game/TurnBasedQuizRoom';
import Button from '../../components/ui/Button';
import { getMovieByIdClient } from '../../lib/moviesClient';

// Available movies for selection
const availableMovies = [
    {
        id: 'harry-potter-1',
        title: 'Harry Potter and the Philosopher\'s Stone',
        description: 'Test your knowledge about the wizarding world'
    },
    {
        id: 'star-wars-4',
        title: 'Star Wars: A New Hope',
        description: 'Journey to a galaxy far, far away'
    },
    {
        id: 'stranger-things-1',
        title: 'Stranger Things: Season 1',
        description: 'Enter the Upside Down'
    },
    {
        id: 'bridge-to-terabithia',
        title: 'Bridge to Terabithia',
        description: 'Explore the magical kingdom'
    },
    {
        id: 'diary-of-wimpy-kid',
        title: 'Diary of a Wimpy Kid',
        description: 'Middle school adventures'
    }
];

export default function QuizGamePage() {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [movieData, setMovieData] = useState(null);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [showCharacterSelection, setShowCharacterSelection] = useState(false);
    const [loadingMovie, setLoadingMovie] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Generate or retrieve player ID (same as test-chat)
        let storedPlayerId = localStorage.getItem('playerId');
        if (!storedPlayerId) {
            storedPlayerId = 'player_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('playerId', storedPlayerId);
        }
        setPlayerId(storedPlayerId);

        // Get player name from localStorage
        const storedPlayerName = localStorage.getItem('playerName');
        if (storedPlayerName) {
            setPlayerName(storedPlayerName);
        }
    }, []);

    const loadMovieData = async (movieId) => {
        setLoadingMovie(true);
        try {
            const movie = await getMovieByIdClient(movieId);
            setMovieData(movie);
            setShowCharacterSelection(true);
        } catch (error) {
            console.error('Error loading movie:', error);
            alert('Failed to load movie data');
        } finally {
            setLoadingMovie(false);
        }
    };

    const createRoom = async () => {
        if (!playerName.trim()) {
            alert('Please enter your name');
            return;
        }
        if (!selectedMovie) {
            alert('Please select a movie');
            return;
        }

        setIsCreating(true);
        localStorage.setItem('playerName', playerName);

        // Load movie data and show character selection
        await loadMovieData(selectedMovie.id);
        setIsCreating(false);
    };

    const joinRoom = () => {
        if (!playerName.trim()) {
            alert('Please enter your name');
            return;
        }
        if (!roomCode.trim()) {
            alert('Please enter room code');
            return;
        }

        localStorage.setItem('playerName', playerName);
        // For joining, character selection will be handled in TurnBasedQuizRoom
        // if the room has a movie selected
        setIsInRoom(true);
    };

    const selectCharacter = (character) => {
        setSelectedCharacter(character);
        // Use character name as player name in the quiz room
        setPlayerName(character.name);
        localStorage.setItem('playerName', character.name);
        
        // Generate room code and enter room
        const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomCode(newRoomCode);
        setIsInRoom(true);
    };

    const leaveRoom = () => {
        setIsInRoom(false);
        setRoomCode('');
        setSelectedMovie(null);
        setSelectedCharacter(null);
        setMovieData(null);
        setShowJoinForm(false);
        setShowCharacterSelection(false);
    };

    if (isInRoom && roomCode && playerId && playerName) {
        return (
            <TurnBasedQuizRoom
                roomCode={roomCode}
                playerId={playerId}
                playerName={playerName}
                selectedMovie={selectedMovie}
                selectedCharacter={selectedCharacter}
                movieData={movieData}
                onLeave={leaveRoom}
            />
        );
    }

    // Character Selection Screen
    if (showCharacterSelection && movieData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative min-h-screen flex items-center justify-center p-4">
                    <div className="glass-card p-8 w-full max-w-4xl">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Choose Your Character
                            </h1>
                            <p className="text-gray-400 mb-4">
                                Select a character from <strong>{movieData.title}</strong> to play as in the quiz
                            </p>
                            <p className="text-sm text-gray-500">
                                Your character name will be your username in the quiz room
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {movieData.characters.map((character) => (
                                <div
                                    key={character.id}
                                    onClick={() => selectCharacter(character)}
                                    className="p-6 rounded-lg border-2 border-gray-600 bg-white/5 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer transition-all group"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">
                                                {character.name.charAt(0)}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-300">
                                            {character.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                            {character.description}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            <strong>Personality:</strong> {character.personality}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Button
                                onClick={() => setShowCharacterSelection(false)}
                                variant="secondary"
                            >
                                ← Back to Movie Selection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-8 w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Turn-Based Movie Quiz
                        </h1>
                        <p className="text-gray-400">
                            Create or join a room to play a multiplayer movie quiz game
                        </p>
                    </div>

                    {!showJoinForm ? (
                        // Create Room Form
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-4">
                                    Select a Movie
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableMovies.map((movie) => (
                                        <div
                                            key={movie.id}
                                            onClick={() => setSelectedMovie(movie)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMovie?.id === movie.id
                                                ? 'border-indigo-500 bg-indigo-500/20'
                                                : 'border-gray-600 bg-white/5 hover:border-indigo-400'
                                                }`}
                                        >
                                            <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
                                            <p className="text-gray-400 text-sm">{movie.description}</p>
                                            {selectedMovie?.id === movie.id && (
                                                <div className="mt-2">
                                                    <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">
                                                        Selected
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={createRoom}
                                    disabled={!playerName.trim() || !selectedMovie || isCreating}
                                    className="flex-1"
                                >
                                    {isCreating ? 'Creating Room...' : 'Create Quiz Room'}
                                </Button>
                                <Button
                                    onClick={() => setShowJoinForm(true)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Join Existing Room
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Join Room Form
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Room Code
                                </label>
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character room code"
                                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 font-mono text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={joinRoom}
                                    disabled={!playerName.trim() || !roomCode.trim()}
                                    className="flex-1"
                                >
                                    Join Quiz Room
                                </Button>
                                <Button
                                    onClick={() => setShowJoinForm(false)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Back to Create
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                        <p className="text-xs text-gray-500 mb-2">
                            Open multiple browser tabs/windows to test multiplayer functionality
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}