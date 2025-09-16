# Project Structure Guidelines

## Root Directory
```
├── server.js              # Custom Next.js server with Socket.io
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── tailwind.config.js    # Tailwind CSS configuration
├── next.config.mjs       # Next.js configuration
└── README.md             # Project documentation
```

## Source Directory (`src/`)
```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── game/            # Game-specific components
├── lib/                 # Utility libraries and clients
│   ├── redis.js         # Redis client and utilities
│   ├── openai.js        # OpenAI client and helpers
│   ├── utils.js         # General utility functions
│   └── socket.js        # Socket.io client configuration
├── services/            # Business logic services
└── config/              # Application configuration
    └── constants.js     # Game constants and enums
```

## Data Directory (`data/`)
```
data/
└── movies/              # Movie data JSON files
```

## Key Files
- **server.js**: Custom server combining Next.js and Socket.io
- **src/config/constants.js**: Game configuration, states, and socket events
- **src/lib/redis.js**: Redis connection management and key helpers
- **src/lib/openai.js**: OpenAI API integration for content generation
- **src/lib/utils.js**: Utility functions for IDs, validation, and formatting

## Naming Conventions
- **Files**: kebab-case for components, camelCase for utilities
- **Components**: PascalCase React components
- **Constants**: UPPER_SNAKE_CASE for configuration values
- **Functions**: camelCase for all functions and variables
- **Socket Events**: kebab-case for event names

## Import Patterns
- Use ES6 imports throughout src/ directory
- Relative imports for local files
- Absolute imports from node_modules
- Group imports: external libraries first, then local files
- Commands should be run in CMD not powershell