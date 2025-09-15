'use client';

import { useState } from 'react';
import PhaserGameContainer from '../../components/game/PhaserGameContainer';

export default function TestCharacterSprites() {
    const [selectedCharacter, setSelectedCharacter] = useState('female_wizard_1');

    const characters = [
        { id: 'female_wizard_1', name: 'Selene the Scholar' },
        { id: 'female_wizard_2', name: 'Lyra the Enchanter' },
        { id: 'male_wizard_1', name: 'Orin the Battlemage' },
        { id: 'male_wizard_2', name: 'Kael the Mystic' }
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Character Sprite Test</h1>

                <div className="mb-6">
                    <h2 className="text-xl mb-4">Select Character:</h2>
                    <div className="flex gap-4">
                        {characters.map(char => (
                            <button
                                key={char.id}
                                onClick={() => setSelectedCharacter(char.id)}
                                className={`px-4 py-2 rounded border-2 transition-colors ${selectedCharacter === char.id
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                {char.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <p>Selected Character: <strong>{selectedCharacter}</strong></p>
                    <p>Use WASD or arrow keys to move around</p>
                    <p>Hold Shift to run</p>
                </div>

                <div className="w-full h-96 border border-gray-600 rounded-lg overflow-hidden">
                    <PhaserGameContainer
                        roomId="test-room"
                        world="wizarding"
                        charId={selectedCharacter}
                        socket={null}
                        onGameReady={(game) => console.log('Game ready:', game)}
                    />
                </div>
            </div>
        </div>
    );
}