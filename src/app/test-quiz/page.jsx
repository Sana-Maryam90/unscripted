'use client';

import { useState, useEffect } from 'react';
import { getMovieByIdClient } from '../../lib/moviesClient';
import Button from '../../components/ui/Button';

export default function TestQuizPage() {
    const [movieData, setMovieData] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadMovie = async () => {
        setLoading(true);
        try {
            const movie = await getMovieByIdClient('harry-potter-1');
            setMovieData(movie);
            console.log('Movie data loaded:', movie);
        } catch (error) {
            console.error('Error loading movie:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectCharacter = (character) => {
        setSelectedCharacter(character);
        console.log('Character selected:', character);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Quiz Game Character Selection Test</h1>
                
                <div className="mb-8">
                    <Button onClick={loadMovie} disabled={loading}>
                        {loading ? 'Loading...' : 'Load Harry Potter Movie Data'}
                    </Button>
                </div>

                {movieData && (
                    <div className="glass-card p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">{movieData.title}</h2>
                        <p className="text-gray-300 mb-6">{movieData.description}</p>
                        
                        <h3 className="text-xl font-semibold text-white mb-4">Available Characters:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {movieData.characters.map((character) => (
                                <div
                                    key={character.id}
                                    onClick={() => selectCharacter(character)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedCharacter?.id === character.id
                                            ? 'border-indigo-500 bg-indigo-500/20'
                                            : 'border-gray-600 bg-white/5 hover:border-indigo-400'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">
                                                {character.name.charAt(0)}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-semibold mb-2">{character.name}</h4>
                                        <p className="text-gray-400 text-sm mb-2">{character.description}</p>
                                        <p className="text-gray-500 text-xs">{character.personality}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedCharacter && (
                            <div className="mt-6 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
                                <h4 className="text-lg font-semibold text-indigo-300 mb-2">Selected Character:</h4>
                                <p className="text-white font-medium">{selectedCharacter.name}</p>
                                <p className="text-gray-300 text-sm">{selectedCharacter.description}</p>
                                <p className="text-gray-400 text-xs mt-2">
                                    <strong>Personality:</strong> {selectedCharacter.personality}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}