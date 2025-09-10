# Implementation Plan

- [x] 1. Set up Phaser 3 integration with Next.js








  - Install Phaser 3 dependency and configure for Next.js SSR compatibility
  - Create Phaser game container component that mounts after client-side hydration
  - Set up basic game configuration with Arcade Physics enabled
  - Create game initialization system that receives roomId, world, and charId from Next.js
  - _Requirements: 1.1, 1.4, 9.1_
-

- [x] 2. Create basic Lobby Scene structure




  - Implement LobbyScene class extending Phaser.Scene with preload, create, and update methods
  - Set up scene key registration and basic scene management
  - Create placeholder lobby scene that displays a simple background
  - Integrate scene with existing Socket.io connection from Next.js room system
  - _Requirements: 1.2, 1.3, 9.4_

- [x] 3. Implement Tiled map loading system for Harry Potter lobby














  - Create AssetLoader class for loading lobby.tmj and lobby.png from public/assets/wizarding/maps/
  - Implement Tiled map parsing and rendering in Phaser scene
  - Load and display the Harry Potter lobby background image as image layer
  - Test map loading and rendering with the provided lobby assets
  - _Requirements: 1.3, 8.1_

- [x] 4. Fix multiplayer player ID system and visible rectangles








  - Replace hardcoded "local" ID with unique socket.id for each client in LobbyScene.init()
  - Cache this.playerId = this.socket.id on connect event for stable unique identification
  - Create visible rectangles instead of null texture sprites for immediate visual feedback
  - Implement createLocalPlayer() with green rectangle (0x00ff00) and Arcade physics body
  - Implement addRemotePlayer() with red rectangles (0xff4444) and collision detection
  - _Requirements: 4.1, 4.2, 5.4_

- [ ] 5. Implement authoritative server-side room state management
  - Create server-side rooms Map storing { players: Map() } with socket.id as key
  - Implement room-snapshot event that sends full player list to new joiners
  - Add player-spawn server handler that stores { id, charId, x, y, action, direction } in room.players
  - Broadcast player-spawn to existing room members when new player joins
  - Handle disconnect cleanup by removing from room.players and broadcasting player-left
  - _Requirements: 4.3, 4.4, 6.1, 6.2_

- [ ] 6. Build throttled movement broadcasting system
  - Implement handlePlayerInput() with WASD/arrow key detection and 200px/s velocity
  - Create broadcastMovement() with 50ms throttling (20Hz) using lastBroadcast timestamp
  - Use socket.emit('player-movement') with roomId, unique socket.id, x, y, action, direction
  - Set up server relay that updates room.players state and broadcasts to room members
  - Filter out velocity when no keys pressed and set action to 'idle' vs 'walk'
  - _Requirements: 3.1, 3.2, 3.5, 4.2_

- [ ] 7. Create smooth remote player interpolation system
  - Set up socket listeners for room-snapshot, player-spawn, player-left, player-movement
  - Implement Phaser.Math.Linear interpolation (0.6 lerp factor) for smooth remote positions
  - Filter out self-updates (move.id === this.playerId) to prevent local player conflicts
  - Add late-joiner support by creating missing remote players from movement updates
  - Clean up socket listeners on scene shutdown to prevent double-handlers after hot reloads
  - _Requirements: 4.2, 4.4, 9.2, 9.3_

- [ ] 8. Build collision detection system with wallsGroup
  - Parse collision layer objects from lobby.tmj file for collision boundaries
  - Create wallsGroup as static physics group for all collision objects
  - Implement collision body creation that respects authored collision rectangles exactly
  - Set up collision bodies as invisible static physics objects using setVisible(false)
  - Add collider between all player rectangles (local and remote) and wallsGroup
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Implement dynamic Harry Potter character asset loading (post-rectangle testing)
  - Create character asset discovery system that scans public/assets/wizarding/player_characters/<charId>/ directories
  - Implement dynamic action detection by checking for available PNG files (walk, idle, spellcast, etc.)
  - Load character spritesheets with ULPC format (64x64 frames, 4 rows for directions)
  - Calculate frame counts dynamically from image dimensions (width/64 for columns)
  - Replace rectangles with actual character sprites while maintaining same networking protocol
  - _Requirements: 2.2, 2.3, 8.1, 8.2, 8.3_

- [ ] 10. Build Harry Potter character animation system (post-rectangle testing)
  - Create AnimationManager class for generating character animations
  - Implement animation key generation as <charId>:<action>-<direction> format
  - Build animations for 4 directions (up, left, down, right) from ULPC sprite rows
  - Implement idle animation fallback using middle frame of walk animation when idle.png missing
  - Swap rectangle rendering for sprite animations without changing network protocol
  - _Requirements: 2.4, 8.4_

- [ ] 11. Add ready state integration and game start transition
  - Connect Phaser lobby scene with existing Next.js Ready button system
  - Implement game start detection when 2+ players are ready and all present players are ready
  - Create lobby to full-screen transition that hides left-side room panel
  - Set up scene transition preparation for narration scene
  - _Requirements: 6.3, 6.4, 6.5, 7.1, 7.2_

- [ ] 12. Create narration scene for story presentation
  - Implement NarrationScene class for full-screen story display
  - Create story text display system with "Professors vanished; Headmaster explains..." content
  - Add narration completion detection and transition to next scene
  - Implement scene transition from lobby to narration when game starts
  - _Requirements: 7.3, 7.4_

- [ ] 13. Build Dorm Room scene as post-narration starting area
  - Create DormScene class that loads dorm.tmj and dorm.png from wizarding assets
  - Implement player spawning inside the dorm room after narration
  - Set up collision detection and movement system for dorm room
  - Create door exit detection for transition to overworld (placeholder for now)
  - _Requirements: 7.4, 7.5_

- [ ] 14. Create basic Overworld scene placeholder
  - Implement OverworldScene class as placeholder for future Library/Potions areas
  - Load overworld.tmj and overworld.png (or create basic placeholder map)
  - Set up basic player movement and camera system for overworld exploration
  - Create scene transition from dorm room to overworld when players exit door
  - _Requirements: 7.5_

- [ ] 15. Optimize asset loading and memory management
  - Implement selective asset loading that only loads sprites for 2-4 selected characters
  - Create asset cleanup system that unloads unused character assets between scenes
  - Add loading states and error handling for missing character assets
  - Optimize animation creation to reuse similar animations across characters
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 16. Add error handling and reconnection support
  - Implement Socket.io disconnection handling with game pause and reconnection UI
  - Create fallback systems for missing character assets or map loading failures
  - Add error recovery for animation creation failures
  - Implement state synchronization recovery when players reconnect
  - _Requirements: 9.5_

- [ ] 17. Test complete multiplayer lobby flow
  - Create end-to-end test for lobby joining, character movement, and ready state synchronization
  - Test multiplayer character movement synchronization across multiple browser instances
  - Verify collision detection works correctly with authored Tiled map collision boundaries
  - Test complete scene progression from lobby → narration → dorm → overworld
  - _Requirements: All requirements validation_