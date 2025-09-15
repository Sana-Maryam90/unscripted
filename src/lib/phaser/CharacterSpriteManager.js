/**
 * CharacterSpriteManager - Manages character sprites and animations
 */
import CharacterAssetDiscovery from '../../services/CharacterAssetDiscovery.js';

class CharacterSpriteManager {
    constructor(scene) {
        this.scene = scene;
        this.loadedCharacters = new Set();
        this.FRAME_SIZE = 64;

        // Direction mapping for sprite sheets (row indices)
        this.DIRECTIONS = { up: 0, left: 1, down: 2, right: 3 };
    }

    /**
     * Load character assets and create animations
     */
    async loadCharacterAssets(world, characterId) {
        const cacheKey = `${world}:${characterId}`;
        if (this.loadedCharacters.has(cacheKey)) return true;

        try {
            const characterData = await CharacterAssetDiscovery.getCharacterData(world, characterId);
            if (!characterData) return false;

            console.log(`📦 Loading ${characterId} sprites...`);

            // Load spritesheets for each action
            for (const action of characterData.availableActions) {
                const assetKey = `${characterId}:${action}`;
                const assetPath = `/assets/${world}/player_characters/${characterId}/${action}.png`;

                if (!this.scene.textures.exists(assetKey)) {
                    this.scene.load.spritesheet(assetKey, assetPath, {
                        frameWidth: this.FRAME_SIZE,
                        frameHeight: this.FRAME_SIZE
                    });
                }
            }

            // Start loading
            this.scene.load.start();

            // Wait for loading to complete
            await new Promise((resolve) => {
                if (!this.scene.load.isLoading()) {
                    resolve();
                } else {
                    this.scene.load.once('complete', resolve);
                }
            });

            // Create animations
            this.createCharacterAnimations(characterId, characterData);
            this.loadedCharacters.add(cacheKey);

            console.log(`✅ ${characterId} loaded with animations`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to load ${characterId}:`, error);
            return false;
        }
    }

    /**
     * Create animations for character
     */
    createCharacterAnimations(characterId, characterData) {
        for (const action of characterData.availableActions) {
            const spriteKey = `${characterId}:${action}`;
            const frameData = characterData.spriteFrames[action];

            if (!this.scene.textures.exists(spriteKey)) continue;

            // Create animations for each direction
            Object.entries(this.DIRECTIONS).forEach(([dirName, dirRow]) => {
                const animKey = `${characterId}:${action}-${dirName}`;

                if (this.scene.anims.exists(animKey)) return;

                const startFrame = dirRow * frameData.frameCount;
                const frames = [];
                for (let i = 0; i < frameData.frameCount; i++) {
                    frames.push({ key: spriteKey, frame: startFrame + i });
                }

                const config = this.getAnimConfig(action);
                this.scene.anims.create({
                    key: animKey,
                    frames: frames,
                    frameRate: config.frameRate,
                    repeat: config.repeat
                });
            });
        }
    }

    /**
     * Get animation configuration
     */
    getAnimConfig(action) {
        switch (action) {
            case 'idle': return { frameRate: 4, repeat: -1 };
            case 'walk': return { frameRate: 8, repeat: -1 };
            case 'run': return { frameRate: 12, repeat: -1 };
            default: return { frameRate: 8, repeat: -1 };
        }
    }

    /**
     * Create character sprite
     */
    createCharacterSprite(x, y, characterId, options = {}) {
        // Use idle-down as default texture
        const defaultTexture = `${characterId}:idle`;

        if (!this.scene.textures.exists(defaultTexture)) {
            console.warn(`❌ Texture ${defaultTexture} not found, using fallback`);
            return null;
        }

        const sprite = this.scene.add.sprite(x, y, defaultTexture, 2); // Frame 2 = idle-down
        this.scene.physics.add.existing(sprite);

        sprite.body.setSize(32, 48); // Smaller collision box
        sprite.body.setOffset(16, 16); // Center the collision box
        sprite.body.setCollideWorldBounds(true);

        // Store character info
        sprite.characterId = characterId;
        sprite.currentAction = 'idle';
        sprite.currentDirection = 'down';

        // Play idle animation
        const idleAnim = `${characterId}:idle-down`;
        if (this.scene.anims.exists(idleAnim)) {
            sprite.play(idleAnim);
        }

        console.log(`✅ Created sprite for ${characterId} at (${x}, ${y})`);
        return sprite;
    }

    /**
     * Update sprite animation based on action and direction
     */
    updateSpriteAnimation(sprite, action, direction) {
        if (!sprite || !sprite.characterId) return;

        const animKey = `${sprite.characterId}:${action}-${direction}`;

        if (this.scene.anims.exists(animKey) && sprite.anims.currentAnim?.key !== animKey) {
            sprite.play(animKey);
            sprite.currentAction = action;
            sprite.currentDirection = direction;
        }
    }

    /**
     * Get animation key
     */
    getAnimationKey(characterId, action, direction) {
        return `${characterId}:${action}-${direction}`;
    }
}

export default CharacterSpriteManager;