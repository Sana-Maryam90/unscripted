import * as Phaser from 'phaser';
import LobbyScene from './scenes/LobbyScene';

class GameManager {
    constructor(options) {
        this.roomId = options.roomId;
        this.world = options.world || 'wizarding';
        this.charId = options.charId;
        this.socket = options.socket;
        this.parentElement = options.parentElement;

        this.game = null;
        this.init();
    }

    init() {
        console.log('🎮 Initializing GameManager with parent element:', this.parentElement);

        // Phaser game configuration with proper scaling
        const config = {
            type: Phaser.AUTO,
            parent: this.parentElement,
            backgroundColor: '#1a1a2e',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.NO_CENTER
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 }, // Top-down game, no gravity
                    debug: process.env.NODE_ENV === 'development' && window.location.search.includes('debug=true')
                }
            },
            scene: [LobbyScene],
            render: {
                pixelArt: true,
                roundPixels: true
            }
        };

        try {
            // Create Phaser game instance
            this.game = new Phaser.Game(config);
            console.log('✅ Phaser game created successfully');
        } catch (error) {
            console.error('❌ Failed to create Phaser game:', error);
            throw error;
        }

        // Pass initialization data to the first scene
        this.game.registry.set('gameManager', this);
        this.game.registry.set('roomId', this.roomId);
        this.game.registry.set('world', this.world);
        this.game.registry.set('charId', this.charId);
        this.game.registry.set('socket', this.socket);

        console.log('🎮 Phaser game initialized:', {
            roomId: this.roomId,
            world: this.world,
            charId: this.charId
        });
    }

    destroy() {
        if (this.game) {
            console.log('🗑️ Destroying Phaser game');
            this.game.destroy(true);
            this.game = null;
        }
    }

    // Method to get current scene
    getCurrentScene() {
        return this.game?.scene?.getScene('LobbyScene');
    }

    // Method to switch scenes (for future use)
    switchScene(sceneKey, data = {}) {
        if (this.game && this.game.scene) {
            this.game.scene.start(sceneKey, data);
        }
    }
}

export default GameManager;