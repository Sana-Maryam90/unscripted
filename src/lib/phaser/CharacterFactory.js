import { ACTIONS, DIRS } from './characters.js';

const BASE = '/assets/wizarding/player_characters'; // public/ root

// Row order in sprite sheets
const ROW_MAP = { up: 0, left: 1, down: 2, right: 3 };

export default class CharacterFactory {
    /**
     * Preload all actions for one character.
     * Call this in Scene.preload() for the local player,
     * and lazily for remote players when they spawn.
     */
    static preloadCharacter(scene, charKey, actions = ACTIONS) {
        console.log(`🎨 Preloading character: ${charKey} with actions:`, actions);
        actions.forEach(action => {
            const key = this.texKey(charKey, action);
            const url = `${BASE}/${charKey}/${action}.png`;
            // each PNG is a spritesheet of 64x64 tiles
            if (!scene.textures.exists(key)) {
                console.log(`📦 Loading sprite: ${key} from ${url}`);
                scene.load.spritesheet(key, url, { frameWidth: 64, frameHeight: 64 });
            } else {
                console.log(`✅ Sprite already loaded: ${key}`);
            }
        });
    }

    /**
     * Ensure animations exist for all directions of one action.
     * Uses actual image width to compute column count (frames per row).
     */
    static ensureAnims(scene, charKey, action, frameRate = 10, repeat = -1) {
        const sheetKey = this.texKey(charKey, action);

        // If not yet in Texture Manager, bail (call after 'complete' or in create())
        if (!scene.textures.exists(sheetKey)) {
            console.log(`⚠️ Texture ${sheetKey} not found, skipping animation creation`);
            return;
        }

        // Already created? Skip.
        const animKeyPrefix = this.animPrefix(charKey, action);
        if (DIRS.every(d => scene.anims.exists(`${animKeyPrefix}-${d}`))) {
            console.log(`✅ Animations already exist for ${charKey}:${action}`);
            return;
        }

        try {
            // Compute columns
            const img = scene.textures.get(sheetKey).getSourceImage();
            const cols = Math.max(1, Math.floor(img.width / 64));
            console.log(`🎬 Creating animations for ${charKey}:${action} - ${cols} columns`);

            DIRS.forEach(dir => {
                const row = ROW_MAP[dir];
                const start = row * cols;
                const end = start + cols - 1;

                const animKey = `${animKeyPrefix}-${dir}`;
                if (!scene.anims.exists(animKey)) {
                    scene.anims.create({
                        key: animKey,
                        frames: scene.anims.generateFrameNumbers(sheetKey, { start, end }),
                        frameRate,
                        repeat
                    });
                    console.log(`✅ Created animation: ${animKey} (frames ${start}-${end})`);
                }
            });
        } catch (error) {
            console.error(`❌ Failed to create animations for ${charKey}:${action}:`, error);
        }
    }

    /**
     * Play a character animation given (action, direction).
     * Falls back to a single first frame if frames are missing.
     */
    static play(scene, sprite, charKey, action, dir) {
        const animKey = `${this.animPrefix(charKey, action)}-${dir}`;
        if (scene.anims.exists(animKey)) {
            sprite.anims.play(animKey, true);
            console.log(`🎭 Playing animation: ${animKey}`);
        } else {
            // idle fallback if specific anim doesn't exist yet
            const idleKey = `${this.animPrefix(charKey, 'idle')}-${dir}`;
            if (scene.anims.exists(idleKey)) {
                sprite.anims.play(idleKey, true);
                console.log(`🎭 Fallback to idle: ${idleKey}`);
            } else {
                sprite.setFrame(0);
                console.log(`⚠️ No animation found for ${animKey}, using frame 0`);
            }
        }
    }

    static texKey(charKey, action) {
        return `pc:${charKey}:${action}`;
    }

    static animPrefix(charKey, action) {
        return `pc:${charKey}:${action}`;
    }
}