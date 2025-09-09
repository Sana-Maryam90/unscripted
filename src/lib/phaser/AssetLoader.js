
/**
 * AssetLoader class for loading Harry Potter lobby assets
 * Handles dynamic loading of Tiled maps and character sprites
 */
class AssetLoader {
    constructor(scene) {
        this.scene = scene;
        this.world = 'wizarding'; // Harry Potter wizarding world
    }

    /**
     * Load Tiled map files for the wizarding world
     * @param {string} mapName - Name of the map (e.g., 'lobby', 'dorm', 'overworld')
     */
    loadTiledMap(mapName) {
        console.log(`🗺️ Loading Tiled map: ${mapName}`);

        const mapPath = `/assets/${this.world}/maps/${mapName}.tmj`;
        const imagePath = `/assets/${this.world}/maps/${mapName}.png`;

        console.log(`📍 Attempting to load map from: ${mapPath}`);
        console.log(`🖼️ Attempting to load image from: ${imagePath}`);

        // Load the Tiled map JSON file
        this.scene.load.tilemapTiledJSON(mapName, mapPath);

        // Load the background image for the map
        this.scene.load.image(`${mapName}_bg`, imagePath);

        console.log(`📁 Queued map assets: ${mapName}.tmj and ${mapName}.png`);
    }

    /**
     * Load lobby-specific assets
     */
    loadLobbyAssets() {
        console.log('🏛️ Loading Harry Potter lobby assets...');

        // Load the tilemap and background image properly
        const mapPath = `/assets/${this.world}/maps/lobby.tmj`;
        const imagePath = `/assets/${this.world}/maps/lobby.png`;

        console.log(`🗺️ Loading tilemap from: ${mapPath}`);
        console.log(`🖼️ Loading background image from: ${imagePath}`);

        // Load tilemap JSON using Phaser's proper method
        this.scene.load.tilemapTiledJSON('lobby', mapPath);

        // Load the background image
        this.scene.load.image('lobby-bg', imagePath);

        // Load a simple player sprite (create a small colored square)
        this.scene.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABYSURBVBiVY/z//z8DJYCJgUIwqmBUwagCugrY2Nj+MzAwMDCwsLAwsLGxMbCwsDBwcHAwcHJyMnBxcTFwc3MzcHNzM/Dw8DBwc3MzcHNzM3BzczNwc3MzUAcAAKcKDQoQ7aPfAAAAAElFTkSuQmCC');

        // Load any additional lobby-specific assets
        this.loadLobbyDecorations();

        // Add loading event listeners for debugging
        this.scene.load.on('filecomplete', (key, type, data) => {
            console.log(`📁 Asset loaded: ${key} (${type})`);
        });

        this.scene.load.on('complete', () => {
            console.log('✅ All lobby assets loaded successfully');
            this.validateLobbyAssets();
        });

        console.log('✅ Lobby assets queued for loading');
    }

    /**
     * Validate that lobby assets were loaded correctly
     */
    validateLobbyAssets() {
        console.log('🔍 Validating lobby assets...');

        const validation = {
            lobby_tilemap: this.scene.cache.tilemap.has('lobby'),
            lobby_background: this.scene.textures.exists('lobby-bg'),
            player_sprite: this.scene.textures.exists('player'),
            sparkle_decoration: this.scene.textures.exists('sparkle')
        };

        console.log('📋 Asset validation results:', validation);

        const allValid = Object.values(validation).every(valid => valid);
        if (allValid) {
            console.log('✅ All lobby assets validated successfully');
        } else {
            console.warn('⚠️ Some lobby assets failed validation');
        }

        return validation;
    }

    /**
     * Load decorative assets for the lobby
     */
    loadLobbyDecorations() {
        // Create placeholder decorative elements
        // These could be replaced with actual sprite assets later

        // Create a simple colored rectangle for magical effects
        this.scene.load.image('sparkle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABYSURBVBiVY/z//z8DJYCJgUIwqmBUwagCugrY2Nj+MzAwMDCwsLAwsLGxMbCwsDBwcHAwcHJyMnBxcTFwc3MzcHNzM/Dw8DBwc3MzcHNzM3BzczNwc3MzUAcAAKcKDQoQ7aPfAAAAAElFTkSuQmCC');
    }

    /**
     * Discover available character actions dynamically
     * @param {string} charId - Character ID (e.g., 'harry_potter', 'hermione_granger')
     * @returns {Promise<string[]>} Array of available action names
     */
    async discoverCharacterActions(charId) {
        console.log(`🔍 Discovering actions for character: ${charId}`);

        const basePath = `/assets/${this.world}/player_characters/${charId}/`;
        const potentialActions = ['walk', 'run', 'idle', 'spellcast', 'combat_idle', 'hurt', 'emote'];
        const availableActions = [];

        for (const action of potentialActions) {
            try {
                const response = await fetch(`${basePath}${action}.png`);
                if (response.ok) {
                    availableActions.push(action);
                    console.log(`✅ Found action: ${action} for ${charId}`);
                }
            } catch (error) {
                // Action not available, skip silently
                console.log(`❌ Action not found: ${action} for ${charId}`);
            }
        }

        console.log(`📋 Available actions for ${charId}:`, availableActions);
        return availableActions;
    }

    /**
     * Load character sprite assets
     * @param {string} charId - Character ID
     * @param {string} action - Action name (e.g., 'walk', 'idle')
     */
    loadCharacterSprite(charId, action) {
        const key = `${charId}_${action}`;
        const path = `/assets/${this.world}/player_characters/${charId}/${action}.png`;

        console.log(`👤 Loading character sprite: ${key} from ${path}`);

        // Load character spritesheet with ULPC format (64x64 frames)
        this.scene.load.spritesheet(key, path, {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    /**
     * Load multiple character assets
     * @param {string[]} characterIds - Array of character IDs to load
     */
    async loadMultipleCharacters(characterIds) {
        console.log('👥 Loading multiple character assets:', characterIds);

        for (const charId of characterIds) {
            const actions = await this.discoverCharacterActions(charId);

            for (const action of actions) {
                this.loadCharacterSprite(charId, action);
            }
        }

        console.log('✅ All character assets queued for loading');
    }

    /**
     * Create a fallback image for missing assets
     * @param {string} key - Asset key
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} color - Fill color (hex)
     */
    createFallbackImage(key, width = 64, height = 64, color = 0x6366f1) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);

        // Generate texture from graphics
        graphics.generateTexture(key, width, height);
        graphics.destroy();

        console.log(`🎨 Created fallback image: ${key} (${width}x${height})`);
    }

    /**
     * Validate that required assets are loaded
     * @param {string[]} requiredAssets - Array of required asset keys
     * @returns {boolean} True if all assets are available
     */
    validateAssets(requiredAssets) {
        const missing = [];

        for (const assetKey of requiredAssets) {
            if (!this.scene.textures.exists(assetKey)) {
                missing.push(assetKey);
            }
        }

        if (missing.length > 0) {
            console.warn('⚠️ Missing assets:', missing);
            return false;
        }

        console.log('✅ All required assets validated');
        return true;
    }

    /**
     * Get loading progress information
     * @returns {object} Loading progress data
     */
    getLoadingProgress() {
        return {
            progress: this.scene.load.progress,
            totalFiles: this.scene.load.totalToLoad,
            loadedFiles: this.scene.load.totalComplete,
            isComplete: this.scene.load.isLoading() === false
        };
    }

    /**
     * Parse and validate Tiled map data structure
     * @param {object} tilemapData - The loaded Tiled map data
     * @returns {object} Parsed map information
     */
    parseTiledMapData(tilemapData) {
        console.log('🔍 Parsing Tiled map data structure...');

        const mapInfo = {
            width: tilemapData.width,
            height: tilemapData.height,
            tileWidth: tilemapData.tilewidth,
            tileHeight: tilemapData.tileheight,
            layers: {
                imageLayers: [],
                tileLayers: [],
                objectLayers: []
            }
        };

        // Parse different layer types
        if (tilemapData.layers) {
            tilemapData.layers.forEach(layer => {
                switch (layer.type) {
                    case 'imagelayer':
                        mapInfo.layers.imageLayers.push({
                            name: layer.name,
                            image: layer.image,
                            x: layer.x || 0,
                            y: layer.y || 0,
                            width: layer.imagewidth,
                            height: layer.imageheight,
                            visible: layer.visible !== false
                        });
                        console.log(`🖼️ Found image layer: ${layer.name} (${layer.image})`);
                        break;

                    case 'tilelayer':
                        mapInfo.layers.tileLayers.push({
                            name: layer.name,
                            data: layer.data,
                            width: layer.width,
                            height: layer.height,
                            visible: layer.visible !== false
                        });
                        console.log(`🧩 Found tile layer: ${layer.name}`);
                        break;

                    case 'objectgroup':
                        const objects = layer.objects || [];
                        mapInfo.layers.objectLayers.push({
                            name: layer.name,
                            objects: objects.map(obj => ({
                                id: obj.id,
                                name: obj.name,
                                type: obj.type,
                                x: obj.x,
                                y: obj.y,
                                width: obj.width,
                                height: obj.height,
                                properties: obj.properties || [],
                                visible: obj.visible !== false
                            }))
                        });
                        console.log(`📦 Found object layer: ${layer.name} (${objects.length} objects)`);
                        break;

                    default:
                        console.log(`❓ Unknown layer type: ${layer.type} (${layer.name})`);
                }
            });
        }

        console.log('✅ Tiled map data parsed successfully:', mapInfo);
        return mapInfo;
    }

    /**
     * Validate that a Tiled map has required layers
     * @param {object} mapInfo - Parsed map information
     * @param {string[]} requiredLayers - Array of required layer names
     * @returns {boolean} True if all required layers exist
     */
    validateMapLayers(mapInfo, requiredLayers = ['Background', 'Collision']) {
        console.log('🔍 Validating required map layers:', requiredLayers);

        const allLayers = [
            ...mapInfo.layers.imageLayers,
            ...mapInfo.layers.tileLayers,
            ...mapInfo.layers.objectLayers
        ];

        const layerNames = allLayers.map(layer => layer.name);
        const missingLayers = requiredLayers.filter(required => !layerNames.includes(required));

        if (missingLayers.length > 0) {
            console.warn('⚠️ Missing required layers:', missingLayers);
            console.log('📋 Available layers:', layerNames);
            return false;
        }

        console.log('✅ All required layers found');
        return true;
    }

    /**
     * Handle loading errors gracefully
     * @param {string} assetKey - Failed asset key
     * @param {string} fallbackKey - Fallback asset key to use
     */
    handleLoadingError(assetKey, fallbackKey = null) {
        console.error(`❌ Failed to load asset: ${assetKey}`);

        if (fallbackKey && this.scene.textures.exists(fallbackKey)) {
            console.log(`🔄 Using fallback asset: ${fallbackKey}`);
            return fallbackKey;
        }

        // Create a simple fallback
        this.createFallbackImage(assetKey);
        return assetKey;
    }
}

export default AssetLoader;