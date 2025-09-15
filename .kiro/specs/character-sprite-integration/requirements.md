# Requirements Document

## Introduction

The Character Sprite Integration feature enhances the existing multiplayer lobby system by replacing colored rectangles with proper character sprites. This system allows 2-4 players to select from available wizard characters and see their chosen sprites displayed in both the character selection screen and the multiplayer lobby. The feature maintains the existing pixel art style and UX consistency while providing a more immersive visual experience.

## Requirements

### Requirement 1

**User Story:** As a player, I want to select from available wizard character sprites, so that I can have a visual representation of my character in the game.

#### Acceptance Criteria

1. WHEN accessing character selection THEN the system SHALL display up to 4 available wizard characters with their idle sprites
2. WHEN a character is available THEN the system SHALL show the character's idle-down frame as a selection icon
3. WHEN a character is selected by another player THEN the system SHALL mark that character as unavailable
4. WHEN I select a character THEN the system SHALL highlight my selection with a border or glow effect
5. WHEN character selection is complete THEN the system SHALL store my character choice for lobby display

### Requirement 2

**User Story:** As a player, I want to see character sprites in the multiplayer lobby, so that I can visually identify myself and other players.

#### Acceptance Criteria

1. WHEN entering the lobby THEN the system SHALL display my selected character sprite instead of a colored rectangle
2. WHEN other players are in the lobby THEN the system SHALL show their selected character sprites
3. WHEN I am the local player THEN the system SHALL display a green highlight or frame around my character
4. WHEN viewing other players THEN the system SHALL show their sprites without color overlays
5. WHEN players move THEN the system SHALL animate their character sprites appropriately

### Requirement 3

**User Story:** As a developer, I want a flexible character asset system, so that new characters and actions can be easily added without code changes.

#### Acceptance Criteria

1. WHEN character assets are organized THEN the system SHALL follow the LPC/ULPC format with 64x64 frames
2. WHEN loading character actions THEN the system SHALL dynamically detect available PNG files in character folders
3. WHEN calculating animation frames THEN the system SHALL compute columns as image.width / 64
4. WHEN an action sheet is missing THEN the system SHALL skip it automatically without errors
5. WHEN new characters are added THEN the system SHALL detect them automatically from the folder structure

### Requirement 4

**User Story:** As a player, I want the character selection screen to match the game's visual style, so that the experience feels cohesive.

#### Acceptance Criteria

1. WHEN viewing character selection THEN the system SHALL maintain consistency with the "Wizarding World of Elmore" pixel art style
2. WHEN characters are displayed THEN the system SHALL show them in a 2x2 grid layout for up to 4 players
3. WHEN a character has a name THEN the system SHALL display the character name label under the sprite
4. WHEN the screen loads THEN the system SHALL display a clear "Select Your Character" title
5. WHEN selection is made THEN the system SHALL provide visual feedback before transitioning to lobby

### Requirement 5

**User Story:** As a player, I want character sprites to work seamlessly with existing multiplayer features, so that gameplay is not disrupted.

#### Acceptance Criteria

1. WHEN sprites are implemented THEN the system SHALL maintain all existing multiplayer synchronization
2. WHEN players move THEN the system SHALL preserve the current movement and collision detection systems
3. WHEN players join or leave THEN the system SHALL handle sprite creation and cleanup properly
4. WHEN reconnecting THEN the system SHALL restore the player's selected character sprite
5. WHEN the lobby is full THEN the system SHALL display all 4 character sprites correctly

### Requirement 6

**User Story:** As a system administrator, I want efficient asset loading, so that the game performs well with multiple players.

#### Acceptance Criteria

1. WHEN loading assets THEN the system SHALL only load sprites for selected player characters
2. WHEN characters are not selected THEN the system SHALL not load unnecessary character assets
3. WHEN assets fail to load THEN the system SHALL provide fallback sprites or error handling
4. WHEN multiple actions exist THEN the system SHALL load them dynamically based on availability
5. WHEN memory is managed THEN the system SHALL clean up unused character assets appropriately

### Requirement 7

**User Story:** As a player, I want character animations to be smooth and responsive, so that movement feels natural.

#### Acceptance Criteria

1. WHEN a character moves THEN the system SHALL play the appropriate directional walk animation
2. WHEN a character stops THEN the system SHALL switch to the idle animation for that direction
3. WHEN no idle sheet exists THEN the system SHALL use the middle frame of the walk animation
4. WHEN animations are created THEN the system SHALL use the format <charId>:<action>-<direction>
5. WHEN sprite scaling occurs THEN the system SHALL maintain pixel art integrity without blurring

### Requirement 8

**User Story:** As a developer, I want the character system to be extensible, so that new worlds and characters can be added easily.

#### Acceptance Criteria

1. WHEN adding new worlds THEN the system SHALL support creating new asset folders
2. WHEN adding new characters THEN the system SHALL require only dropping files in the correct subfolder structure
3. WHEN adding new actions THEN the system SHALL automatically detect and load new action PNG files
4. WHEN the folder structure changes THEN the system SHALL adapt without requiring code modifications
5. WHEN NPCs are needed THEN the system SHALL support loading only required actions for non-player characters