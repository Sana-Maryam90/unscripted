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
        console.log('🔌 Client connected:', socket.id);

        // Handle room creation
        socket.on('create-room', (data) => {
            console.log('🎮 Create room request:', data);
            const { movieId, mode, playerName, playerId } = data;

            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const roomId = `room_${roomCode}`;

            const gameSession = {
                id: roomId,
                roomCode,
                movieId: movieId || null,
                mode: mode || 'multiplayer-game',
                state: 'waiting', // waiting -> movie-selection -> character-selection -> playing -> completed
                players: [{
                    id: playerId,
                    name: playerName,
                    socketId: socket.id,
                    isHost: true,
                    characterId: null,
                    status: 'online',
                    isReady: false,
                    joinedAt: new Date()
                }],
                messages: [], // Chat messages
                selectedMovie: null,
                currentTurn: null,
                turnOrder: [],
                storyProgress: {
                    currentCheckpoint: 0,
                    completedChoices: [],
                    generatedContent: [],
                    storyHistory: []
                },
                gameSettings: {
                    maxPlayers: 4,
                    turnTimeLimit: 60, // seconds
                    allowSpectators: false
                },
                createdAt: new Date()
            };

            gameSessions.set(roomId, gameSession);
            activeConnections.set(socket.id, { playerId, roomId });

            socket.join(roomId);
            socket.emit('room-created', {
                roomCode,
                playerId,
                session: gameSession
            });

            console.log(`🎮 Game room ${roomCode} created by ${playerName}`);
        });

        // Handle room joining
        socket.on('join-room', (data) => {
            console.log('🚪 Join room request:', data);
            const { roomCode, playerId, playerName } = data;

            const roomId = `room_${roomCode}`;
            let session = gameSessions.get(roomId);

            // If room doesn't exist, create it (for test chat)
            if (!session) {
                console.log(`🆕 Creating new room ${roomCode} for ${playerName}`);
                session = {
                    id: roomId,
                    roomCode,
                    movieId: null,
                    mode: 'test-chat',
                    state: 'waiting',
                    players: [],
                    messages: [],
                    currentTurn: null,
                    storyProgress: {
                        currentCheckpoint: 0,
                        completedChoices: [],
                        generatedContent: []
                    },
                    createdAt: new Date()
                };
                gameSessions.set(roomId, session);
            }

            if (session.players.length >= 4) {
                socket.emit('error', { message: 'Room is full' });
                return;
            }

            // Check if player already exists
            const existingPlayer = session.players.find(p => p.id === playerId);
            if (existingPlayer) {
                // Update socket ID for reconnection
                existingPlayer.socketId = socket.id;
                existingPlayer.status = 'online'; // Mark as online again
                activeConnections.set(socket.id, { playerId, roomId });
                socket.join(roomId);
                socket.emit('room-joined', {
                    roomCode,
                    playerId,
                    player: existingPlayer,
                    room: {
                        ...session,
                        players: session.players
                    }
                });

                // Notify other players of reconnection
                socket.to(roomId).emit('session-updated', session);
                console.log(`🔄 ${playerName} reconnected to room ${roomCode}`);
                return;
            }

            // Add player to session
            const newPlayer = {
                id: playerId,
                name: playerName,
                socketId: socket.id,
                isHost: session.players.length === 0, // First player is host
                characterId: null,
                status: 'online',
                joinedAt: new Date()
            };

            session.players.push(newPlayer);
            activeConnections.set(socket.id, { playerId, roomId });

            socket.join(roomId);

            // Notify all players about new player
            socket.to(roomId).emit('player-joined', {
                player: newPlayer,
                room: {
                    ...session,
                    players: session.players
                }
            });

            // Send room data to new player
            socket.emit('room-joined', {
                roomCode,
                playerId,
                player: newPlayer,
                room: {
                    ...session,
                    players: session.players
                }
            });

            console.log(`✅ ${playerName} joined room ${roomCode}`);
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

        // Handle chat messages
        socket.on('send-message', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player) return;

            const message = {
                id: Date.now().toString(),
                playerId,
                playerName: player.name,
                text: data.text,
                timestamp: new Date(),
                type: 'message'
            };

            session.messages.push(message);

            // Broadcast to all players in room
            io.to(roomId).emit('new-message', message);

            console.log(`Message in ${session.roomCode} from ${player.name}: ${data.text}`);
        });

        // Handle player actions (for real-time sync demo)
        socket.on('player-action', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player) return;

            console.log(`Action in ${session.roomCode} from ${player.name}:`, data.action);

            // Broadcast action to all other players in room
            socket.to(roomId).emit('player-action', {
                playerId,
                playerName: player.name,
                action: data.action,
                timestamp: new Date()
            });
        });

        // Handle ready toggle
        socket.on('toggle-ready', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (player) {
                player.isReady = !player.isReady;
                io.to(roomId).emit('session-updated', session);

                console.log(`🎯 ${player.name} is ${player.isReady ? 'ready' : 'not ready'} in room ${session.roomCode}`);
            }
        });

        // Handle movie selection
        socket.on('select-movie', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player) return;

            // Update session with selected movie
            session.selectedMovie = data.movie;
            session.movieId = data.movieId;

            // Notify all players
            io.to(roomId).emit('movie-selected', {
                movie: data.movie,
                playerName: player.name,
                session
            });

            console.log(`🎬 ${player.name} selected movie \"${data.movie.title}\" in room ${session.roomCode}`);
        });

        // Handle game start
        socket.on('start-game', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !player.isHost) {
                socket.emit('error', { message: 'Only the host can start the game' });
                return;
            }

            if (!session.selectedMovie) {
                socket.emit('error', { message: 'Please select a movie first' });
                return;
            }

            // Update game state
            session.state = 'character-selection';

            // Notify all players
            io.to(roomId).emit('game-started', {
                session
            });

            console.log(`🚀 Game started in room ${session.roomCode}`);
        });

        // Handle quiz start
        socket.on('start-quiz', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !player.isHost) {
                socket.emit('error', { message: 'Only the host can start the quiz' });
                return;
            }

            if (session.players.length < 2) {
                socket.emit('error', { message: 'Need at least 2 players to start quiz' });
                return;
            }

            // Initialize quiz state
            const questions = [
                {
                    id: 1,
                    question: "What is the capital of France?",
                    options: ["London", "Berlin", "Paris", "Madrid"],
                    correct: 2
                },
                {
                    id: 2,
                    question: "Which planet is known as the Red Planet?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correct: 1
                },
                {
                    id: 3,
                    question: "What is 2 + 2?",
                    options: ["3", "4", "5", "6"],
                    correct: 1
                },
                {
                    id: 4,
                    question: "Who painted the Mona Lisa?",
                    options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
                    correct: 2
                },
                {
                    id: 5,
                    question: "What is the largest ocean on Earth?",
                    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
                    correct: 3
                }
            ];

            session.gameState = 'playing';
            session.questions = questions;
            session.currentQuestionIndex = 0;
            session.currentQuestion = questions[0];
            session.currentTurn = session.players[0].id;
            session.scores = {};
            session.questionNumber = 1;
            session.showAnswer = false;

            // Initialize scores
            session.players.forEach(p => {
                session.scores[p.id] = 0;
            });

            // Notify all players
            io.to(roomId).emit('quiz-started', {
                question: session.currentQuestion,
                currentTurn: session.currentTurn,
                questionNumber: session.questionNumber
            });

            console.log(`🎯 Quiz started in room ${session.roomCode}`);
        });

        // Handle quiz answer
        socket.on('answer-question', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session || session.gameState !== 'playing') return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || session.currentTurn !== playerId) return;

            const { selectedAnswer } = data;
            const question = session.currentQuestion;
            const isCorrect = selectedAnswer === question.correct;

            // Update score
            if (isCorrect) {
                session.scores[playerId] = (session.scores[playerId] || 0) + 1;
            }

            session.showAnswer = true;

            // Notify all players
            io.to(roomId).emit('question-answered', {
                playerId,
                playerName: player.name,
                selectedAnswer,
                correctAnswer: question.correct,
                answerText: question.options[selectedAnswer],
                isCorrect,
                scores: session.scores
            });

            console.log(`📝 ${player.name} answered question ${session.questionNumber}: ${isCorrect ? 'correct' : 'wrong'}`);
        });

        // Handle next question
        socket.on('next-question', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session || session.gameState !== 'playing') return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !player.isHost) return;

            session.currentQuestionIndex++;

            // Check if quiz is finished
            if (session.currentQuestionIndex >= session.questions.length) {
                // Find winner
                let maxScore = -1;
                let winner = null;

                session.players.forEach(p => {
                    const score = session.scores[p.id] || 0;
                    if (score > maxScore) {
                        maxScore = score;
                        winner = { name: p.name, score };
                    }
                });

                session.gameState = 'finished';

                io.to(roomId).emit('quiz-finished', {
                    scores: session.scores,
                    winner
                });

                console.log(`🏁 Quiz finished in room ${session.roomCode}. Winner: ${winner.name}`);
                return;
            }

            // Move to next question and next player
            session.currentQuestion = session.questions[session.currentQuestionIndex];
            session.questionNumber = session.currentQuestionIndex + 1;
            session.showAnswer = false;

            // Next player's turn
            const currentPlayerIndex = session.players.findIndex(p => p.id === session.currentTurn);
            const nextPlayerIndex = (currentPlayerIndex + 1) % session.players.length;
            session.currentTurn = session.players[nextPlayerIndex].id;

            io.to(roomId).emit('next-question', {
                question: session.currentQuestion,
                currentTurn: session.currentTurn,
                currentPlayerName: session.players[nextPlayerIndex].name,
                questionNumber: session.questionNumber
            });

            console.log(`➡️ Next question in room ${session.roomCode}: Q${session.questionNumber}`);
        });

        // Handle quiz reset
        socket.on('reset-quiz', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !player.isHost) return;

            // Reset quiz state
            session.gameState = 'waiting';
            session.currentQuestion = null;
            session.currentTurn = null;
            session.scores = {};
            session.questionNumber = 0;
            session.showAnswer = false;

            io.to(roomId).emit('session-updated', session);

            console.log(`🔄 Quiz reset in room ${session.roomCode}`);
        });

        // Handle player status updates
        socket.on('update-status', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (player) {
                player.status = data.status;
                io.to(roomId).emit('session-updated', session);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            const connectionInfo = activeConnections.get(socket.id);

            if (connectionInfo) {
                const { playerId, roomId } = connectionInfo;
                const session = gameSessions.get(roomId);

                if (session) {
                    const player = session.players.find(p => p.id === playerId);
                    const playerName = player ? player.name : 'Unknown';

                    // Mark player as disconnected instead of removing immediately
                    if (player) {
                        player.status = 'disconnected';
                        player.socketId = null;
                    }

                    // Set a timeout to remove player if they don't reconnect
                    setTimeout(() => {
                        const currentSession = gameSessions.get(roomId);
                        if (currentSession) {
                            const currentPlayer = currentSession.players.find(p => p.id === playerId);

                            // Only remove if still disconnected (no new socket)
                            if (currentPlayer && currentPlayer.status === 'disconnected' && !currentPlayer.socketId) {
                                currentSession.players = currentSession.players.filter(p => p.id !== playerId);

                                // If no players left, delete session
                                if (currentSession.players.length === 0) {
                                    gameSessions.delete(roomId);
                                    console.log(`🗑️ Room ${currentSession.roomCode} deleted - no players left`);
                                } else {
                                    // Notify remaining players
                                    io.to(roomId).emit('player-left', {
                                        playerId,
                                        playerName,
                                        room: {
                                            ...currentSession,
                                            players: currentSession.players
                                        }
                                    });
                                }
                            }
                        }
                    }, 5000); // 5 second grace period for reconnection

                    console.log(`⏸️ Player ${playerId} temporarily disconnected from room ${roomId}`);
                }

                activeConnections.delete(socket.id);
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