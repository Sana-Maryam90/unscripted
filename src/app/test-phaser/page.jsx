'use client';

import { useState, useCallback } from 'react';
import PhaserGameContainer from '../../components/game/PhaserGameContainer';

export default function TestPhaserPage() {
    const [gameInstance, setGameInstance] = useState(null);

    const handleGameReady = useCallback((game) => {
        setGameInstance(game);
        console.log('🎮 Test Phaser game ready:', game);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-4">Phaser 3 Integration Test</h1>

                <div className="glass-card p-4 mb-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Test Parameters</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Room ID:</span>
                            <span className="text-white ml-2">TEST</span>
                        </div>
                        <div>
                            <span className="text-gray-400">World:</span>
                            <span className="text-white ml-2">wizarding</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Character ID:</span>
                            <span className="text-white ml-2">harry_potter</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Game Instance:</span>
                            <span className={`ml-2 ${gameInstance ? 'text-green-400' : 'text-red-400'}`}>
                                {gameInstance ? 'Ready' : 'Not Ready'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ height: '600px', padding: '0' }}>
                    <PhaserGameContainer
                        roomId="TEST"
                        world="wizarding"
                        charId="harry_potter"
                        socket={null}
                        onGameReady={handleGameReady}
                    />
                </div>

                <div className="mt-4 text-sm text-gray-400">
                    <p>This test page verifies that Phaser 3 loads correctly in Next.js with SSR compatibility.</p>
                    <p>You should see a gray game canvas with placeholder text above.</p>
                </div>
            </div>
        </div>
    );
}