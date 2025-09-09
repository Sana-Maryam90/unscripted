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

- [ ] 4. Build collision detection system from Tiled map data




  - Parse collision layer objects from lobby.tmj file
  - Create static physics bodies for objects with collides: true property
  - Implement collision body creation that respects authored collision rectangles exactly
  - Set up collision bodies as invisible static physics objects
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Create spawn point management system


  - Parse spawns object layer from Tiled map to extract spawn point coordinates
  - Implement SpawnManager class to track available and used spawn points
  - Create spawn point assignment system for 2-4 players
  - Add spawn point release mechanism when players leave
  - _Requirements: 6.1, 6.2_

- [ ] 6. Implement dynamic Harry Potter character asset loading


  - Create character asset discovery system that scans public/assets/wizarding/player_characters/<charId>/ directories
  - Implement dynamic action detection by checking for available PNG files (walk, idle, spellcast, etc.)
  - Load character spritesheets with ULPC format (64x64 frames, 4 rows for directions)
  - Calculate frame counts dynamically from image dimensions (width/64 for columns)
  - _Requirements: 2.2, 2.3, 8.1, 8.2, 8.3_

- [ ] 7. Build Harry Potter character animation system
  - Create AnimationManager class for generating character animations
  - Implement animation key generation as <charId>:<action>-<direction> format
  - Build animations for 4 directions (up, left, down, right) from ULPC sprite rows
  - Implement idle animation fallback using middle frame of walk animation when idle.png missing
  - _Requirements: 2.4, 8.4_

- [ ] 8. Create local player character and movement system
  - Spawn local player character at assigned spawn point using selected charId
  - Implement WASD and arrow key input handling for character movement
  - Create movement velocity system with collision detection against map boundaries
  - Implement animation switching between walk and idle based on movement state
  - _Requirements: 3.1, 3.2, 3.3, 5.4_

- [ ] 9. Implement multiplayer character synchronization
  - Set up Socket.io event listeners for player-joined-lobby, player-moved, player-left-lobby
  - Create remote player spawning system that adds other players' characters to the scene
  - Implement movement broadcasting system that sends position updates to other players
  - Build remote player movement interpolation for smooth character movement
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.2, 9.3_

- [ ] 10. Add ready state integration and game start transition
  - Connect Phaser lobby scene with existing Next.js Ready button system
  - Implement game start detection when 2+ players are ready and all present players are ready
  - Create lobby to full-screen transition that hides left-side room panel
  - Set up scene transition preparation for narration scene
  - _Requirements: 6.3, 6.4, 6.5, 7.1, 7.2_

- [ ] 11. Create narration scene for story presentation
  - Implement NarrationScene class for full-screen story display
  - Create story text display system with "Professors vanished; Headmaster explains..." content
  - Add narration completion detection and transition to next scene
  - Implement scene transition from lobby to narration when game starts
  - _Requirements: 7.3, 7.4_

- [ ] 12. Build Dorm Room scene as post-narration starting area
  - Create DormScene class that loads dorm.tmj and dorm.png from wizarding assets
  - Implement player spawning inside the dorm room after narration
  - Set up collision detection and movement system for dorm room
  - Create door exit detection for transition to overworld (placeholder for now)
  - _Requirements: 7.4, 7.5_

- [ ] 13. Create basic Overworld scene placeholder
  - Implement OverworldScene class as placeholder for future Library/Potions areas
  - Load overworld.tmj and overworld.png (or create basic placeholder map)
  - Set up basic player movement and camera system for overworld exploration
  - Create scene transition from dorm room to overworld when players exit door
  - _Requirements: 7.5_

- [ ] 14. Optimize asset loading and memory management
  - Implement selective asset loading that only loads sprites for 2-4 selected characters
  - Create asset cleanup system that unloads unused character assets between scenes
  - Add loading states and error handling for missing character assets
  - Optimize animation creation to reuse similar animations across characters
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 15. Add error handling and reconnection support
  - Implement Socket.io disconnection handling with game pause and reconnection UI
  - Create fallback systems for missing character assets or map loading failures
  - Add error recovery for animation creation failures
  - Implement state synchronization recovery when players reconnect
  - _Requirements: 9.5_

- [ ] 16. Test complete multiplayer lobby flow
  - Create end-to-end test for lobby joining, character movement, and ready state synchronization
  - Test multiplayer character movement synchronization across multiple browser instances
  - Verify collision detection works correctly with authored Tiled map collision boundaries
  - Test complete scene progression from lobby → narration → dorm → overworld
  - _Requirements: All requirements validation_