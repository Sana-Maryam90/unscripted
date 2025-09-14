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

/**
 * Generates fallback questions when AI fails
 * @param {string} movieId - The movie ID
 * @param {Object} movieData - The movie data object
 * @returns {Array} Array of fallback quiz questions
 */
function generateFallbackBuzzerQuestions(movieId, movieData) {
    const movieTitle = movieData?.title || 'Unknown Movie';
    
    // Predefined detailed questions for Harry Potter
    if (movieId === 'harry-potter-1') {
        return [
            {
                id: 1,
                question: "What is the exact address of the Dursleys' house on Privet Drive?",
                options: ["Number 2", "Number 4", "Number 6", "Number 8"],
                correct: 1
            },
            {
                id: 2,
                question: "What specific incantation does Hermione use to repair Harry's glasses on the Hogwarts Express?",
                options: ["Reparo", "Oculus Reparo", "Episkey", "Vulnera Sanentur"],
                correct: 1
            },
            {
                id: 3,
                question: "What is the name of the three-headed dog guarding the Philosopher's Stone?",
                options: ["Cerberus", "Fluffy", "Fang", "Aragog"],
                correct: 1
            },
            {
                id: 4,
                question: "Which specific Quidditch position does Oliver Wood play for Gryffindor?",
                options: ["Seeker", "Chaser", "Beater", "Keeper"],
                correct: 3
            },
            {
                id: 5,
                question: "What does Hagrid give Dudley when the Dursleys refuse to let Harry go to Hogwarts?",
                options: ["A pig's tail", "Boils", "Purple hair", "Giant ears"],
                correct: 0
            },
            {
                id: 6,
                question: "What is the password to get past the Fat Lady's portrait to enter Gryffindor Tower?",
                options: ["Caput Draconis", "Pig Snout", "Wattlebird", "Fortuna Major"],
                correct: 0
            },
            {
                id: 7,
                question: "What specific potion ingredient does Snape ask Harry about in his first Potions class?",
                options: ["Bezoar", "Wolfsbane", "Monkshood", "Wormwood"],
                correct: 0
            },
            {
                id: 8,
                question: "How many staircases are there at Hogwarts according to Hermione?",
                options: ["142", "144", "146", "148"],
                correct: 0
            },
            {
                id: 9,
                question: "What does Harry see when he looks in the Mirror of Erised?",
                options: ["Himself as Head Boy", "His parents", "Himself holding the Quidditch Cup", "Voldemort defeated"],
                correct: 1
            },
            {
                id: 10,
                question: "What is the first spell Harry successfully performs in Charms class?",
                options: ["Lumos", "Alohomora", "Wingardium Leviosa", "Expelliarmus"],
                correct: 2
            },
            {
                id: 11,
                question: "What does Dumbledore see when he looks in the Mirror of Erised?",
                options: ["His family", "Himself holding thick woolen socks", "The defeat of Voldemort", "Grindelwald's redemption"],
                correct: 1
            },
            {
                id: 12,
                question: "What is the name of Filch's cat?",
                options: ["Mrs. Norris", "Mrs. Figg", "Crookshanks", "Minerva"],
                correct: 0
            },
            {
                id: 13,
                question: "What does the Sorting Hat almost put Harry in before choosing Gryffindor?",
                options: ["Ravenclaw", "Hufflepuff", "Slytherin", "It never hesitated"],
                correct: 2
            },
            {
                id: 14,
                question: "What is the name of the dragon that guards the high-security vaults at Gringotts?",
                options: ["Norwegian Ridgeback", "Hungarian Horntail", "Ukrainian Ironbelly", "Chinese Fireball"],
                correct: 2
            },
            {
                id: 15,
                question: "What does Ron sacrifice in McGonagall's giant chess game?",
                options: ["Himself as a pawn", "Himself as a knight", "Himself as a bishop", "Himself as a rook"],
                correct: 1
            },
            {
                id: 16,
                question: "What is the exact riddle Snape creates to guard the Philosopher's Stone?",
                options: ["A potion riddle with seven bottles", "A riddle about keys", "A riddle about mirrors", "A mathematical riddle"],
                correct: 0
            },
            {
                id: 17,
                question: "What does Quirrell say when he tries to kill Harry in the final confrontation?",
                options: ["Avada Kedavra", "Crucio", "Kill the boy", "Imperio"],
                correct: 2
            },
            {
                id: 18,
                question: "How many points does Dumbledore award to Neville at the end-of-year feast?",
                options: ["5 points", "10 points", "15 points", "20 points"],
                correct: 1
            },
            {
                id: 19,
                question: "What is the name of the Potions textbook Harry uses in his first year?",
                options: ["Magical Drafts and Potions", "Advanced Potion-Making", "One Thousand Magical Herbs and Fungi", "The Standard Book of Spells"],
                correct: 0
            },
            {
                id: 20,
                question: "What does Hagrid name his dragon egg that hatches in his hut?",
                options: ["Norbert", "Norberta", "Fluffy", "Fang"],
                correct: 0
            }
        ];
    }
    
    // Generic fallback questions for other movies
    return Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        question: `What is a specific detail about ${movieTitle} that requires deep knowledge of the film?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: Math.floor(Math.random() * 4)
    }));
}



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
            const { roomCode, playerId, playerName, movieId, characterId } = data;

            const roomId = `room_${roomCode}`;
            let session = gameSessions.get(roomId);

            // If room doesn't exist, return error (rooms should be created explicitly)
            if (!session) {
                console.log(`❌ Room ${roomCode} not found`);
                socket.emit('error', { message: 'Room not found. Please check the room code.' });
                return;
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
                characterId: characterId || null,
                status: 'online',
                joinedAt: new Date()
            };

            // If this is a quiz room and movieId is provided, set it
            if (movieId && !session.movieId) {
                session.movieId = movieId;
                // Load movie data (in production, this would come from database)
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const moviePath = path.join(process.cwd(), 'data', 'movies', `${movieId}.json`);
                    const movieData = JSON.parse(fs.readFileSync(moviePath, 'utf8'));
                    session.movieData = movieData;
                    session.availableCharacters = movieData.characters.map(c => c.id);
                } catch (error) {
                    console.error('Error loading movie data:', error);
                }
            }

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
                    players: session.players,
                    movieData: session.movieData,
                    availableCharacters: session.availableCharacters
                }
            });

            console.log(`✅ ${playerName} joined room ${roomCode}`);
        });

        // Handle character selection
        socket.on('select-character', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const { characterId, characterName } = data;
            const session = gameSessions.get(roomId);

            if (!session) return;

            // Check if character is already taken
            const characterTaken = session.players.some(p => p.characterId === characterId && p.id !== playerId);
            if (characterTaken) {
                socket.emit('error', { message: 'Character already taken' });
                return;
            }

            // Update player's character
            const player = session.players.find(p => p.id === playerId);
            if (player) {
                player.characterId = characterId;
                player.name = characterName; // Use character name as player name
                
                // Update available characters list
                if (session.availableCharacters) {
                    session.availableCharacters = session.movieData.characters.filter(c => 
                        !session.players.some(p => p.characterId === c.id)
                    );
                }

                // Notify all players based on room type
                if (roomId.startsWith('buzzer_')) {
                    io.to(roomId).emit('buzzer-session-updated', session);
                } else {
                    io.to(roomId).emit('session-updated', session);
                }
                
                io.to(roomId).emit('character-selected', {
                    playerId,
                    playerName: characterName,
                    characterId,
                    characterName
                });
                
                console.log(`🎭 ${characterName} selected by player in room ${session.roomCode}`);
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

            // Initialize quiz state with movie-specific questions
            let questions = [];
            
            // Generate movie-specific questions based on movieId
            if (session.movieId === 'harry-potter-1') {
                questions = [
                    {
                        id: 1,
                        question: "What is the name of Harry's owl?",
                        options: ["Hedwig", "Errol", "Pigwidgeon", "Crookshanks"],
                        correct: 0
                    },
                    {
                        id: 2,
                        question: "Which house does the Sorting Hat almost put Harry in?",
                        options: ["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw"],
                        correct: 1
                    },
                    {
                        id: 3,
                        question: "What is hidden in the third-floor corridor?",
                        options: ["The Chamber of Secrets", "The Philosopher's Stone", "A Dragon", "The Room of Requirement"],
                        correct: 1
                    },
                    {
                        id: 4,
                        question: "Who is the Potions master at Hogwarts?",
                        options: ["Professor McGonagall", "Professor Flitwick", "Professor Snape", "Professor Sprout"],
                        correct: 2
                    },
                    {
                        id: 5,
                        question: "What does Harry see in the Mirror of Erised?",
                        options: ["His future", "His parents", "Himself as Quidditch captain", "Voldemort"],
                        correct: 1
                    }
                ];
            } else if (session.movieId === 'star-wars-4') {
                questions = [
                    {
                        id: 1,
                        question: "What is Luke Skywalker's home planet?",
                        options: ["Alderaan", "Tatooine", "Coruscant", "Hoth"],
                        correct: 1
                    },
                    {
                        id: 2,
                        question: "Who is revealed to be Luke's father?",
                        options: ["Obi-Wan Kenobi", "Darth Vader", "Emperor Palpatine", "Han Solo"],
                        correct: 1
                    },
                    {
                        id: 3,
                        question: "What is the name of Han Solo's ship?",
                        options: ["X-wing", "TIE Fighter", "Millennium Falcon", "Star Destroyer"],
                        correct: 2
                    },
                    {
                        id: 4,
                        question: "What weapon does a Jedi use?",
                        options: ["Blaster", "Lightsaber", "Force Pike", "Vibroblade"],
                        correct: 1
                    },
                    {
                        id: 5,
                        question: "What is the Death Star's weakness?",
                        options: ["Thermal exhaust port", "Shield generator", "Main reactor", "Command bridge"],
                        correct: 0
                    }
                ];
            } else {
                // Default generic questions for other movies
                questions = [
                    {
                        id: 1,
                        question: "What genre best describes this movie?",
                        options: ["Action", "Comedy", "Drama", "Fantasy"],
                        correct: 3
                    },
                    {
                        id: 2,
                        question: "Who is the main protagonist?",
                        options: ["The hero", "The villain", "The sidekick", "The mentor"],
                        correct: 0
                    },
                    {
                        id: 3,
                        question: "What is the main conflict in the story?",
                        options: ["Good vs Evil", "Love vs Duty", "Past vs Future", "All of the above"],
                        correct: 3
                    },
                    {
                        id: 4,
                        question: "How does the story typically end?",
                        options: ["Tragedy", "Happy ending", "Cliffhanger", "Open ending"],
                        correct: 1
                    },
                    {
                        id: 5,
                        question: "What makes this story memorable?",
                        options: ["Characters", "Plot", "Themes", "All of the above"],
                        correct: 3
                    }
                ];
            }

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
                questionNumber: session.questionNumber,
                movieTitle: session.movieData?.title || 'Unknown Movie'
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

        // Handle buzzer quiz room joining
        socket.on('join-buzzer-room', (data) => {
            console.log('🚨 Join buzzer room request:', data);
            const { roomCode, playerId, playerName, movieId, characterId } = data;

            const roomId = `buzzer_${roomCode}`;
            let session = gameSessions.get(roomId);

            // Create room if it doesn't exist
            if (!session) {
                console.log(`🆕 Creating new buzzer room ${roomCode} for ${playerName}`);
                session = {
                    id: roomId,
                    roomCode,
                    movieId: movieId || null,
                    mode: 'buzzer-quiz',
                    state: 'waiting',
                    gameState: 'waiting',
                    players: [],
                    messages: [],
                    questions: [],
                    currentQuestion: null,
                    currentQuestionIndex: 0,
                    questionNumber: 0,
                    activeBuzzer: null,
                    canBuzz: false,
                    timeLeft: 0,
                    scores: {},
                    wrongAnswers: {},
                    showAnswer: false,
                    totalQuestions: 20,
                    movieData: null,
                    availableCharacters: [],
                    createdAt: new Date()
                };
                gameSessions.set(roomId, session);
            }

            if (session.players.length >= 4) {
                socket.emit('error', { message: 'Room is full' });
                return;
            }

            // Check if player already exists (reconnection)
            const existingPlayer = session.players.find(p => p.id === playerId);
            if (existingPlayer) {
                existingPlayer.socketId = socket.id;
                existingPlayer.status = 'online';
                activeConnections.set(socket.id, { playerId, roomId });
                socket.join(roomId);
                socket.emit('buzzer-room-joined', {
                    roomCode,
                    playerId,
                    player: existingPlayer,
                    room: session
                });
                socket.to(roomId).emit('buzzer-session-updated', session);
                console.log(`🔄 ${playerName} reconnected to buzzer room ${roomCode}`);
                return;
            }

            // Add new player
            const newPlayer = {
                id: playerId,
                name: playerName,
                socketId: socket.id,
                isHost: session.players.length === 0,
                status: 'online',
                characterId: characterId || null,
                joinedAt: new Date()
            };

            session.players.push(newPlayer);
            activeConnections.set(socket.id, { playerId, roomId });
            socket.join(roomId);

            // Load movie data if provided
            if (movieId && !session.movieData) {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const moviePath = path.join(process.cwd(), 'data', 'movies', `${movieId}.json`);
                    const movieData = JSON.parse(fs.readFileSync(moviePath, 'utf8'));
                    session.movieData = movieData;
                    session.availableCharacters = movieData.characters.filter(c => 
                        !session.players.some(p => p.characterId === c.id)
                    );
                } catch (error) {
                    console.error('Error loading movie data:', error);
                }
            }

            // Notify all players
            socket.to(roomId).emit('player-joined', {
                player: newPlayer,
                room: session
            });

            socket.emit('buzzer-room-joined', {
                roomCode,
                playerId,
                player: newPlayer,
                room: session
            });

            console.log(`✅ ${playerName} joined buzzer room ${roomCode}`);
        });

        // Handle buzzer quiz start
        socket.on('start-buzzer-quiz', async () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !player.isHost) {
                socket.emit('error', { message: 'Only the host can start the buzzer quiz' });
                return;
            }

            if (session.players.length < 2) {
                socket.emit('error', { message: 'Need at least 2 players to start buzzer quiz' });
                return;
            }

            try {
                // Generate 20 detailed questions using AI
                const { generateBuzzerQuizQuestions } = require('./src/lib/gemini.js');
                let questions;
                
                try {
                    questions = await generateBuzzerQuizQuestions(session.movieId, session.movieData);
                } catch (aiError) {
                    console.warn('AI question generation failed, using fallback questions:', aiError.message);
                    questions = generateFallbackBuzzerQuestions(session.movieId, session.movieData);
                }
                
                session.gameState = 'playing';
                session.questions = questions;
                session.currentQuestionIndex = 0;
                session.currentQuestion = questions[0];
                session.questionNumber = 1;
                session.activeBuzzer = null;
                session.canBuzz = true;
                session.timeLeft = 0;
                session.showAnswer = false;
                session.scores = {};

                // Initialize scores
                session.players.forEach(p => {
                    session.scores[p.id] = 0;
                });

                // Notify all players
                io.to(roomId).emit('buzzer-quiz-started', {
                    question: session.currentQuestion,
                    questionNumber: session.questionNumber,
                    totalQuestions: session.totalQuestions,
                    movieTitle: session.movieData?.title || 'Unknown Movie'
                });

                console.log(`🚨 Buzzer quiz started in room ${session.roomCode} with ${questions.length} questions`);
            } catch (error) {
                console.error('Error starting buzzer quiz:', error);
                socket.emit('error', { message: 'Failed to generate quiz questions. Please try again.' });
            }
        });

        // Handle buzzer press
        socket.on('press-buzzer', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session || session.gameState !== 'playing') return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !session.canBuzz || session.activeBuzzer) return;

            // Player gets control
            session.activeBuzzer = playerId;
            session.canBuzz = false;
            session.timeLeft = 2; // 2 seconds to answer

            // Start countdown timer
            const countdownTimer = setInterval(() => {
                session.timeLeft--;
                
                if (session.timeLeft <= 0) {
                    clearInterval(countdownTimer);
                    
                    // Time's up - release control
                    session.activeBuzzer = null;
                    session.canBuzz = true;
                    session.timeLeft = 0;

                    io.to(roomId).emit('buzzer-timeout', {
                        playerId,
                        playerName: player.name
                    });

                    io.to(roomId).emit('buzzer-session-updated', session);
                }
            }, 1000);

            // Store timer reference for cleanup
            session.countdownTimer = countdownTimer;

            io.to(roomId).emit('buzzer-pressed', {
                playerId,
                playerName: player.name
            });

            io.to(roomId).emit('buzzer-session-updated', session);

            console.log(`🚨 ${player.name} pressed buzzer in room ${session.roomCode}`);
        });

        // Handle buzzer answer submission
        socket.on('submit-buzzer-answer', (data) => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session || session.gameState !== 'playing') return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || session.activeBuzzer !== playerId) return;

            const { selectedAnswer } = data;
            const question = session.currentQuestion;
            const isCorrect = selectedAnswer === question.correct;

            // Clear countdown timer
            if (session.countdownTimer) {
                clearInterval(session.countdownTimer);
                session.countdownTimer = null;
            }

            // Update score and wrong answers
            if (isCorrect) {
                session.scores[playerId] = (session.scores[playerId] || 0) + 1;
            } else {
                // Track wrong answers for cut marks
                if (!session.wrongAnswers) {
                    session.wrongAnswers = {};
                }
                session.wrongAnswers[playerId] = (session.wrongAnswers[playerId] || 0) + 1;
            }

            session.showAnswer = true;
            session.activeBuzzer = null;
            session.canBuzz = false;
            session.timeLeft = 0;

            // Notify all players
            io.to(roomId).emit('buzzer-answer-submitted', {
                playerId,
                playerName: player.name,
                selectedAnswer,
                correctAnswer: question.correct,
                answerText: question.options[selectedAnswer],
                correctAnswerText: question.options[question.correct],
                isCorrect,
                scores: session.scores
            });

            console.log(`📝 ${player.name} answered buzzer question ${session.questionNumber}: ${isCorrect ? 'correct' : 'wrong'}`);
        });

        // Handle buzzer next question
        socket.on('buzzer-next-question', () => {
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
                session.activeBuzzer = null;
                session.canBuzz = false;

                io.to(roomId).emit('buzzer-quiz-finished', {
                    scores: session.scores,
                    winner
                });

                console.log(`🏁 Buzzer quiz finished in room ${session.roomCode}. Winner: ${winner.name}`);
                return;
            }

            // Move to next question
            session.currentQuestion = session.questions[session.currentQuestionIndex];
            session.questionNumber = session.currentQuestionIndex + 1;
            session.showAnswer = false;
            session.activeBuzzer = null;
            session.canBuzz = true;
            session.timeLeft = 0;

            io.to(roomId).emit('buzzer-next-question', {
                question: session.currentQuestion,
                questionNumber: session.questionNumber,
                totalQuestions: session.totalQuestions
            });

            console.log(`➡️ Next buzzer question in room ${session.roomCode}: Q${session.questionNumber}`);
        });

        // Handle buzzer quiz reset
        socket.on('reset-buzzer-quiz', () => {
            const connectionInfo = activeConnections.get(socket.id);
            if (!connectionInfo) return;

            const { playerId, roomId } = connectionInfo;
            const session = gameSessions.get(roomId);
            if (!session) return;

            const player = session.players.find(p => p.id === playerId);
            if (!player || !player.isHost) return;

            // Clear any active timers
            if (session.countdownTimer) {
                clearInterval(session.countdownTimer);
                session.countdownTimer = null;
            }

            // Reset quiz state
            session.gameState = 'waiting';
            session.questions = [];
            session.currentQuestion = null;
            session.currentQuestionIndex = 0;
            session.questionNumber = 0;
            session.activeBuzzer = null;
            session.canBuzz = false;
            session.timeLeft = 0;
            session.scores = {};
            session.wrongAnswers = {};
            session.showAnswer = false;

            io.to(roomId).emit('buzzer-session-updated', session);

            console.log(`🔄 Buzzer quiz reset in room ${session.roomCode}`);
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