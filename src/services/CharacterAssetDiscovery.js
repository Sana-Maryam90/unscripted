/**
 * CharacterAssetDiscovery Service
 * 
 * Discovers available characters and their actions from the known asset directory structure.
 * Supports the LPC/ULPC sprite format with 64x64 pixel frames.
 */

class CharacterAssetDiscovery {
    /**
     * Base path for character assets
     */
    static ASSETS_BASE_PATH = '/assets';

    /**
     * Standard frame size for LPC/ULPC sprites
     */
    static FRAME_SIZE = 64;

    /**
     * Required actions - character must have at least one of these
     */
    static REQUIRED_ACTIONS = ['idle', 'walk'];

    /**
     * Known character folders (always 4 characters)
     */
    static KNOWN_CHARACTERS = [
        'female_wizard_1',
        'female_wizard_2',
        'male_wizard_1',
        'male_wizard_2'
    ];

    /**
     * Known actions available for all characters
     */
    static KNOWN_ACTIONS = [
        'backslash', 'climb', 'combat_idle', 'emote', 'halfslash',
        'hurt', 'idle', 'jump', 'run', 'shoot', 'sit', 'slash',
        'spellcast', 'thrust', 'walk'
    ];

    /**
     * Get all available characters for a specific world
     * @param {string} world - The world name (e.g., 'wizarding')
     * @returns {Promise<Array>} Array of character objects
     */
    static async getAvailableCharacters(world = 'wizarding') {
        try {
            const characters = [];

            for (const characterId of this.KNOWN_CHARACTERS) {
                try {
                    const characterData = await this.getCharacterData(world, characterId);
                    if (characterData) {
                        characters.push(characterData);
                    }
                } catch (error) {
                    console.warn(`Failed to load character ${characterId}:`, error);
                    // Continue with other characters
                }
            }

            return characters;
        } catch (error) {
            console.error('Failed to get available characters:', error);
            return [];
        }
    }

    /**
     * Get detailed data for a specific character
     * @param {string} world - The world name
     * @param {string} characterId - The character identifier
     * @returns {Promise<Object|null>} Character data object or null if invalid
     */
    static async getCharacterData(world, characterId) {
        try {
            // Validate that this is a known character
            if (!this.KNOWN_CHARACTERS.includes(characterId)) {
                console.warn(`Unknown character ${characterId}`);
                return null;
            }

            // Get available actions for this character
            const availableActions = await this.getCharacterActions(world, characterId);

            // Validate that character has required actions
            if (!this.validateCharacterAssets(availableActions)) {
                console.warn(`Character ${characterId} missing required actions (idle or walk)`);
                return null;
            }

            // Calculate frame data for each action
            const spriteFrames = {};
            for (const action of availableActions) {
                try {
                    const frameCount = await this.calculateFrameCount(`${this.ASSETS_BASE_PATH}/${world}/player_characters/${characterId}/${action}.png`);
                    spriteFrames[action] = {
                        frameCount,
                        frameSize: { width: this.FRAME_SIZE, height: this.FRAME_SIZE }
                    };
                } catch (error) {
                    console.warn(`Failed to calculate frames for ${characterId}:${action}`, error);
                }
            }

            return {
                id: characterId,
                name: this.formatCharacterName(characterId),
                world,
                availableActions,
                spriteFrames
            };
        } catch (error) {
            console.error(`Failed to get character data for ${characterId}:`, error);
            return null;
        }
    }

    /**
     * Get available actions for a specific character by testing which images exist
     * @param {string} world - The world name
     * @param {string} characterId - The character identifier
     * @returns {Promise<Array>} Array of action names
     */
    static async getCharacterActions(world, characterId) {
        const availableActions = [];

        // Test each known action to see if the image exists
        for (const action of this.KNOWN_ACTIONS) {
            try {
                const imagePath = `${this.ASSETS_BASE_PATH}/${world}/player_characters/${characterId}/${action}.png`;
                const exists = await this.imageExists(imagePath);
                if (exists) {
                    availableActions.push(action);
                }
            } catch (error) {
                // Image doesn't exist, skip it
                continue;
            }
        }

        return availableActions;
    }

    /**
     * Check if an image exists by trying to load it
     * @param {string} imagePath - Path to the image
     * @returns {Promise<boolean>} True if image exists and loads successfully
     */
    static async imageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);

            // Set source to trigger loading
            img.src = imagePath;
        });
    }

    /**
     * Calculate frame count for a sprite sheet by loading the image
     * @param {string} imagePath - Path to the sprite sheet image
     * @returns {Promise<number>} Number of frames in the sprite sheet
     */
    static async calculateFrameCount(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                try {
                    const frameCount = Math.floor(img.width / this.FRAME_SIZE);
                    resolve(frameCount);
                } catch (error) {
                    reject(new Error(`Failed to calculate frame count: ${error.message}`));
                }
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imagePath}`));
            };

            // Set source to trigger loading
            img.src = imagePath;
        });
    }

    /**
     * Validate that character assets meet minimum requirements
     * @param {Array} availableActions - Array of available action names
     * @returns {boolean} True if character has required actions
     */
    static validateCharacterAssets(availableActions) {
        // Character must have at least one of the required actions
        return this.REQUIRED_ACTIONS.some(requiredAction =>
            availableActions.includes(requiredAction)
        );
    }

    /**
     * Format character ID into a human-readable name
     * @param {string} characterId - Character identifier (e.g., 'female_wizard_1')
     * @returns {string} Formatted character name
     */
    static formatCharacterName(characterId) {
        return characterId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Check if a specific character exists
     * @param {string} world - The world name
     * @param {string} characterId - The character identifier
     * @returns {Promise<boolean>} True if character exists and is valid
     */
    static async characterExists(world, characterId) {
        try {
            const characterData = await this.getCharacterData(world, characterId);
            return characterData !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get character preview data for selection screen
     * @param {string} world - The world name
     * @param {string} characterId - The character identifier
     * @returns {Promise<Object|null>} Preview data with idle sprite info
     */
    static async getCharacterPreview(world, characterId) {
        try {
            const characterData = await this.getCharacterData(world, characterId);
            if (!characterData) return null;

            // Prefer idle action for preview, fallback to walk
            const previewAction = characterData.availableActions.includes('idle') ? 'idle' : 'walk';
            const previewPath = `${this.ASSETS_BASE_PATH}/${world}/player_characters/${characterId}/${previewAction}.png`;

            return {
                id: characterId,
                name: characterData.name,
                previewAction,
                previewPath,
                isAvailable: true
            };
        } catch (error) {
            console.error(`Failed to get character preview for ${characterId}:`, error);
            return null;
        }
    }
}

export default CharacterAssetDiscovery;