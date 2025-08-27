# Multiplayer Cinema Storytelling Game

An AI-powered web platform that allows users to interactively modify existing movie plots by making choices from character perspectives at critical story moments. Built with Next.js, Socket.io, and OpenAI.

## Features

- **Interactive Storytelling**: Make choices that alter movie storylines
- **Multiplayer Support**: Collaborate with friends in real-time
- **AI-Generated Content**: Dynamic story segments and scene images
- **Character Perspectives**: Play from different character viewpoints
- **Real-time Synchronization**: Seamless multiplayer experience

## Tech Stack

- **Frontend & Backend**: Next.js 15.5.0 with React 19.1.0
- **Styling**: Tailwind CSS 4.0
- **Real-time Communication**: Socket.io
- **AI Integration**: OpenAI API (GPT-4 for text, DALL-E for images)
- **Data Storage**: Redis for game sessions
- **Language**: JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Redis server (local or cloud)
- OpenAI API key

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
```env
OPENAI_API_KEY=your_openai_api_key_here
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password_if_needed
```

4. Start Redis server (if running locally):
```bash
redis-server
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── game/           # Game-specific components
├── lib/                # Utility libraries
│   ├── redis.js        # Redis client configuration
│   ├── openai.js       # OpenAI client and helpers
│   └── socket.js       # Socket.io client configuration
├── services/           # Business logic services
└── config/             # Application configuration

data/
└── movies/             # Movie data JSON files

server.js               # Custom Next.js server with Socket.io
```

## Development

The application uses a custom Next.js server to integrate Socket.io for real-time multiplayer functionality. The development server runs both the Next.js app and the Socket.io server together.

### Key Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application requires a custom server deployment (not static export) due to Socket.io integration. Recommended platforms:

- Railway
- Render
- DigitalOcean App Platform
- Heroku

Make sure to:
1. Set up Redis instance (Redis Cloud recommended)
2. Configure environment variables
3. Use `npm start` as the start command

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.