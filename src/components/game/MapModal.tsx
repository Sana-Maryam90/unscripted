'use client';

import { useCallback } from 'react';
import MapPhaser from './MapPhaser';

type MapModalProps = {
    onClose: () => void;
    onSelectLocation: (loc: { name: string; props: Record<string, any> }) => void;
};

export default function MapModal({ onClose, onSelectLocation }: MapModalProps) {
    const handleSelect = useCallback((loc: { name: string; props: Record<string, any> }) => {
        onSelectLocation(loc);
        // Do not auto-close; user can inspect more or close manually
    }, [onSelectLocation]);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80" onClick={onClose} />

            {/* Modal panel */}
            <div className="relative w-[95vw] h-[88vh] border-4 border-white bg-black overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-20 px-3 py-1 font-mono text-sm bg-white text-black border border-black hover:bg-gray-200"
                    aria-label="Close map"
                >
                    ×
                </button>

                {/* Phaser canvas container fills modal */}
                <div className="absolute inset-0">
                    <MapPhaser onSelectLocation={handleSelect} />
                </div>
            </div>
        </div>
    );
}