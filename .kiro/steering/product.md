# Product Overview

**Unscripted** is an AI-powered multiplayer cinema storytelling game that allows users to interactively modify existing movie plots by making choices from character perspectives at critical story moments.

## Core Features

- **Interactive Storytelling**: Players make choices that alter movie storylines in real-time
- **Multiplayer Collaboration**: Up to 4 players can collaborate in real-time to reshape stories
- **Character Perspectives**: Players choose and play from different character viewpoints
- **AI-Generated Content**: Dynamic story segments and scene images powered by OpenAI
- **Real-time Synchronization**: Seamless multiplayer experience with Socket.io

## Target Experience

The game transforms passive movie watching into an active, collaborative storytelling experience where players become co-directors of familiar movie narratives, creating unique alternate storylines through their collective choices.

## Key Constraints

- Maximum 4 players per room for optimal collaboration
- 5-minute turn timeouts to maintain game flow
- Family-friendly content generation appropriate for general audiences
- Real-time synchronization required for multiplayer experience

## Development Guidelines

- **User Experience**: Prioritize intuitive gameplay with clear visual feedback
- **Content Safety**: Implement content filtering for AI-generated story segments
- **Game Flow**: Maintain engagement with smooth transitions and loading states
- **Multiplayer UX**: Clear player status indicators and turn management
- **Accessibility**: Support keyboard navigation and screen readers

## Game Mechanics

- **Turn-based Choices**: Players vote on story decisions with majority rule
- **Character Assignment**: Dynamic character selection based on story context
- **Story Branching**: Maintain narrative coherence while allowing creative deviations
- **Session Management**: Robust handling of player disconnections and reconnections
- **Progress Tracking**: Save game state for session resumption