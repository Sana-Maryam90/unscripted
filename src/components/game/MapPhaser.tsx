'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Import Phaser only on client
const Phaser = dynamic(() => import('phaser'), { ssr: false });

// We will import the scene lazily inside effect to keep SSR safe
type Props = {
    onSelectLocation: (loc: { name: string; props: Record<string, any> }) => void;
};

export default function MapPhaser({ onSelectLocation }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<any>(null);

    useEffect(() => {
        let phaserModule: any;
        let WorldMapScene: any;

        let destroyed = false;

        (async () => {
            const [{ default: PhaserLib }, { default: SceneClass }] = await Promise.all([
                import('phaser'),
                import('../../lib/phaser/scenes/WorldMapScene')
            ]);
            if (destroyed) return;

            phaserModule = PhaserLib;
            WorldMapScene = SceneClass;

            const config = {
                type: PhaserLib.AUTO,
                parent: containerRef.current as any,
                backgroundColor: '#000000',
                scale: {
                    mode: PhaserLib.Scale.RESIZE,  // always fill container
                    autoCenter: PhaserLib.Scale.CENTER_BOTH,
                    width: '100%',
                    height: '100%',
                },
                render: { pixelArt: true, antialias: false },
                physics: { default: 'arcade', arcade: { debug: false } },
                scene: []
            } as Phaser.Types.Core.GameConfig;

            const game = new PhaserLib.Game(config);
            gameRef.current = game;

            // Inject scene with callback
            const scene = new WorldMapScene({ key: 'WorldMapScene', onSelectLocation });
            game.scene.add('WorldMapScene', scene, true);
        })();

        return () => {
            destroyed = true;
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [onSelectLocation]);

    return <div ref={containerRef} className="w-full h-full" />;
}