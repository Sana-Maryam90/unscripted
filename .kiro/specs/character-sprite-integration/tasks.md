# Implementation Plan

- [x] 1. Create CharacterAssetDiscovery service for dynamic character detection









  - Implement service class that scans public/assets/wizarding/player_characters/ directories
  - Create method to discover available characters by folder names (female_wizard_1, male_wizard_1, etc.)
  - Add function to detect available actions by scanning PNG files in character folders
  - Implement frame count calculation by loading images and dividing width by 64
  - Add validation to ensure character folders contain at least idle or walk actions
  - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2_



- [x] 2. Build CharacterSpriteManager class for sprite and animation management



  - Create CharacterSpriteManager class in src/lib/phaser/CharacterSpriteManager.js
  - Implement loadCharacterAssets method that loads spritesheets for a specific character
  - Add createCharacterAnimations method that generates animations for all available actions and directions
  - Create getAnimationKey method using format <charId>:<action>-<direction>
  - Implement createCharacterSprite method that creates Phaser sprites with physics bodies
  - Add updateSpriteAnimation method to change sprite animations based on action and direction
  - _Requirements: 2.1, 2.2, 3.1, 3.4, 7.1, 7.2, 7.3, 7.4_

- [x] 3. Enhance existing CharacterSelection component with sprite previews
  - Modify existing CharacterSelection.jsx to show character sprite previews instead of gradient circles
  - Add sprite preview loading that displays idle-down frames from character assets
  - Update character avatar section to render actual character sprites (64x64 pixel sprites)
  - Maintain existing character selection logic and availability checking
  - Ensure sprite previews maintain pixel art styling and crisp rendering
  - Add fallback to existing gradient circles if sprite loading fails
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Enhance AssetLoader to support character sprite loading
  - Modify existing AssetLoader class in src/lib/phaser/AssetLoader.js
  - Add loadCharacterSprites method that loads spritesheets for selected characters
  - Implement error handling for missing character assets with fallback options
  - Create preloadCharacterPreviews method for character selection screen
  - Add asset cleanup functionality to unload unused character sprites
  - Integrate with existing lobby asset loading workflow
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.3_

- [x] 5. Update LobbyScene to use character sprites instead of rectangles
  - Modify createLocalPlayer method in src/lib/phaser/scenes/LobbyScene.js to create character sprites
  - Update addRemotePlayer method to spawn character sprites based on player's selected character
  - Replace rectangle physics bodies with sprite physics bodies maintaining collision detection
  - Integrate CharacterSpriteManager for sprite creation and animation management
  - Ensure green highlight/frame is applied to local player sprite for identification
  - Maintain existing camera follow and collision systems with sprite objects
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3_

- [x] 6. Implement sprite animation system for player movement
  - Update handlePlayerInput method to trigger appropriate sprite animations
  - Modify updateAnimations method to manage sprite animation states (idle vs walk)
  - Add direction detection logic to play correct directional animations
  - Implement fallback animation logic when idle.png is missing (use middle frame of walk)
  - Create smooth animation transitions between idle and movement states
  - Ensure animation keys follow <charId>:<action>-<direction> format
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 3.4_

- [ ] 7. Enhance multiplayer synchronization for character data
  - Update socket event handlers to include characterId in player data
  - Modify player-movement broadcast to include character information
  - Add character-selected socket event for real-time character selection sync
  - Update room-snapshot and player-spawn events to include character data
  - Ensure character selection is preserved and synced when players join/leave
  - Implement character availability checking across multiplayer sessions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Create character mapping system for movie-to-sprite translation
  - Create character mapping configuration in src/config/characterMappings.js
  - Map movie character names to sprite character IDs (e.g., "Harry Potter" → "male_wizard_1", "Hermione Granger" → "female_wizard_1")
  - Update PhaserGameRoom component to use character mapping instead of simple name conversion
  - Ensure character mapping handles all available movie characters to sprite characters
  - Add fallback mapping for unmapped characters to default sprite characters
  - Maintain existing localStorage and session management for character selection
  - _Requirements: 1.4, 1.5, 5.4, 5.5_

- [x] 9. Integrate character selection with Phaser lobby flow
  - Update PhaserGameRoom component to read selected character from existing CharacterSelection component
  - Modify character ID passing to Phaser scene to use mapped sprite character identifiers
  - Ensure character selection from movie characters translates to proper sprite characters in lobby
  - Test character selection flow from movie character selection to sprite display in lobby
  - Verify character selection persistence across room reconnection and game state changes
  - _Requirements: 1.4, 1.5, 5.4, 5.5_

- [ ] 10. Add visual polish and pixel art consistency
  - Ensure all character sprites maintain pixel-perfect rendering without blurring
  - Implement proper sprite scaling that preserves pixel art integrity
  - Add subtle visual effects for local player identification (green frame/glow)
  - Create consistent pixel art styling for character selection screen
  - Implement hover effects and selection feedback with pixel art aesthetics
  - Ensure character name labels use monospace fonts matching existing UI
  - _Requirements: 4.1, 4.4, 4.5, 7.5_

- [ ] 11. Implement error handling and fallback systems
  - Add comprehensive error handling for missing character assets
  - Create fallback character sprites when selected character fails to load
  - Implement graceful degradation when animation creation fails
  - Add loading states and error messages for character selection screen
  - Create asset validation that checks for minimum required files (idle or walk)
  - Implement retry logic for failed asset loading operations
  - _Requirements: 6.3, 6.4, 6.5, 8.4_

- [ ] 12. Add character selection validation and conflict resolution
  - Implement first-come-first-served character selection with clear feedback
  - Add real-time character availability updates across all connected players
  - Create visual indicators when characters become unavailable due to other player selections
  - Implement automatic character deselection when another player claims the same character
  - Add clear error messages and alternative character suggestions
  - Ensure character selection state is properly cleaned up when players disconnect
  - _Requirements: 1.2, 1.3, 5.4, 8.5_

- [ ] 13. Optimize performance and memory management
  - Implement selective asset loading that only loads sprites for active players
  - Add asset cleanup when players leave or change characters
  - Create efficient animation caching to avoid recreating identical animations
  - Implement lazy loading for character actions that aren't immediately needed
  - Add performance monitoring for asset loading times and memory usage
  - Optimize sprite rendering for smooth performance with multiple animated characters
  - _Requirements: 6.1, 6.2, 6.5, 8.3, 8.5_

- [ ] 14. Test complete character sprite integration flow
  - Create end-to-end test for character selection and lobby sprite display
  - Test multiplayer character selection with multiple browser instances
  - Verify sprite animations work correctly with existing movement and collision systems
  - Test character selection conflicts and resolution across multiple players
  - Validate asset loading performance with all 4 character types
  - Ensure pixel art rendering quality is maintained across different screen sizes
  - _Requirements: All requirements validation_