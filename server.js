const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory game sessions (replace with Redis in production)
const gameSessions = new Map();

app.prepare().then(() => {
    // Create HTTP server
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io
    const io = new Server(httpServer, {
        cors: {
            origin: dev ? "http://localhost:3000" : false,
            methods: ["GET", "POST"]
        }
    });

    // Store active connections
    const activeConnections = new Map();

    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Handle room creation
        socket.on('create-room', (data) => {
            const { movieId, mode, playerName, playerId } = data;
            
            const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
            const roomId = `room_${roomCode}`;
            
            const gameSession = {
                id: roomId,
                roomCode,
                movieId,
                mode,
                state: 'waiting',
                players: [{
                    id: playerId,
                    name: playerName,
                    socketId: socket.id,
                    isHost: true,
                    characterId: null
                }],
                currentTurn: null,
                storyProgress: {
                    currentCheckpoint: 0,
                    completedChoices: [],
                    generatedContent: []
                },
                createdAt: new Date()
            };
            
            gameSessions.set(roomId, gameSession);
            activeConnections.set(socket.id, { playerId, roomId });
            
            socket.join(roomId);
            socket.emit('room-created', { roomCode, session: gameSession });
            
            console.log(`Room ${roomCode} created by ${playerName}`);
        });

        // Handle room joining
        socket.on('join-room', (data) => {
            const { roomCode, playerName, playerId } = data;
            const roomId = `room_${roomCode}`;
            const session = gameSessions.get(roomId);
            
            if (!session) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }
            
            if (session.players.length >= 4) {
                socket.emit('error', { message: 'Room is full' });
                return;
            }
            
            // Add player to session
            const newPlayer = {
                id: playerId,
                name: playerName,
                socketId: socket.id,
                isHost: false,
                characterId: null
            };
            
            session.players.push(newPlayer);
            activeConnections.set(socket.id, { playerId, roomId });
            
            socket.join(roomId);
            
            // Notify all players in room
            io.to(roomId).emit('session-updated', session);
            
            console.log(`${playerName} joined room ${roomCode}`);
        });

        // Handle character selection
        socket.on('select-character', (data) => {
            const { roomId, playerId, characterId } = data;
            const session = gameSessions.get(roomId);
            
            if (!session) return;
            
            // Update player's character
            const player = session.players.find(p => p.id === playerId);
            if (player) {
                player.characterId = characterId;
                
                // Notify all players
                io.to(roomId).emit('session-updated', session);
            }
        });

        // Handle game start
        socket.on('start-character-selection', (data) => {
            const { roomId } = data;
            const session = gameSessions.get(roomId);
            
            if (!session) return;
            
            session.state = 'character_selection';
            io.to(roomId).emit('session-updated', session);
        });

        // Handle story start
        socket.on('start-story', (data) => {
            const { roomId } = data;
            const session = gameSessions.get(roomId);
            
            if (!session) return;
            
            session.state = 'in_progress';
            session.currentTurn = session.players[0].id;
            io.to(roomId).emit('session-updated', session);
        });

        // Handle choice made
        socket.on('make-choice', (data) => {
            const { roomId, playerId, choice } = data;
            const session = gameSessions.get(roomId);
            
            if (!session || session.currentTurn !== playerId) return;
            
            // Add choice to story
            session.storyProgress.completedChoices.push({
                playerId,
                choice,
                timestamp: new Date()
            });
            
            // Advance turn
            const currentIndex = session.players.findIndex(p => p.id === playerId);
            const nextIndex = (currentIndex + 1) % session.players.length;
            session.currentTurn = session.players[nextIndex].id;
            
            // Check if story is complete (after 6 choices for demo)
            if (session.storyProgress.completedChoices.length >= 6) {
                session.state = 'completed';
                session.currentTurn = null;
            }
            
            // Notify all players
            io.to(roomId).emit('session-updated', session);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            const connectionInfo = activeConnections.get(socket.id);
            
            if (connectionInfo) {
                const { playerId, roomId } = connectionInfo;
                const session = gameSessions.get(roomId);
                
                if (session) {
                    // Remove player from session
                    session.players = session.players.filter(p => p.id !== playerId);
                    
                    // If no players left, delete session
                    if (session.players.length === 0) {
                        gameSessions.delete(roomId);
                    } else {
                        // Notify remaining players
                        io.to(roomId).emit('session-updated', session);
                    }
                }
                
                activeConnections.delete(socket.id);
                console.log(`Player ${playerId} disconnected from room ${roomId}`);
            }
        });
    });

    // Start server
    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            console.log(`> Socket.io server running for real-time multiplayer`);
        });
});