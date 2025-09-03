'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TurnBasedQuizRoom from '../../components/game/TurnBasedQuizRoom';
import Button from '../../components/ui/Button';

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
    const [isInRoom, setIsInRoom] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
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

    const createRoom = () => {
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

        // Generate room code (same pattern as test-chat)
        const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomCode(newRoomCode);
        setIsInRoom(true);
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
        setIsInRoom(true);
    };

    const leaveRoom = () => {
        setIsInRoom(false);
        setRoomCode('');
        setSelectedMovie(null);
        setShowJoinForm(false);
    };

    if (isInRoom && roomCode && playerId && playerName) {
        return (
            <TurnBasedQuizRoom
                roomCode={roomCode}
                playerId={playerId}
                playerName={playerName}
                selectedMovie={selectedMovie}
                onLeave={leaveRoom}
            />
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