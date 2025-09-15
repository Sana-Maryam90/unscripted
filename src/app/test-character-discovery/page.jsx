'use client';

import { useState, useEffect } from 'react';
import CharacterAssetDiscovery from '../../services/CharacterAssetDiscovery';

export default function TestCharacterDiscovery() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState(null);

    useEffect(() => {
        async function loadCharacters() {
            try {
                setLoading(true);
                const discoveredCharacters = await CharacterAssetDiscovery.getAvailableCharacters('wizarding');
                setCharacters(discoveredCharacters);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to load characters:', err);
            } finally {
                setLoading(false);
            }
        }

        loadCharacters();
    }, []);

    const handleCharacterSelect = async (characterId) => {
        try {
            const characterData = await CharacterAssetDiscovery.getCharacterData('wizarding', characterId);
            setSelectedCharacter(characterData);
        } catch (err) {
            console.error('Failed to get character data:', err);
        }
    };

    const testFrameCount = async (characterId, action) => {
        try {
            const frameCount = await CharacterAssetDiscovery.calculateFrameCount(
                `/assets/wizarding/player_characters/${characterId}/${action}.png`
            );
            alert(`${characterId} ${action}: ${frameCount} frames`);
        } catch (err) {
            alert(`Error calculating frames: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Character Asset Discovery Test</h1>
                    <div className="text-center">Loading characters...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Character Asset Discovery Test</h1>
                    <div className="text-red-400">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Character Asset Discovery Test</h1>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Discovered Characters ({characters.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {characters.map((character) => (
                            <div
                                key={character.id}
                                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700"
                                onClick={() => handleCharacterSelect(character.id)}
                            >
                                <h3 className="font-semibold text-lg">{character.name}</h3>
                                <p className="text-gray-400">ID: {character.id}</p>
                                <p className="text-gray-400">World: {character.world}</p>
                                <p className="text-gray-400">Actions: {character.availableActions.length}</p>
                                <div className="mt-2">
                                    <div className="text-sm text-gray-300">Available Actions:</div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {character.availableActions.map((action) => (
                                            <span
                                                key={action}
                                                className="bg-blue-600 text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    testFrameCount(character.id, action);
                                                }}
                                            >
                                                {action}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedCharacter && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Selected Character Details</h2>
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg mb-4">{selectedCharacter.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>ID:</strong> {selectedCharacter.id}</p>
                                    <p><strong>World:</strong> {selectedCharacter.world}</p>
                                    <p><strong>Actions:</strong> {selectedCharacter.availableActions.length}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Sprite Frame Data:</h4>
                                    {Object.entries(selectedCharacter.spriteFrames || {}).map(([action, frameData]) => (
                                        <div key={action} className="text-sm">
                                            <strong>{action}:</strong> {frameData.frameCount} frames
                                            ({frameData.frameSize.width}x{frameData.frameSize.height}px)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Service Tests</h2>
                    <div className="space-y-2">
                        <button
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded mr-2"
                            onClick={async () => {
                                const exists = await CharacterAssetDiscovery.characterExists('wizarding', 'female_wizard_1');
                                alert(`female_wizard_1 exists: ${exists}`);
                            }}
                        >
                            Test Character Exists (female_wizard_1)
                        </button>

                        <button
                            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded mr-2"
                            onClick={async () => {
                                const exists = await CharacterAssetDiscovery.characterExists('wizarding', 'non_existent');
                                alert(`non_existent exists: ${exists}`);
                            }}
                        >
                            Test Character Exists (non_existent)
                        </button>

                        <button
                            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded mr-2"
                            onClick={async () => {
                                const actions = await CharacterAssetDiscovery.getCharacterActions('wizarding', 'male_wizard_1');
                                alert(`male_wizard_1 actions: ${actions.join(', ')}`);
                            }}
                        >
                            Test Get Character Actions (male_wizard_1)
                        </button>

                        <button
                            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded mr-2"
                            onClick={async () => {
                                const preview = await CharacterAssetDiscovery.getCharacterPreview('wizarding', 'female_wizard_2');
                                alert(`Preview data: ${JSON.stringify(preview, null, 2)}`);
                            }}
                        >
                            Test Get Character Preview (female_wizard_2)
                        </button>
                    </div>
                </div>

                <div className="text-sm text-gray-400">
                    <p>Click on character cards to see detailed information.</p>
                    <p>Click on action badges to test frame count calculation.</p>
                    <p>Use the test buttons to verify individual service methods.</p>
                </div>
            </div>
        </div>
    );
}