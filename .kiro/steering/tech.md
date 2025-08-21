# Technical Guidelines for Unscripted

## Architecture Principles

- **Next.js App Router**: Use the app directory structure with server/client components appropriately
- **Real-time Communication**: Socket.io for multiplayer synchronization and game state management
- **State Management**: React hooks and context for client state, Redis for server-side game state
- **AI Integration**: OpenAI API for story generation and image creation with proper error handling
- **Responsive Design**: Mobile-first approach using Tailwind CSS

## Code Standards

- **Component Structure**: Functional components with hooks, clear separation of concerns
- **Error Handling**: Comprehensive try-catch blocks, user-friendly error messages
- **Performance**: Optimize for real-time multiplayer with minimal latency
- **Security**: Input validation, rate limiting, secure API endpoints
- **Accessibility**: WCAG 2.1 AA compliance for inclusive gaming experience

## Key Technologies

- **Frontend**: Next.js 14+, React 18+, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Socket.io, Redis for session management
- **AI Services**: OpenAI GPT-4 for story generation, DALL-E for scene images
- **Database**: Redis for real-time game state and session storage

## Development Patterns

- **Real-time Events**: Use Socket.io events for game actions (join, choice, turn, etc.)
- **Game State**: Centralized state management with Redis persistence
- **Component Naming**: Clear, descriptive names (GameRoom, PlayerChoice, StorySegment)
- **API Routes**: RESTful endpoints for game management, Socket.io for real-time updates
- **Error Boundaries**: Implement React error boundaries for graceful failure handling

## Performance Guidelines

- **Debounce User Input**: Prevent excessive API calls during story generation
- **Optimize Socket Events**: Batch updates where possible, use rooms for targeted messaging
- **Image Loading**: Lazy load AI-generated images, implement fallbacks
- **Memory Management**: Clean up Socket.io connections and Redis sessions properly