'use client';

import { useEffect, useRef } from 'react';
import GameManager from '../../lib/phaser/GameManager';

const PhaserGame = ({ roomId, world, charId, socket, onGameReady }) => {
    const gameRef = useRef(null);
    const gameManagerRef = useRef(null);
    const onGameReadyRef = useRef(onGameReady);

    // Update the ref when onGameReady changes
    useEffect(() => {
        onGameReadyRef.current = onGameReady;
    }, [onGameReady]);

    useEffect(() => {
        if (!gameRef.current || gameManagerRef.current) return;

        console.log('🎮 Initializing Phaser game with GameManager:', {
            roomId,
            world,
            charId,
            hasSocket: !!socket,
            parentElement: gameRef.current
        });

        try {
            // Create GameManager instance with proper configuration
            const gameManager = new GameManager({
                roomId,
                world: world || 'wizarding',
                charId: charId || 'harry_potter',
                socket,
                parentElement: gameRef.current
            });

            gameManagerRef.current = gameManager;
            console.log('✅ GameManager created successfully');

            // Notify parent component that game is ready using the ref
            if (onGameReadyRef.current) {
                onGameReadyRef.current(gameManager.game);
            }
        } catch (error) {
            console.error('❌ Failed to create GameManager:', error);
        }

        // Cleanup function
        return () => {
            if (gameManagerRef.current) {
                console.log('🧹 Cleaning up GameManager');
                gameManagerRef.current.destroy();
                gameManagerRef.current = null;
            }
        };
    }, [roomId, world, charId, socket]);

    return (
        <div
            ref={gameRef}
            className="w-full h-full"
            style={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
            }}
        />
    );
};

export default PhaserGame;