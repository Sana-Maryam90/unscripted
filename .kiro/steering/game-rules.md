# Game Rules and Logic

## Core Game Flow

1. **Room Creation**: Host creates room with movie selection
2. **Player Joining**: Up to 4 players join with unique identifiers
3. **Character Assignment**: Players choose or are assigned character perspectives
4. **Story Progression**: AI presents story segments with choice points
5. **Collaborative Decisions**: Players vote on story directions
6. **Dynamic Narrative**: Story adapts based on collective choices

## Turn Management

- **Turn Timer**: 5-minute maximum per decision point
- **Voting System**: Majority rule with tie-breaking mechanisms
- **Player Status**: Active, waiting, disconnected states
- **Auto-progression**: Continue story if players are inactive

## Content Generation Rules

- **Story Consistency**: Maintain character personalities and plot coherence
- **Family-Friendly**: Filter inappropriate content automatically
- **Image Generation**: Create scene visuals that match story context
- **Narrative Pacing**: Balance action, dialogue, and character development

## Session Management

- **Room Persistence**: Games saved for 24 hours after last activity
- **Player Reconnection**: Seamless rejoin with state restoration
- **Host Migration**: Transfer host privileges if original host disconnects
- **Game Completion**: Natural story conclusions with replay options

## Error Handling

- **AI Failures**: Fallback to pre-written content segments
- **Network Issues**: Graceful degradation with offline indicators
- **Invalid Choices**: Guide players back to valid story paths
- **Content Moderation**: Real-time filtering of inappropriate user input