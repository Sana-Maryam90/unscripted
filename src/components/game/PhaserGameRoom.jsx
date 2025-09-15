'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Button from '../ui/Button';
import PhaserGameContainer from './PhaserGameContainer';
import CharacterSelectionModal from './CharacterSelectionModal';

const PhaserGameRoom = ({ roomCode, playerId, playerName, onLeave }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [players, setPlayers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState('waiting'); // waiting, lobby, narration, dorm, overworld
    const [isReady, setIsReady] = useState(false);
    const [gameInstance, setGameInstance] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showCharacterSelection, setShowCharacterSelection] = useState(false);
    const [availableCharacterSlots, setAvailableCharacterSlots] = useState([]);
    const messagesEndRef = useRef(null);

    // Get character and movie from localStorage
    const [world, setWorld] = useState('wizarding');
    const [charId, setCharId] = useState('harry_potter');

    useEffect(() => {
        // Get selected character and movie from localStorage
        const selectedCharacter = localStorage.getItem('selectedCharacter');
        const selectedMovie = localStorage.getItem('selectedMovie');

        if (selectedCharacter) {
            try {
                const character = JSON.parse(selectedCharacter);
                // Use the character ID directly from the movie data
                const characterId = character.id || character.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                setCharId(characterId);
                console.log('🧙 Selected character for Phaser lobby:', character.name, '→', characterId);
            } catch (error) {
                console.warn('Failed to parse selected character, using default');
            }
        }

        if (selectedMovie) {
            try {
                const movie = JSON.parse(selectedMovie);
                // Set world based on movie (for now, default to wizarding)
                setWorld('wizarding');
                console.log('🎬 Selected movie for Phaser lobby:', movie.title);
            } catch (error) {
                console.warn('Failed to parse selected movie, using default');
            }
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Create socket connection
        const socketInstance = io('http://localhost:3000', {
            transports: ['websocket', 'polling']
        });

        setSocket(socketInstance);

        // Connection status
        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('🔌 Connected to game server');
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('❌ Disconnected from server');
        });

        return () => {
            socketInstance.close();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Join room when socket connects
        if (roomCode && playerId && playerName) {
            console.log('🚪 Joining game room:', { roomCode, playerId, playerName });
            socket.emit('join-room', {
                roomCode,
                playerId,
                playerName,
                gameType: 'phaser-lobby' // Distinguish from quiz rooms
            });
        }

        // Listen for room events
        socket.on('room-joined', (data) => {
            console.log('✅ Joined game room:', data);
            setPlayers(data.room.players || []);
            setMessages(data.room.messages || []);

            // Initialize game state
            if (data.room.gameState) {
                setGameState(data.room.gameState);
            }
        });

        socket.on('session-updated', (session) => {
            console.log('🔄 Game session updated:', session);
            setPlayers(session.players || []);
            setMessages(session.messages || []);

            if (session.gameState) {
                setGameState(session.gameState);
            }
        });

        socket.on('player-joined', (data) => {
            console.log('👤 Player joined:', data.player.name);
            setPlayers(data.room.players || []);

            const systemMessage = {
                id: Date.now().toString(),
                type: 'system',
                text: `${data.player.name} joined the lobby`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, systemMessage]);
        });

        socket.on('player-left', (data) => {
            console.log('👋 Player left:', data.playerName);

            if (data.room && data.room.players) {
                setPlayers(data.room.players);
            } else {
                // fall back: just remove that player from local state
                setPlayers(prev => prev.filter(p => p.id !== data.playerId));
            }

            const systemMessage = {
                id: Date.now().toString(),
                type: 'system',
                text: `${data.playerName} left the lobby`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, systemMessage]);
        });

        socket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('player-ready-changed', (data) => {
            console.log('🎯 Player ready state changed:', data);
            setPlayers(data.room.players || []);

            const systemMessage = {
                id: Date.now().toString(),
                type: 'system',
                text: `${data.playerName} is ${data.isReady ? 'ready' : 'not ready'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, systemMessage]);
        });

        socket.on('game-started', (data) => {
            console.log('🚀 Game started!');
            setGameState('lobby');

            const systemMessage = {
                id: Date.now().toString(),
                type: 'system',
                text: 'Game started! Welcome to the wizarding world lobby.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, systemMessage]);
        });

        // Character selection for Phaser lobby
        socket.on('show-character-selection', (data) => {
            console.log('🧙 Show character selection:', data);
            setAvailableCharacterSlots(data.availableSlots);
            setShowCharacterSelection(true);
        });

        socket.on('character-slots-updated', (data) => {
            console.log('🔄 Character slots updated:', data);
            setAvailableCharacterSlots(data.availableSlots);
        });

        socket.on('character-selection-error', (data) => {
            console.error('❌ Character selection error:', data.message);
            alert(data.message);
        });

        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
            alert(error.message);
        });

        return () => {
            if (socket) {
                socket.off('room-joined');
                socket.off('session-updated');
                socket.off('new-message');
                socket.off('player-joined');
                socket.off('player-left');
                socket.off('player-ready-changed');
                socket.off('game-started');
                socket.off('show-character-selection');
                socket.off('character-slots-updated');
                socket.off('character-selection-error');
                socket.off('error');
            }
        };
    }, [socket, roomCode, playerId, playerName]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send-message', {
            text: newMessage.trim()
        });

        setNewMessage('');
    };

    const toggleReady = () => {
        if (!socket) return;

        const newReadyState = !isReady;
        setIsReady(newReadyState);

        socket.emit('player-ready', {
            isReady: newReadyState
        });
    };

    const startGame = () => {
        if (!socket) return;
        socket.emit('start-game');
    };

    const handleGameReady = (game) => {
        setGameInstance(game);
        console.log('🎮 Phaser game instance ready:', game);
    };

    const handleCharacterSelect = (charId) => {
        if (!socket) return;

        console.log('🧙 Selecting character:', charId);
        socket.emit('select-character-lobby', { charId });
        setShowCharacterSelection(false);

        // Update local charId for Phaser
        setCharId(charId);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'busy': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const currentPlayer = players.find(p => p.id === playerId);
    const isHost = currentPlayer?.isHost;
    const allPlayersReady = players.length >= 2 && players.every(p => p.isReady);
    const canStartGame = isHost && allPlayersReady && gameState === 'waiting';

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Top Header with Movie Title - Retro Pixel Style */}
            <div className="bg-black border-b-4 border-white p-4" style={{
                backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.03) 2px,
                    rgba(255, 255, 255, 0.03) 4px
                )`
            }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-4xl font-bold text-white font-mono tracking-wider" style={{
                            textShadow: '3px 3px 0px #333, 6px 6px 0px rgba(0,0,0,0.5)',
                            fontFamily: 'monospace'
                        }}>
                            ⚡ WIZARDING WORLD OF ELEMORE ⚡
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-green-400 font-mono bg-black/50 px-3 py-1 border border-green-400">
                            <span>ROOM: <span className="text-white font-bold">{roomCode}</span></span>
                            <button
                                onClick={() => navigator.clipboard.writeText(roomCode)}
                                className="ml-2 px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs border border-green-400 transition-colors"
                                title="Copy room code"
                            >
                                📋 COPY
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono">
                        <div className={`w-3 h-3 ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}
                            style={{ imageRendering: 'pixelated' }}></div>
                        <span className={`${isConnected ? 'text-green-400' : 'text-red-400'} font-bold`}>
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Game Area - Takes most of the space */}
                <div className="flex-1 relative flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
                    <PhaserGameContainer
                        roomId={roomCode}
                        world={world}
                        charId={charId}
                        socket={socket}
                        onGameReady={handleGameReady}
                    />
                </div>

                {/* Right Sidebar - Retro Pixel Style - Larger */}
                <div className="w-[540px] bg-black border-l-4 border-white flex flex-col min-h-0" style={{
                    backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(255, 255, 255, 0.02) 2px,
                        rgba(255, 255, 255, 0.02) 4px
                    )`
                }}>
                    {/* Adventurers list - scrollable if long */}
                    <div className="flex-1 overflow-y-auto p-6 border-b-2 border-white/50">
                        <h3 className="text-2xl font-bold text-white mb-6 font-mono tracking-wider" style={{
                            textShadow: '2px 2px 0px #333',
                            fontFamily: 'monospace'
                        }}>
                            ⚔️ ADVENTURERS ({players.length}/4)
                        </h3>
                        <div className="space-y-4">
                            {players.map((player) => (
                                <div key={player.id} className={`flex items-center gap-4 p-4 border-2 transition-all ${player.isReady
                                    ? 'bg-green-900/30 border-green-400 shadow-lg shadow-green-400/20'
                                    : 'bg-gray-900/50 border-gray-600 hover:border-gray-500'
                                    }`} style={{ imageRendering: 'pixelated' }}>
                                    <div className="relative">
                                        {/* Character Sprite Placeholder - Larger */}
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-white flex items-center justify-center"
                                            style={{ imageRendering: 'pixelated' }}>
                                            <span className="text-2xl font-bold text-white font-mono">
                                                {player.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-black ${getStatusColor(player.status)}`}
                                            style={{ imageRendering: 'pixelated' }}></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-white font-bold font-mono text-xl">
                                                {player.name}
                                            </span>
                                            {player.isHost && (
                                                <span className="text-sm bg-white text-black px-3 py-1 font-bold font-mono border border-black">
                                                    👑 HOST
                                                </span>
                                            )}
                                        </div>
                                        {player.isReady && (
                                            <div className="text-sm bg-green-400 text-black px-3 py-1 font-bold font-mono border border-black inline-block">
                                                ✅ READY FOR BATTLE
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Empty slots - Larger */}
                            {Array.from({ length: 4 - players.length }).map((_, index) => (
                                <div key={`empty-${index}`} className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-600 bg-gray-900/20">
                                    <div className="w-16 h-16 border-2 border-dashed border-gray-600 flex items-center justify-center">
                                        <span className="text-gray-600 font-mono text-3xl">?</span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-gray-500 font-mono text-lg">WAITING FOR ADVENTURER...</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls (ready / abandon) - fixed at bottom */}
                    <div className="p-6 border-t-2 border-white/50">
                        {gameState === 'waiting' && (
                            <div className="space-y-4 mb-4">
                                <button
                                    onClick={toggleReady}
                                    className={`w-full py-6 text-2xl font-bold font-mono border-4 transition-all ${isReady
                                        ? 'bg-red-600 hover:bg-red-500 text-white border-red-400'
                                        : 'bg-green-600 hover:bg-green-500 text-white border-green-400'
                                        } shadow-lg`}
                                    style={{
                                        imageRendering: 'pixelated',
                                        textShadow: '2px 2px 0px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {isReady ? '❌ NOT READY' : '✅ READY FOR BATTLE'}
                                </button>

                                {canStartGame && (
                                    <button
                                        onClick={startGame}
                                        className="w-full py-6 text-2xl font-bold font-mono bg-purple-600 hover:bg-purple-500 text-white border-4 border-purple-400 shadow-lg animate-pulse"
                                        style={{
                                            imageRendering: 'pixelated',
                                            textShadow: '2px 2px 0px rgba(0,0,0,0.8)'
                                        }}
                                    >
                                        🚀 BEGIN ADVENTURE
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={onLeave}
                            className="w-full py-4 text-xl font-bold font-mono text-red-400 hover:text-red-300 hover:bg-red-900/20 border-2 border-red-600 hover:border-red-400 transition-all"
                            style={{ imageRendering: 'pixelated' }}
                        >
                            🚪 ABANDON QUEST
                        </button>
                    </div>

                    {/* Chat toggle - also pinned just above chat */}
                    <div className="p-6 border-t-2 border-white/50">
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono border-2 border-indigo-400 flex items-center justify-center gap-2 transition-all text-xl"
                            style={{ imageRendering: 'pixelated' }}
                        >
                            💬 {showChat ? 'HIDE CHAT' : 'SHOW CHAT'}
                            {messages.length > 0 && !showChat && (
                                <span className="bg-red-500 text-white text-sm px-3 py-1 border border-black font-mono">
                                    {messages.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Collapsible Chat - scrolls inside its own box */}
                    {showChat && (
                        <div className="flex-1 min-h-0 flex flex-col p-6 overflow-y-auto">
                            <h3 className="text-lg font-medium text-white mb-4 font-mono">💬 CHAT</h3>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto mb-4 bg-gray-900/50 rounded-lg p-4">
                                <div className="space-y-3">
                                    {messages.slice(-20).map((message) => (
                                        <div key={message.id} className="text-sm">
                                            {message.type === 'message' && (
                                                <div className="bg-gray-700/50 rounded p-3">
                                                    <span className="text-purple-400 font-medium font-mono">
                                                        {message.playerName}:
                                                    </span>
                                                    <span className="text-gray-200 ml-2">
                                                        {message.text}
                                                    </span>
                                                </div>
                                            )}

                                            {message.type === 'system' && (
                                                <div className="text-gray-500 italic text-center py-2 font-mono">
                                                    {message.text}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Message Input */}
                            <form onSubmit={sendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                                    disabled={!isConnected}
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() || !isConnected}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 font-mono font-bold border-2 border-purple-400"
                                >
                                    SEND
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Character Selection Modal */}
            {showCharacterSelection && (
                <CharacterSelectionModal
                    availableSlots={availableCharacterSlots}
                    onSelectCharacter={handleCharacterSelect}
                    onClose={() => setShowCharacterSelection(false)}
                />
            )}
        </div>
    );
};

export default PhaserGameRoom;