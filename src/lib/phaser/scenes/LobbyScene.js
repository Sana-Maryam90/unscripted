import * as Phaser from 'phaser';
import AssetLoader from '../AssetLoader.js';
import CharacterFactory from '../CharacterFactory.js';
import { CHAR_ID_TO_KEY, getCharacterKey } from '../characters.js';

class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });

        // Scene properties
        this.roomId = null;
        this.world = null;
        this.charId = null;
        this.socket = null;
        this.gameManager = null;

        // Game objects
        this.players = new Map();
        this.localPlayer = null;
        this.cursors = null;
        this.wasdKeys = null;
        this.joinedLobby = false;

        // Tiled map objects
        this.tiledMap = null;
        this.backgroundLayer = null;
        this.collisionBodies = [];
        this.assetLoader = null;
    }

    init() {
        // Get initialization data from game registry
        this.gameManager = this.registry.get('gameManager');
        this.roomId = this.registry.get('roomId');
        this.world = this.registry.get('world');
        this.charId = this.registry.get('charId');
        this.socket = this.registry.get('socket');

        // Initialize unique player ID system
        this.playerId = null;
        this.joinedLobby = false;

        const emitJoinLobby = () => {
            if (!this.socket || this.joinedLobby) return;
            // Ensure we know our socket id
            this.playerId = this.socket.id || this.playerId;
            const x = this.localPlayer?.x ?? 500;
            const y = this.localPlayer?.y ?? 500;

            this.socket.emit('join-lobby', { charId: this.charId, x, y });
            this.joinedLobby = true;
            console.log('📡 Sent join-lobby (reliable), with ID:', this.playerId, { x, y });
        };

        // If already connected (common when Phaser starts after room join), set id now
        if (this.socket?.connected) {
            this.playerId = this.socket.id;
            console.log('🆔 Player ID set immediately:', this.playerId);
        } else {
            // Fallback when the socket connects later
            this.socket?.once('connect', () => {
                this.playerId = this.socket.id;
                console.log('🆔 Player ID set on connect:', this.playerId);
            });
        }

        // Try to join the lobby as soon as we can
        // 1) If connected already, emit immediately after scene creates local player (see create())
        // 2) Also arm extra triggers as safety nets:
        this.socket?.once('room-joined', emitJoinLobby);
        this.socket?.once('connect', emitJoinLobby);

        // Tiny fallback in case events came before listeners were attached during hot reload
        setTimeout(() => {
            if (!this.joinedLobby && this.socket?.connected) emitJoinLobby();
        }, 300);

        // Initialize AssetLoader
        this.assetLoader = new AssetLoader(this);

        console.log('🏛️ LobbyScene initialized:', {
            roomId: this.roomId,
            world: this.world,
            charId: this.charId
        });
    }

    preload() {
        // Set loading progress bar
        this.createLoadingBar();

        // Load Harry Potter lobby assets using AssetLoader
        this.assetLoader.loadLobbyAssets();

        // Preload local player's selected character up-front (faster spawn)
        const myCharKey = getCharacterKey(this.charId);
        CharacterFactory.preloadCharacter(this, myCharKey, ['idle', 'walk', 'run']);

        // Optionally: also preload the 3 other characters to avoid pop-in
        ['female_wizard_1', 'female_wizard_2', 'male_wizard_1', 'male_wizard_2']
            .filter(k => k !== myCharKey)
            .forEach(k => CharacterFactory.preloadCharacter(this, k, ['idle', 'walk', 'run']));

        this.load.once('complete', () => {
            // create default idles so first frames are ready
            ['female_wizard_1', 'female_wizard_2', 'male_wizard_1', 'male_wizard_2'].forEach(k => {
                CharacterFactory.ensureAnims(this, k, 'idle', 6, -1);
                CharacterFactory.ensureAnims(this, k, 'walk', 10, -1);
                CharacterFactory.ensureAnims(this, k, 'run', 12, -1);
            });
        });

        // Set up loading error handlers
        this.load.on('loaderror', (file) => {
            console.error('❌ Failed to load file:', file.key, file.src);
            console.error('❌ File details:', {
                type: file.type,
                url: file.url,
                state: file.state
            });
            this.assetLoader.handleLoadingError(file.key);
        });

        // Add success handler for debugging
        this.load.on('filecomplete', (key, type, data) => {
            if (key === 'lobby' || key === 'lobby-bg') {
                console.log(`✅ Successfully loaded ${key} (${type})`);
                if (key === 'lobby') {
                    console.log('🗺️ Tilemap data preview:', data ? 'Data loaded' : 'No data');
                }
            }
        });

        // Add complete handler to check what was loaded
        this.load.on('complete', () => {
            console.log('📦 Asset loading complete. Checking cache...');
            console.log('🗺️ Tilemap in cache:', this.cache.tilemap.has('lobby'));
            console.log('🖼️ Background in cache:', this.textures.exists('lobby-bg'));

            if (this.cache.tilemap.has('lobby')) {
                const tilemapData = this.cache.tilemap.get('lobby');
                console.log('🗺️ Tilemap data structure:', {
                    hasData: !!tilemapData.data,
                    dataType: typeof tilemapData.data,
                    dataKeys: tilemapData.data ? Object.keys(tilemapData.data) : 'No data'
                });
            }
        });

        console.log('📦 Loading Harry Potter lobby assets...');
        this.load.start(); // needed only if you call load inside preload after it has already run
    }

    create() {
        try {
            // Create the Tiled map and lobby environment
            this.createTiledMap();

            // Set up input controls
            this.setupInputControls();

            // Set up socket listeners for multiplayer
            this.setupSocketListeners();

            // Create local player (placeholder for now)
            this.createLocalPlayer();

            // If we're already connected, emit join-lobby now (otherwise the other triggers will handle it)
            if (this.socket?.connected && !this.joinedLobby) {
                const x = this.localPlayer?.x ?? 500;
                const y = this.localPlayer?.y ?? 500;
                this.socket.emit('join-lobby', { charId: this.charId, x, y });
                this.joinedLobby = true;
                console.log('📡 Sent join-lobby from create() with ID:', this.playerId, { x, y });
            }

            console.log('🎮 LobbyScene created successfully with Tiled map');
        } catch (error) {
            console.error('❌ Failed to create LobbyScene, using minimal fallback:', error);

            // Create minimal fallback scene
            this.createFallbackBackground();
            this.createFallbackBoundaries();
            this.createLobbyUI();
            this.setupInputControls();
            this.setupSocketListeners();
            this.createLocalPlayer();

            // If we're already connected, emit join-lobby now (otherwise the other triggers will handle it)
            if (this.socket?.connected && !this.joinedLobby) {
                const x = this.localPlayer?.x ?? 500;
                const y = this.localPlayer?.y ?? 500;
                this.socket.emit('join-lobby', { charId: this.charId, x, y });
                this.joinedLobby = true;
                console.log('📡 Sent join-lobby from create() with ID:', this.playerId, { x, y });
            }

            console.log('🎮 LobbyScene created with fallback mode');
        }

        // Test map loading and rendering
        this.time.delayedCall(100, () => {
            const testResults = this.testMapLoadingAndRendering();

            // Make test results available globally for debugging
            window.lobbyTestResults = testResults;

            // Debug results available in console and window.lobbyTestResults
        });
    }

    update() {
        // Handle player input and movement
        this.handlePlayerInput();

        // Update animations and other game logic
        this.updateAnimations();
    }

    createLoadingBar() {
        // Create loading bar graphics
        const loadingBar = this.add.graphics();
        const loadingBox = this.add.graphics();

        loadingBox.fillStyle(0x222222);
        loadingBox.fillRect(240, 270, 320, 50);

        // Loading progress callback
        this.load.on('progress', (value) => {
            loadingBar.clear();
            loadingBar.fillStyle(0x6366f1); // Indigo color
            loadingBar.fillRect(250, 280, 300 * value, 30);
        });

        // Remove loading bar when complete
        this.load.on('complete', () => {
            loadingBar.destroy();
            loadingBox.destroy();
        });
    }

    /**
     * Create and render the lobby scene (bypassing problematic tilemap for now)
     */
    createTiledMap() {
        console.log('🗺️ Creating Tiled map for Harry Potter lobby...');

        // Validate that the lobby tilemap was loaded
        if (!this.cache.tilemap.has('lobby')) {
            console.error('❌ Lobby tilemap not found in cache, creating fallback');
            this.createFallbackScene();
            return;
        }

        try {
            // Load the Tiled map
            const map = this.make.tilemap({ key: 'lobby' });
            console.log('✅ Tilemap created successfully');

            // Draw the background image layer (1024x1024) - NO SCALING
            this.backgroundImage = this.add.image(0, 0, 'lobby-bg').setOrigin(0, 0);
            console.log('🖼️ Background image displayed at full size (1024x1024)');

            // World bounds (use map dimensions)
            const mapW = map.widthInPixels;
            const mapH = map.heightInPixels;
            this.physics.world.setBounds(0, 0, mapW, mapH);
            this.cameras.main.setBounds(0, 0, mapW, mapH);
            console.log(`🌍 World bounds set to ${mapW}x${mapH}`);

            // Set up zoom-to-cover functionality (no letterboxing)
            const zoomToCover = () => {
                // canvas/panel size in CSS pixels
                const vw = this.scale.width;   // use Phaser's scaled size
                const vh = this.scale.height;

                // world size in world pixels
                const mapW = map.widthInPixels;
                const mapH = map.heightInPixels;

                // cover (no letterbox): fill the smaller dimension, crop the other
                const zoom = Math.max(vw / mapW, vh / mapH);

                this.cameras.main.setZoom(zoom);
                // center to something sensible (player will take over after startFollow)
                this.cameras.main.centerOn(mapW / 2, mapH / 2);
                this.cameras.main.setRoundPixels(true);

                console.log(`📷 Camera zoom set to ${zoom.toFixed(2)} (cover) for viewport ${vw}x${vh}`);
            };

            zoomToCover();
            this.scale.off('resize');          // make sure we don't stack listeners on hot reload
            this.scale.on('resize', zoomToCover);

            // === Collision objects with proper coordinate conversion ===
            const walls = this.physics.add.staticGroup();
            const objLayer = map.getObjectLayer('Object Layer 1');
            this.collisionBodies = [];

            if (objLayer) {
                console.log(`🔍 Found collision layer with ${objLayer.objects.length} objects`);

                objLayer.objects.forEach((o) => {
                    const collides = o.properties?.some(p => p.name === 'collides' && p.value === true);
                    if (!collides) return;

                    // Tiled gives top-left; Arcade uses center
                    const cx = o.x + o.width / 2;
                    const cy = o.y + o.height / 2;

                    // invisible static body
                    const rect = this.add.rectangle(cx, cy, o.width, o.height, 0x00ff00, 0);
                    this.physics.add.existing(rect, true);
                    walls.add(rect);
                    this.collisionBodies.push(rect);

                    console.log(`🧱 Created collision body: ${o.width}x${o.height} at center (${cx}, ${cy})`);
                });

                console.log(`✅ Created ${this.collisionBodies.length} collision bodies from tilemap`);
            } else {
                console.warn('⚠️ No collision layer found in tilemap');
            }

            // Store walls for player collision
            this.wallsGroup = walls;

            // Add UI overlay
            this.createLobbyUI();

            console.log('✅ Tiled map created and rendered successfully');
        } catch (error) {
            console.error('❌ Failed to create tilemap, using fallback:', error);
            this.createFallbackScene();
        }
    }

    /**
     * Create background image directly without tilemap
     */
    createDirectBackgroundImage() {
        console.log('🖼️ Creating direct background image...');

        // Add the background image directly - NO SCALING
        this.backgroundImage = this.add.image(0, 0, 'lobby-bg').setOrigin(0, 0);

        console.log('🖼️ Background image displayed at original size');
    }

    /**
     * Create collision boundaries for the lobby
     */
    createLobbyBoundaries() {
        console.log('🚧 Creating lobby collision boundaries...');

        const boundaries = this.physics.add.staticGroup();

        // Create world bounds (invisible walls)
        const topWall = boundaries.create(400, 10, null);
        topWall.setSize(800, 20).setVisible(false);
        topWall.body.immovable = true;

        const bottomWall = boundaries.create(400, 590, null);
        bottomWall.setSize(800, 20).setVisible(false);
        bottomWall.body.immovable = true;

        const leftWall = boundaries.create(10, 300, null);
        leftWall.setSize(20, 600).setVisible(false);
        leftWall.body.immovable = true;

        const rightWall = boundaries.create(790, 300, null);
        rightWall.setSize(20, 600).setVisible(false);
        rightWall.body.immovable = true;

        // Add some interior obstacles for more interesting gameplay
        const centerObstacle = boundaries.create(400, 200, null);
        centerObstacle.setSize(100, 50).setVisible(false);
        centerObstacle.body.immovable = true;

        const leftObstacle = boundaries.create(200, 400, null);
        leftObstacle.setSize(80, 60).setVisible(false);
        leftObstacle.body.immovable = true;

        const rightObstacle = boundaries.create(600, 350, null);
        rightObstacle.setSize(70, 80).setVisible(false);
        rightObstacle.body.immovable = true;

        this.collisionBodies = [topWall, bottomWall, leftWall, rightWall, centerObstacle, leftObstacle, rightObstacle];

        console.log(`✅ Created ${this.collisionBodies.length} collision boundaries`);
    }

    /**
     * Display the background image layer from the Tiled map
     * @param {object} mapInfo - Parsed map information from AssetLoader
     */
    displayBackgroundLayer(mapInfo) {
        console.log('🖼️ Displaying background layer from Tiled map...');

        // Find the background image layer
        const backgroundLayer = mapInfo.layers.imageLayers.find(layer =>
            layer.name === 'Background' && layer.visible
        );

        if (backgroundLayer && this.textures.exists('lobby-bg')) {
            // Display the background image at the position specified in Tiled - NO SCALING
            this.backgroundImage = this.add.image(0, 0, 'lobby-bg').setOrigin(0, 0);

            console.log('🖼️ Background image displayed at original size');
        } else {
            console.warn('⚠️ Background layer not found or image not loaded, creating fallback');
            this.createFallbackBackground();
        }
    }

    /**
     * Parse collision objects from the Tiled map and create physics bodies
     * @param {object} mapInfo - Parsed map information from AssetLoader
     */
    parseCollisionLayer(mapInfo) {
        console.log('🔍 Parsing collision layer from Tiled map...');

        // Find the collision object layer
        const collisionLayer = mapInfo.layers.objectLayers.find(layer =>
            layer.name === 'Collision'
        );

        if (!collisionLayer) {
            console.warn('⚠️ No collision layer found in Tiled map');
            this.createFallbackBoundaries();
            return;
        }

        // Create static physics group for collision bodies
        const collisionGroup = this.physics.add.staticGroup();
        let createdBodies = 0;

        // Process each collision object
        collisionLayer.objects.forEach((obj, index) => {
            // Check if object has collision property set to true
            const hasCollision = obj.properties &&
                obj.properties.some(prop =>
                    (prop.name === 'Collision' || prop.name === 'collision') && prop.value === true
                );

            // Skip objects with zero or negative dimensions
            if (hasCollision && obj.width > 0 && obj.height > 0) {
                // Create collision body at the exact position and size from Tiled
                const collisionBody = collisionGroup.create(
                    obj.x + obj.width / 2,  // Center X
                    obj.y + obj.height / 2, // Center Y
                    null // No texture, invisible
                );

                // Set the exact size from the Tiled map
                collisionBody.setSize(obj.width, obj.height);
                collisionBody.setVisible(false); // Make invisible
                collisionBody.body.immovable = true;

                this.collisionBodies.push(collisionBody);
                createdBodies++;

                console.log(`🧱 Created collision body ${createdBodies}:`, {
                    id: obj.id,
                    name: obj.name || 'unnamed',
                    x: obj.x,
                    y: obj.y,
                    width: obj.width,
                    height: obj.height,
                    centerX: obj.x + obj.width / 2,
                    centerY: obj.y + obj.height / 2
                });
            } else if (obj.width <= 0 || obj.height <= 0) {
                console.log(`⚠️ Skipping collision object ${index + 1} with invalid dimensions:`, {
                    width: obj.width,
                    height: obj.height
                });
            }
        });

        console.log(`✅ Created ${createdBodies} collision bodies from ${collisionLayer.objects.length} objects in Tiled map`);

        // If no collision bodies were created, add fallback boundaries
        if (createdBodies === 0) {
            console.warn('⚠️ No valid collision bodies found, creating fallback boundaries');
            this.createFallbackBoundaries();
        }
    }



    /**
     * Create fallback scene when tilemap loading fails
     */
    createFallbackScene() {
        console.log('🎨 Creating fallback scene...');
        this.createFallbackBackground();
        this.createFallbackBoundaries();
        this.createLobbyUI();
    }

    /**
     * Create fallback background if image loading fails
     */
    createFallbackBackground() {
        console.log('🎨 Creating fallback background...');

        // Create a gradient background for the wizarding world lobby
        this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
        this.add.rectangle(400, 300, 800, 600, 0x2d1b69, 0.3);

        // Add some magical sparkle effects
        for (let i = 0; i < 8; i++) {
            const x = 150 + Math.random() * 500;
            const y = 120 + Math.random() * 360;
            const sparkle = this.add.circle(x, y, 2, 0xffd700, 0.6);

            this.tweens.add({
                targets: sparkle,
                alpha: 0.2,
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * Create fallback boundaries if collision layer is missing
     */
    createFallbackBoundaries() {
        console.log('🚧 Creating fallback collision boundaries...');

        const boundaries = this.physics.add.staticGroup();

        // Create world bounds
        const topWall = boundaries.create(400, 0, null);
        topWall.setSize(800, 20).setVisible(false);

        const bottomWall = boundaries.create(400, 600, null);
        bottomWall.setSize(800, 20).setVisible(false);

        const leftWall = boundaries.create(0, 300, null);
        leftWall.setSize(20, 600).setVisible(false);

        const rightWall = boundaries.create(800, 300, null);
        rightWall.setSize(20, 600).setVisible(false);

        this.collisionBodies = [topWall, bottomWall, leftWall, rightWall];
    }

    /**
     * Create lobby UI elements
     */
    createLobbyUI() {
        // Clean lobby - no text overlays
        // All UI is handled by the React components in the sidebar
    }



    setupInputControls() {
        // Create cursor keys for arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create WASD keys
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
    }

    setupSocketListeners() {
        if (!this.socket) {
            console.warn('⚠️ No socket connection available for lobby scene');
            return;
        }

        // Initial snapshot when we join
        this.socket.on('room-snapshot', async (snapshot) => {
            console.log('📸 Received snapshot:', snapshot);
            console.log('🆔 My playerId:', this.playerId, 'Socket ID:', this.socket?.id);
            for (const p of (snapshot.players || [])) {
                const isMe = p.id === this.playerId || p.id === this.socket?.id;
                console.log('🔍 Player', p.id, 'isMe:', isMe);
                if (!isMe) {
                    await this.addRemotePlayer(p);
                }
            }
        });

        // New player arrived
        this.socket.on('player-spawn', async (p) => {
            console.log('✨ Player spawned:', p);
            console.log('🆔 My playerId:', this.playerId, 'Socket ID:', this.socket?.id);
            const isMe = p.id === this.playerId || p.id === this.socket?.id;
            console.log('🔍 Spawn player', p.id, 'isMe:', isMe);
            if (!isMe) await this.addRemotePlayer(p);
        });

        // Player left
        this.socket.on('player-left', ({ playerId }) => this.removeRemotePlayer(playerId));

        // Movement updates
        this.socket.on('player-movement', async (move) => {
            if (move.id === this.playerId) return;
            let rp = this.players.get(move.id);
            if (!rp) {
                await this.addRemotePlayer(move);
                rp = this.players.get(move.id);
            }
            if (rp) {
                // Smooth interpolation
                rp.setPosition(move.x, move.y);

                // Update animation
                const charKey = rp.charKey || getCharacterKey(move.charId || 'male_wizard_1');
                CharacterFactory.play(this, rp, charKey, move.action || 'idle', move.direction || 'down');

                rp.action = move.action;
                rp.direction = move.direction;
            }
        });

        // Listen for game state changes
        this.socket.on('game-started', (gameData) => {
            console.log('🚀 Game started, transitioning from lobby');
            // Future task: transition to narration scene
        });

        // Clean up listeners when scene shuts down
        this.events.on('shutdown', () => {
            this.socket.off('room-snapshot');
            this.socket.off('player-spawn');
            this.socket.off('player-left');
            this.socket.off('player-movement');
            this.socket?.off('room-joined');
            this.socket?.off('connect');
        });

        console.log('🔌 Socket listeners set up for multiplayer rectangles');
    }

    createLocalPlayer() {
        const startX = 500; // Start in open area
        const startY = 500;
        const charKey = getCharacterKey(this.charId);

        // Ensure animations exist for common actions
        CharacterFactory.ensureAnims(this, charKey, 'idle', 6, -1);
        CharacterFactory.ensureAnims(this, charKey, 'walk', 10, -1);
        CharacterFactory.ensureAnims(this, charKey, 'run', 12, -1);

        // Replace rectangle with physics sprite
        const me = this.physics.add.sprite(startX, startY, `pc:${charKey}:idle`, 0);
        me.setSize(28, 38).setOffset(18, 24); // tweak body for 64×64 visuals
        me.body.setCollideWorldBounds(true);

        // Make player collide with walls
        if (this.wallsGroup) {
            this.physics.add.collider(me, this.wallsGroup);
            console.log('✅ Local player collision with walls enabled');
        }

        // Camera follows player with smooth movement
        this.cameras.main.startFollow(me, true, 0.1, 0.1);

        this.localPlayer = me;
        this.playerId = this.playerId || this.socket?.id || null;
        this.localPlayer.playerId = this.playerId;
        this.localPlayer.charId = this.charId;
        this.localPlayer.charKey = charKey;
        this.localPlayer.action = 'idle';
        this.localPlayer.direction = 'down';

        // Play initial idle animation
        CharacterFactory.play(this, me, charKey, 'idle', 'down');

        // Note: join-lobby is now emitted in the connect handler to ensure proper timing

        console.log('👤 Local player created as character sprite at:', startX, startY, 'with ID:', this.localPlayer.playerId, 'character:', charKey);
    }

    handlePlayerInput() {
        if (!this.localPlayer?.body) return;

        const me = this.localPlayer;
        const charKey = me.charKey;
        let vx = 0, vy = 0, action = 'idle', dir = 'down';

        // Handle keyboard input
        const speed = this.input.keyboard.checkDown(this.input.keyboard.addKey('SHIFT')) ? 180 : 110;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            vx = -speed;
            dir = 'left';
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            vx = speed;
            dir = 'right';
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            vy = -speed;
            dir = 'up';
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            vy = speed;
            dir = 'down';
        }

        me.setVelocity(vx, vy);

        if (vx || vy) action = (Math.abs(vx) + Math.abs(vy)) > 120 ? 'run' : 'walk';

        // Update animation
        CharacterFactory.play(this, me, charKey, action, dir);

        // Store current state
        me.action = action;
        me.direction = dir;

        this.broadcastMovement();
    }

    broadcastMovement() {
        if (!this.socket || !this.localPlayer || !this.playerId) return;

        const now = Date.now();
        if (!this.lastBroadcast || now - this.lastBroadcast > 50) { // 20Hz
            this.socket.emit('player-movement', {
                roomId: this.roomId,
                id: this.playerId,
                x: this.localPlayer.x,
                y: this.localPlayer.y,
                action: this.localPlayer.action,
                direction: this.localPlayer.direction
            });
            this.lastBroadcast = now;
        }
    }

    updateAnimations() {
        // Animations are now handled by CharacterFactory.play() in handlePlayerInput()
        // This method can be used for other visual effects if needed
    }

    async addRemotePlayer(playerData) {
        if (this.players.has(playerData.id)) {
            console.log('⚠️ Player already exists:', playerData.id);
            return;
        }

        const charKey = getCharacterKey(playerData.charId || 'male_wizard_1');
        console.log('🧙 Creating character sprite for remote player:', playerData, 'character:', charKey);

        // Ensure character assets are loaded
        await this.ensureLoadedAndAnimated(charKey, ['idle', 'walk', 'run']);

        // Ensure animations exist
        CharacterFactory.ensureAnims(this, charKey, 'idle', 6, -1);
        CharacterFactory.ensureAnims(this, charKey, 'walk', 10, -1);
        CharacterFactory.ensureAnims(this, charKey, 'run', 12, -1);

        // Create physics sprite
        const s = this.physics.add.sprite(
            playerData.x ?? 400,
            playerData.y ?? 300,
            `pc:${charKey}:idle`,
            0
        );
        s.setSize(28, 38).setOffset(18, 24); // tweak body for 64×64 visuals
        s.body.setCollideWorldBounds(true);

        // Make remote player collide with walls
        if (this.wallsGroup) {
            this.physics.add.collider(s, this.wallsGroup);
        }

        // Store player data
        s.playerId = playerData.id;
        s.charId = playerData.charId;
        s.charKey = charKey;
        s.action = playerData.action || 'idle';
        s.direction = playerData.direction || 'down';

        this.players.set(playerData.id, s);

        // Play initial animation
        CharacterFactory.play(this, s, charKey, s.action, s.direction);

        console.log('✅ Remote player added as character sprite:', playerData.id, 'at', playerData.x, playerData.y, 'character:', charKey);
    }

    updateRemotePlayer(moveData) {
        const player = this.players.get(moveData.id);
        if (!player) return;

        // Smooth interpolation for remote player position
        player.setPosition(moveData.x, moveData.y);

        // Update player state
        player.action = moveData.action;
        player.direction = moveData.direction;

        // Update animation
        const charKey = player.charKey || getCharacterKey(moveData.charId || 'male_wizard_1');
        CharacterFactory.play(this, player, charKey, moveData.action || 'idle', moveData.direction || 'down');
    }

    removeRemotePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.destroy();
            this.players.delete(playerId);
            console.log('👋 Remote player removed:', playerId);
        }
    }

    // Utility method to ensure character assets are loaded
    async ensureLoadedAndAnimated(charKey, actions) {
        const needsLoading = actions.some(a => !this.textures.exists(`pc:${charKey}:${a}`));

        if (needsLoading) {
            actions.forEach(a => {
                if (!this.textures.exists(`pc:${charKey}:${a}`)) {
                    this.load.spritesheet(`pc:${charKey}:${a}`,
                        `/assets/wizarding/player_characters/${charKey}/${a}.png`,
                        { frameWidth: 64, frameHeight: 64 }
                    );
                }
            });

            return new Promise(resolve => {
                if (this.load.totalToLoad() === 0) return resolve();
                this.load.once('complete', () => resolve());
                this.load.start();
            });
        }
    }

    syncPlayersFromSession(session) {
        if (!session.players) return;

        // Get current player IDs in the game
        const currentPlayerIds = new Set(this.players.keys());

        // Get session player IDs (excluding local player)
        const sessionPlayerIds = new Set(
            session.players
                .filter(p => p.id !== 'local') // Exclude local player
                .map(p => p.id)
        );

        // Remove players who left
        for (const playerId of currentPlayerIds) {
            if (!sessionPlayerIds.has(playerId)) {
                this.removeRemotePlayer(playerId);
            }
        }

        // Add new players
        for (const player of session.players) {
            if (player.id !== 'local' && !this.players.has(player.id)) {
                this.addRemotePlayer({
                    id: player.id,
                    name: player.name,
                    charId: player.charId || this.charId,
                    x: 400 + Math.random() * 100 - 50, // Slight random offset
                    y: 300 + Math.random() * 100 - 50,
                    action: 'idle',
                    direction: 'down'
                });
            }
        }
    }

    /**
     * Test map loading and rendering functionality
     * @returns {object} Test results
     */
    testMapLoadingAndRendering() {
        console.log('🧪 Testing map loading and rendering...');

        const testResults = {
            tilemapLoaded: false,
            backgroundImageLoaded: false,
            backgroundDisplayed: false,
            collisionBodiesCreated: false,
            mapDataParsed: false,
            totalCollisionBodies: 0,
            errors: []
        };

        try {
            // Test if tilemap is loaded
            testResults.tilemapLoaded = this.cache.tilemap.has('lobby');
            if (!testResults.tilemapLoaded) {
                testResults.errors.push('Lobby tilemap not found in cache');
            }

            // Test if background image is loaded
            testResults.backgroundImageLoaded = this.textures.exists('lobby-bg');
            if (!testResults.backgroundImageLoaded) {
                testResults.errors.push('Lobby background image not loaded');
            }

            // Test if background is displayed
            testResults.backgroundDisplayed = !!this.backgroundImage;
            if (!testResults.backgroundDisplayed) {
                testResults.errors.push('Background image not displayed in scene');
            }

            // Test collision bodies
            testResults.totalCollisionBodies = this.collisionBodies.length;
            testResults.collisionBodiesCreated = testResults.totalCollisionBodies > 0;
            if (!testResults.collisionBodiesCreated) {
                testResults.errors.push('No collision bodies created from Tiled map');
            }

            // Test map data parsing
            if (testResults.tilemapLoaded) {
                const tilemapData = this.cache.tilemap.get('lobby').data;
                const mapInfo = this.assetLoader.parseTiledMapData(tilemapData);
                testResults.mapDataParsed = !!mapInfo && mapInfo.layers;
                if (!testResults.mapDataParsed) {
                    testResults.errors.push('Failed to parse Tiled map data');
                }
            }

            // Overall success
            const allTestsPassed = testResults.tilemapLoaded &&
                testResults.backgroundImageLoaded &&
                testResults.backgroundDisplayed &&
                testResults.collisionBodiesCreated &&
                testResults.mapDataParsed;

            console.log('🧪 Map loading test results:', testResults);

            if (allTestsPassed) {
                console.log('✅ All map loading and rendering tests passed!');
            } else {
                console.warn('⚠️ Some map loading tests failed:', testResults.errors);
            }

            return testResults;

        } catch (error) {
            console.error('❌ Error during map loading test:', error);
            testResults.errors.push(`Test execution error: ${error.message}`);
            return testResults;
        }
    }

    /**
     * Display test results in the scene for visual verification
     * @param {object} testResults - Results from testMapLoadingAndRendering
     */
    displayTestResults(testResults) {
        const startY = 100;
        const lineHeight = 20;
        let currentY = startY;

        // Title
        this.add.text(20, currentY, 'Tiled Map Loading Test Results:', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        currentY += lineHeight * 1.5;

        // Test results
        const tests = [
            { label: 'Tilemap Loaded', value: testResults.tilemapLoaded },
            { label: 'Background Image Loaded', value: testResults.backgroundImageLoaded },
            { label: 'Background Displayed', value: testResults.backgroundDisplayed },
            { label: 'Collision Bodies Created', value: testResults.collisionBodiesCreated },
            { label: 'Map Data Parsed', value: testResults.mapDataParsed }
        ];

        tests.forEach(test => {
            const color = test.value ? '#10b981' : '#ef4444'; // Green for pass, red for fail
            const status = test.value ? '✅ PASS' : '❌ FAIL';

            this.add.text(20, currentY, `${test.label}: ${status}`, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: color
            });
            currentY += lineHeight;
        });

        // Collision bodies count
        this.add.text(20, currentY, `Collision Bodies: ${testResults.totalCollisionBodies}`, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#a855f7'
        });
        currentY += lineHeight;

        // Errors
        if (testResults.errors.length > 0) {
            currentY += lineHeight * 0.5;
            this.add.text(20, currentY, 'Errors:', {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ef4444',
                fontStyle: 'bold'
            });
            currentY += lineHeight;

            testResults.errors.forEach(error => {
                this.add.text(20, currentY, `• ${error}`, {
                    fontSize: '10px',
                    fontFamily: 'Arial',
                    color: '#ef4444'
                });
                currentY += lineHeight * 0.8;
            });
        }
    }

    // Method to get scene status for debugging
    getSceneStatus() {
        return {
            sceneKey: this.scene.key,
            roomId: this.roomId,
            world: this.world,
            charId: this.charId,
            hasSocket: !!this.socket,
            playerCount: this.players.size,
            hasLocalPlayer: !!this.localPlayer,
            hasTiledMap: !!this.tiledMap,
            collisionBodiesCount: this.collisionBodies.length,
            backgroundImageLoaded: this.textures.exists('lobby-bg')
        };
    }
}

export default LobbyScene;