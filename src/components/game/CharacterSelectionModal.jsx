'use client';

import { useState } from 'react';
import Button from '../ui/Button';

const CharacterSelectionModal = ({ availableSlots, onSelectCharacter, onClose }) => {
    const [selectedCharacter, setSelectedCharacter] = useState(null);

    const characterData = {
        'female_wizard_1': {
            name: 'Selene the Scholar',
            description: 'Wise and quick-witted mage with a thirst for knowledge',
            personality: 'intelligent, logical, determined, scholarly'
        },
        'female_wizard_2': {
            name: 'Lyra the Enchanter',
            description: 'Playful trickster with mastery over illusions',
            personality: 'creative, mischievous, clever, unpredictable'
        },
        'male_wizard_1': {
            name: 'Orin the Battlemage',
            description: 'Strong warrior infused with elemental magic',
            personality: 'brave, protective, loyal, sometimes impulsive'
        },
        'male_wizard_2': {
            name: 'Kael the Mystic',
            description: 'Quiet wanderer who channels arcane power',
            personality: 'wise, mysterious, calm, introspective'
        }
    };

    const handleSelect = () => {
        if (selectedCharacter) {
            onSelectCharacter(selectedCharacter);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-4 border-white p-8 max-w-2xl w-full mx-4" style={{
                backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.03) 2px,
                    rgba(255, 255, 255, 0.03) 4px
                )`
            }}>
                <h2 className="text-3xl font-bold text-white mb-6 font-mono tracking-wider text-center" style={{
                    textShadow: '3px 3px 0px #333',
                    fontFamily: 'monospace'
                }}>
                    ⚡ CHOOSE YOUR WIZARD ⚡
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {availableSlots.map((charId) => {
                        const char = characterData[charId];
                        return (
                            <div
                                key={charId}
                                onClick={() => setSelectedCharacter(charId)}
                                className={`p-4 border-2 cursor-pointer transition-all ${selectedCharacter === charId
                                        ? 'border-purple-400 bg-purple-900/30 shadow-lg shadow-purple-400/20'
                                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                                    }`}
                                style={{ imageRendering: 'pixelated' }}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Character Sprite Placeholder */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-white flex items-center justify-center"
                                        style={{ imageRendering: 'pixelated' }}>
                                        <span className="text-2xl font-bold text-white font-mono">
                                            {char.name.charAt(0)}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-white font-bold font-mono text-lg mb-1">
                                            {char.name}
                                        </h3>
                                        <p className="text-gray-300 text-sm mb-2">
                                            {char.description}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            <strong>Personality:</strong> {char.personality}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {availableSlots.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-400 font-mono text-lg">
                            All characters are taken! Please wait for someone to leave.
                        </p>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={handleSelect}
                        disabled={!selectedCharacter}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono border-2 border-purple-400 text-xl disabled:opacity-50"
                        style={{ imageRendering: 'pixelated' }}
                    >
                        ⚡ SELECT WIZARD
                    </Button>

                    {onClose && (
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="px-8 py-4 text-gray-400 hover:text-gray-300 font-bold font-mono border-2 border-gray-600 hover:border-gray-500 text-xl"
                            style={{ imageRendering: 'pixelated' }}
                        >
                            CANCEL
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterSelectionModal;