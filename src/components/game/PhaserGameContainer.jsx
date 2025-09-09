'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Phaser to avoid SSR issues
const PhaserGame = dynamic(() => import('./PhaserGame'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white">Loading game...</p>
            </div>
        </div>
    )
});

const PhaserGameContainer = ({ roomId, world, charId, socket, onGameReady }) => {
    const [isClient, setIsClient] = useState(false);
    const gameRef = useRef(null);

    useEffect(() => {
        // Ensure we're on the client side
        setIsClient(true);
    }, []);

    const handleGameReady = (gameInstance) => {
        gameRef.current = gameInstance;
        if (onGameReady) {
            onGameReady(gameInstance);
        }
    };

    if (!isClient) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white">Initializing game...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative flex flex-col" style={{ minHeight: 0 }}>
            <PhaserGame
                roomId={roomId}
                world={world}
                charId={charId}
                socket={socket}
                onGameReady={handleGameReady}
            />
        </div>
    );
};

export default PhaserGameContainer;