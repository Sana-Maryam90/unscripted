# Design Document

## Overview

The Character Sprite Integration system enhances the existing Phaser multiplayer lobby by replacing colored rectangles with proper character sprites. The system provides a character selection screen where players choose from available wizard characters, then displays these sprites in the multiplayer lobby with appropriate animations and visual feedback.

The design leverages the existing LPC/ULPC sprite format assets and builds upon the current multiplayer infrastructure without disrupting existing functionality.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React UI Layer                           │
├─────────────────────────────────────────────────────────────┤
│  CharacterSelectionScreen  │  PhaserGameRoom (Enhanced)     │
│  - Character Grid Display  │  - Sprite Display Integration  │
│  - Selection Logic        │  - Multiplayer Sync            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Phaser Game Layer                         │
├─────────────────────────────────────────────────────────────┤
│  LobbyScene (Enhanced)     │  CharacterSpriteManager        │
│  - Sprite Rendering        │  - Asset Loading               │
│  - Animation Management    │  - Animation Creation          │
│  - Multiplayer Sync        │  - Sprite Management           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Asset Management Layer                     │
├─────────────────────────────────────────────────────────────┤
│  AssetLoader (Enhanced)    │  CharacterAssetDiscovery       │
│  - Dynamic Asset Loading   │  - Folder Scanning             │
│  - Error Handling          │  - Action Detection            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Character Selection**: Player selects character → React stores selection → Passes to Phaser
2. **Asset Loading**: Phaser loads selected character sprites → Creates animations → Ready for display
3. **Multiplayer Sync**: Character selection synced via Socket.io → All players see selected sprites
4. **Lobby Display**: Sprites replace rectangles → Animations play based on movement → Visual feedback maintained

## Components and Interfaces

### 1. CharacterSelectionScreen Component

**Purpose**: React component for character selection UI

**Interface**:
```javascript
interface CharacterSelectionScreenProps {
  availableCharacters: Character[]
  onCharacterSelect: (characterId: string) => void
  selectedCharacter?: string
  maxPlayers: number
}

interface Character {
  id: string
  name: string
  spritePreview: string // idle-down frame
  isAvailable: boolean
}
```

**Key Methods**:
- `renderCharacterGrid()`: Display 2x2 character grid
- `handleCharacterClick()`: Process character selection
- `getCharacterPreview()`: Load idle sprite for preview

### 2. CharacterSpriteManager Class

**Purpose**: Manages character sprite loading, animation creation, and rendering

**Interface**:
```javascript
class CharacterSpriteManager {
  constructor(scene: Phaser.Scene)
  
  // Asset Management
  async loadCharacterAssets(characterId: string): Promise<void>
  discoverAvailableActions(characterId: string): string[]
  
  // Animation Management  
  createCharacterAnimations(characterId: string): void
  getAnimationKey(characterId: string, action: string, direction: string): string
  
  // Sprite Management
  createCharacterSprite(characterId: string, x: number, y: number): Phaser.GameObjects.Sprite
  updateSpriteAnimation(sprite: Phaser.GameObjects.Sprite, action: string, direction: string): void
}
```

### 3. Enhanced LobbyScene

**Purpose**: Modified LobbyScene that uses sprites instead of rectangles

**Key Changes**:
- Replace `createLocalPlayer()` to use character sprites
- Modify `addRemotePlayer()` to create sprite-based players
- Update `handlePlayerInput()` to trigger sprite animations
- Enhance `updateAnimations()` to manage sprite states

### 4. CharacterAssetDiscovery Service

**Purpose**: Dynamically discovers available characters and actions

**Interface**:
```javascript
class CharacterAssetDiscovery {
  static async getAvailableCharacters(world: string): Promise<Character[]>
  static async getCharacterActions(world: string, characterId: string): Promise<string[]>
  static calculateFrameCount(imagePath: string): Promise<number>
  static validateAssetStructure(characterPath: string): Promise<boolean>
}
```

## Data Models

### Character Model
```javascript
interface Character {
  id: string              // e.g., "female_wizard_1"
  name: string           // e.g., "Female Wizard"
  world: string          // e.g., "wizarding"
  availableActions: string[]  // e.g., ["walk", "idle", "spellcast"]
  spriteFrames: {
    [action: string]: {
      frameCount: number
      frameSize: { width: number, height: number }
    }
  }
}
```

### Animation Configuration
```javascript
interface AnimationConfig {
  key: string            // e.g., "female_wizard_1:walk-down"
  frames: Phaser.Types.Animations.AnimationFrame[]
  frameRate: number      // Default: 8 FPS
  repeat: number         // -1 for loop, 0 for once
}
```

### Player State (Enhanced)
```javascript
interface PlayerState {
  id: string
  name: string
  characterId: string    // NEW: Selected character
  x: number
  y: number
  action: string         // "idle" | "walk" | "run" | etc.
  direction: string      // "up" | "down" | "left" | "right"
  isReady: boolean
  isHost: boolean
}
```

## Asset Loading Strategy

### Dynamic Asset Discovery

The system dynamically discovers available characters and actions:

```javascript
// Asset structure scanning
const characterPath = `public/assets/${world}/player_characters/${characterId}/`
const actionFiles = await scanDirectory(characterPath)
const availableActions = actionFiles
  .filter(file => file.endsWith('.png'))
  .map(file => file.replace('.png', ''))
```

### Lazy Loading Approach

1. **Character Selection Phase**: Load only preview sprites (idle-down frames)
2. **Lobby Entry**: Load full character assets for selected characters only
3. **Runtime**: Load additional actions on-demand if needed

### Frame Count Calculation

```javascript
// Dynamic frame count detection
const image = new Image()
image.src = spritePath
await image.decode()
const frameCount = image.width / 64  // ULPC standard: 64px frame width
```

## Animation System

### Animation Key Format

All animations use the format: `<characterId>:<action>-<direction>`

Examples:
- `female_wizard_1:walk-down`
- `male_wizard_1:idle-up`
- `female_wizard_2:spellcast-right`

### Animation Creation Logic

```javascript
// For each character and action combination
for (const action of availableActions) {
  for (const direction of ['up', 'left', 'down', 'right']) {
    const animKey = `${characterId}:${action}-${direction}`
    const startFrame = directionIndex * frameCount
    const endFrame = startFrame + frameCount - 1
    
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(textureKey, {
        start: startFrame,
        end: endFrame
      }),
      frameRate: 8,
      repeat: action === 'idle' ? -1 : 0
    })
  }
}
```

### Fallback Animation Strategy

When `idle.png` is missing:
1. Use middle frame of `walk.png` animation
2. Create static animation with single frame
3. Apply to appropriate direction

## Multiplayer Integration

### Character Selection Sync

```javascript
// When player selects character
socket.emit('character-selected', {
  playerId: socket.id,
  characterId: selectedCharacter
})

// Broadcast to other players
socket.broadcast.to(roomId).emit('player-character-changed', {
  playerId: socket.id,
  characterId: selectedCharacter
})
```

### Sprite State Synchronization

The existing movement synchronization is enhanced to include character information:

```javascript
// Enhanced movement broadcast
socket.emit('player-movement', {
  roomId: this.roomId,
  id: this.playerId,
  characterId: this.characterId,  // NEW
  x: this.localPlayer.x,
  y: this.localPlayer.y,
  action: this.localPlayer.action,
  direction: this.localPlayer.direction
})
```

## Visual Design Integration

### Character Selection Screen Design

**Layout**: 2x2 grid matching the pixel art style
- **Background**: Dark theme consistent with "Wizarding World of Elmore"
- **Character Cards**: Pixel-perfect borders with hover effects
- **Selection Feedback**: Glowing border or highlight effect
- **Typography**: Monospace font matching existing UI

### Lobby Sprite Display

**Local Player Identification**:
- Green highlight frame around local player sprite
- Subtle glow effect for better visibility
- Maintains existing visual feedback system

**Remote Player Display**:
- Clean sprite display without color overlays
- Optional subtle name tags above sprites
- Consistent with multiplayer visual language

## Error Handling

### Asset Loading Failures

1. **Missing Character Folder**: Fall back to default character
2. **Missing Action Files**: Skip unavailable actions gracefully
3. **Corrupted Sprites**: Display error placeholder and continue
4. **Network Issues**: Cache loaded assets for offline resilience

### Animation Failures

1. **Invalid Frame Counts**: Recalculate or use fallback
2. **Missing Animations**: Use default idle animation
3. **Performance Issues**: Reduce animation complexity dynamically

### Multiplayer Sync Issues

1. **Character Selection Conflicts**: First-come-first-served with clear feedback
2. **Sprite Loading Delays**: Show loading indicators
3. **Disconnection Handling**: Preserve character selection on reconnect

## Testing Strategy

### Unit Testing

1. **CharacterSpriteManager**: Test asset loading and animation creation
2. **AssetDiscovery**: Test folder scanning and validation
3. **Animation System**: Test key generation and frame calculations

### Integration Testing

1. **Character Selection Flow**: End-to-end selection and lobby display
2. **Multiplayer Sync**: Multi-browser character selection and display
3. **Asset Loading**: Test with various character configurations

### Performance Testing

1. **Asset Loading Times**: Measure loading performance with multiple characters
2. **Animation Performance**: Test smooth animation playback
3. **Memory Usage**: Monitor asset cleanup and memory management

### Visual Testing

1. **Pixel Perfect Rendering**: Ensure sprites maintain crisp pixel art quality
2. **Animation Smoothness**: Verify consistent frame rates
3. **UI Consistency**: Match existing visual design language

## Implementation Phases

### Phase 1: Character Selection Screen
- Create React component for character selection
- Implement character discovery and preview loading
- Add selection state management and validation

### Phase 2: Sprite Manager Integration  
- Develop CharacterSpriteManager class
- Implement dynamic asset loading system
- Create animation generation logic

### Phase 3: Lobby Scene Enhancement
- Replace rectangle creation with sprite creation
- Update player input handling for sprite animations
- Integrate multiplayer synchronization

### Phase 4: Polish and Optimization
- Add error handling and fallback systems
- Optimize asset loading and memory management
- Implement visual polish and effects