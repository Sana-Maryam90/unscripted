# Requirements Document

## Introduction

The Phaser 3 Multiplayer Lobby is a real-time multiplayer game system that transforms the existing Next.js room-based interface into an interactive 2D game world. Players join rooms, select characters from the wizarding world, and move around together in a shared lobby space before progressing through narrative-driven game scenes. The system integrates Phaser 3 game engine with the existing Socket.io multiplayer infrastructure to create an "Among Us"-style lobby experience with character movement, collision detection, and synchronized multiplayer interactions.

## Requirements

### Requirement 1

**User Story:** As a player, I want to see a Phaser 3 game canvas replace the right-side quiz panel, so that I can interact with a visual game world instead of static UI elements.

#### Acceptance Criteria

1. WHEN a player enters a room THEN the system SHALL replace the right-side panel with a Phaser 3 canvas
2. WHEN the Phaser canvas loads THEN the system SHALL display the wizarding world lobby scene
3. WHEN the game initializes THEN the system SHALL load the lobby.tmj Tiled map with lobby.png background
4. WHEN the lobby loads THEN the system SHALL maintain the existing left-side room roster and Ready buttons
5. WHEN Phaser is active THEN the system SHALL handle both game input and UI interactions seamlessly

### Requirement 2

**User Story:** As a player, I want my selected character to appear in the lobby with proper animations, so that I can see my character representation in the game world.

#### Acceptance Criteria

1. WHEN a player joins the lobby THEN the system SHALL spawn their selected character at a designated spawn point
2. WHEN character sprites load THEN the system SHALL use ULPC format sprites from public/assets/wizarding/player_characters/<charId>/
3. WHEN loading character animations THEN the system SHALL discover available actions from filenames dynamically
4. WHEN creating animations THEN the system SHALL build animation keys as <charId>:<action>-<direction>
5. IF idle.png is missing THEN the system SHALL use the middle frame of the walk animation as fallback idle

### Requirement 3

**User Story:** As a player, I want to move my character around the lobby using WASD or arrow keys, so that I can explore the space and interact with the environment.

#### Acceptance Criteria

1. WHEN a player presses movement keys THEN the character SHALL move in the corresponding direction
2. WHEN a character moves THEN the system SHALL play the appropriate walk animation for the movement direction
3. WHEN a character stops moving THEN the system SHALL play the idle animation for the current facing direction
4. WHEN a character encounters a wall THEN the system SHALL prevent movement through collision detection
5. WHEN movement occurs THEN the system SHALL broadcast position updates to other players via Socket.io

### Requirement 4

**User Story:** As a player, I want to see other players' characters moving around the lobby in real-time, so that I can experience the multiplayer aspect of the game.

#### Acceptance Criteria

1. WHEN another player joins THEN their character SHALL appear at a spawn point in my lobby view
2. WHEN another player moves THEN their character SHALL move smoothly in my game view
3. WHEN another player changes animation THEN the corresponding animation SHALL play on their character
4. WHEN players disconnect THEN their characters SHALL be removed from the lobby
5. WHEN receiving movement updates THEN the system SHALL interpolate character positions for smooth movement

### Requirement 5

**User Story:** As a player, I want collision detection with walls and objects, so that characters cannot walk through solid barriers in the lobby.

#### Acceptance Criteria

1. WHEN the lobby map loads THEN the system SHALL read collision objects from the collision layer
2. WHEN collision objects have collides: true property THEN the system SHALL create static physics bodies
3. WHEN a character moves toward a collision boundary THEN the system SHALL prevent movement through the barrier
4. WHEN collision detection is active THEN characters SHALL only move in valid, non-colliding areas
5. WHEN collision boundaries are set THEN the system SHALL respect the authored collision rectangles exactly

### Requirement 6

**User Story:** As a player, I want the game to support 2-4 players with proper spawn management, so that all players can join and move around without conflicts.

#### Acceptance Criteria

1. WHEN players join the lobby THEN the system SHALL assign spawn points from the spawns object layer
2. WHEN multiple players are present THEN each SHALL have a unique spawn location
3. WHEN 2 or more players are ready THEN the Start button SHALL become available to the host
4. WHEN all present players are ready THEN the system SHALL allow immediate game start without waiting for additional players
5. WHEN the maximum of 4 players is reached THEN the system SHALL prevent additional players from joining

### Requirement 7

**User Story:** As a player, I want the game to transition from lobby to full-screen narrative scenes, so that the gameplay can progress beyond the initial lobby experience.

#### Acceptance Criteria

1. WHEN the host clicks Start with all players ready THEN the system SHALL hide the left-side room panel
2. WHEN transitioning from lobby THEN the system SHALL expand the game to full-screen mode
3. WHEN full-screen mode activates THEN the system SHALL display a narration screen with story text
4. WHEN narration completes THEN the system SHALL load the Dorm Room scene from dorm.tmj map
5. WHEN players exit the dorm door THEN the system SHALL transition to the Overworld scene

### Requirement 8

**User Story:** As a player, I want efficient asset loading that only loads necessary character sprites, so that the game performs well and doesn't waste memory.

#### Acceptance Criteria

1. WHEN the lobby initializes THEN the system SHALL only load sprites for the 2-4 selected player characters
2. WHEN loading character assets THEN the system SHALL dynamically compute frame counts from image dimensions
3. WHEN discovering actions THEN the system SHALL scan available PNG files without hardcoding action names
4. WHEN NPCs are present THEN the system SHALL load only the actions they actually use
5. WHEN assets are organized THEN the system SHALL maintain world-based namespacing for future expansion

### Requirement 9

**User Story:** As a player, I want seamless integration between the existing Next.js room system and the new Phaser game, so that room management and game interaction work together smoothly.

#### Acceptance Criteria

1. WHEN entering a room THEN the system SHALL pass world, roomId, and charId to the Phaser lobby scene
2. WHEN Socket.io events occur THEN the system SHALL synchronize between Next.js UI and Phaser game state
3. WHEN players join or leave THEN both the room roster and game lobby SHALL update consistently
4. WHEN ready states change THEN both the UI buttons and game logic SHALL reflect the current state
5. WHEN game transitions occur THEN the system SHALL maintain Socket.io connection throughout scene changes

### Requirement 10

**User Story:** As a player, I want the system to support multiple game worlds through organized asset structure, so that future worlds can be easily added without code changes.

#### Acceptance Criteria

1. WHEN organizing assets THEN the system SHALL use public/assets/<world>/ directory structure
2. WHEN loading maps THEN the system SHALL look for files in assets/<world>/maps/ directory
3. WHEN loading character sprites THEN the system SHALL use assets/<world>/player_characters/ structure
4. WHEN loading NPCs THEN the system SHALL use assets/<world>/npcs/ directory structure
5. WHEN adding new worlds THEN the system SHALL require only new asset folders without code modifications