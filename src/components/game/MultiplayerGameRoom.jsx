'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { getAllMoviesClient } from '../../lib/moviesClient';
import socketManager from '../../lib/socketManager';

const MultiplayerGameRoom = ({ roomCode, playerId, playerName }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameSession, setGameSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load movies
    const loadMovies = async () => {
      try {
        const movieData = await getAllMoviesClient();
        setMovies(movieData);
      } catch (error) {
        console.error('Failed to load movies:', error);
      }
    };
    loadMovies();
  }, []);

  useEffect(() => {
    // Get socket and set up connection
    const socket = socketManager.getSocket();
    setIsConnected(socket.connected);

    // Connection events
    const handleConnect = () => {
      setIsConnected(true);
      console.log('🔌 Connected to game server');
      
      // Join the room
      socketManager.emit('join-room', {
        roomCode,
        playerId,
        playerName
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    };

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    }

    socketManager.on('connect', handleConnect);
    socketManager.on('disconnect', handleDisconnect);

    // Room events
    const handleRoomJoined = (data) => {
      console.log('✅ Joined game room:', data);
      setGameSession(data.room);
      setMessages(data.room.messages || []);
      if (data.room.selectedMovie) {
        setSelectedMovie(data.room.selectedMovie);
      }
    };

    const handleSessionUpdated = (session) => {
      console.log('🔄 Game session updated:', session);
      setGameSession(session);
      setMessages(session.messages || []);
      if (session.selectedMovie) {
        setSelectedMovie(session.selectedMovie);
      }
    };

    const handlePlayerJoined = (data) => {
      console.log('👤 Player joined:', data.player.name);
      setGameSession(data.room);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.player.name} joined the game`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handlePlayerLeft = (data) => {
      console.log('👋 Player left:', data.playerName);
      setGameSession(data.room);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} left the game`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMovieSelected = (data) => {
      console.log('🎬 Movie selected:', data.movie.title);
      setSelectedMovie(data.movie);
      setGameSession(data.session);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} selected \"${data.movie.title}\"`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleGameStarted = (data) => {
      console.log('🚀 Game started!');
      setGameSession(data.session);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: 'Game started! Choose your characters.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleError = (error) => {
      console.error('❌ Socket error:', error);
      alert(error.message);
    };

    // Set up event listeners
    socketManager.on('room-joined', handleRoomJoined);
    socketManager.on('session-updated', handleSessionUpdated);
    socketManager.on('player-joined', handlePlayerJoined);
    socketManager.on('player-left', handlePlayerLeft);
    socketManager.on('new-message', handleNewMessage);
    socketManager.on('movie-selected', handleMovieSelected);
    socketManager.on('game-started', handleGameStarted);
    socketManager.on('error', handleError);

    return () => {
      // Clean up event listeners
      socketManager.off('connect', handleConnect);
      socketManager.off('disconnect', handleDisconnect);
      socketManager.off('room-joined', handleRoomJoined);
      socketManager.off('session-updated', handleSessionUpdated);
      socketManager.off('player-joined', handlePlayerJoined);
      socketManager.off('player-left', handlePlayerLeft);
      socketManager.off('new-message', handleNewMessage);
      socketManager.off('movie-selected', handleMovieSelected);
      socketManager.off('game-started', handleGameStarted);
      socketManager.off('error', handleError);
    };
  }, [roomCode, playerId, playerName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    socketManager.emit('send-message', {
      text: newMessage.trim()
    });

    setNewMessage('');
  };

  const toggleReady = () => {
    if (!isConnected) return;
    
    socketManager.emit('toggle-ready');
  };

  const selectMovie = (movie) => {
    if (!isConnected) return;
    
    socketManager.emit('select-movie', {
      movieId: movie.id,
      movie
    });
  };

  const startGame = () => {
    if (!isConnected) return;
    
    socketManager.emit('start-game');
  };

  const leaveRoom = () => {
    router.push('/multiplayer');
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

  const currentPlayer = gameSession?.players?.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const allPlayersReady = gameSession?.players?.every(p => p.isReady) && gameSession?.players?.length >= 2;

  if (!gameSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Connecting to room {roomCode}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex\">
      {/* Game Area */}
      <div className=\"flex-1 flex flex-col\">
        {/* Header */}
        <div className=\"glass-card m-4 p-4\">
          <div className=\"flex items-center justify-between\">
            <div>
              <h1 className=\"text-2xl font-bold text-white\">
                Room: {roomCode}
              </h1>
              <p className=\"text-gray-400\">
                {gameSession.state === 'waiting' && 'Waiting for players'}
                {gameSession.state === 'movie-selection' && 'Selecting movie'}
                {gameSession.state === 'character-selection' && 'Choosing characters'}
                {gameSession.state === 'playing' && 'Playing story'}
              </p>
            </div>
            <div className=\"flex items-center gap-4\">
              <div className={`flex items-center gap-2 text-sm ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <Button variant=\"ghost\" onClick={leaveRoom}>
                Leave Room
              </Button>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className=\"flex-1 m-4 mt-0\">
          {gameSession.state === 'waiting' && (
            <div className=\"glass-card p-8 text-center\">
              <h2 className=\"text-3xl font-bold text-white mb-4\">
                Waiting for Players
              </h2>
              <p className=\"text-gray-400 mb-8\">
                Share room code <span className=\"font-mono bg-gray-800 px-2 py-1 rounded\">{roomCode}</span> with friends
              </p>
              
              {gameSession.players.length >= 2 ? (
                <div className=\"space-y-4\">
                  <p className=\"text-green-400\">Ready to start! All players must be ready.</p>
                  <div className=\"flex justify-center gap-4\">
                    <Button 
                      onClick={toggleReady}
                      variant={currentPlayer?.isReady ? 'secondary' : 'primary'}
                    >
                      {currentPlayer?.isReady ? 'Not Ready' : 'Ready'}
                    </Button>
                    {isHost && allPlayersReady && (
                      <Button onClick={() => setGameSession({...gameSession, state: 'movie-selection'})}>
                        Start Game
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className=\"text-yellow-400\">
                  Need at least 2 players to start ({gameSession.players.length}/4)
                </p>
              )}
            </div>
          )}

          {gameSession.state === 'movie-selection' && (
            <div className=\"glass-card p-8\">
              <h2 className=\"text-2xl font-bold text-white mb-6 text-center\">
                Choose Your Movie
              </h2>
              {selectedMovie ? (
                <div className=\"text-center\">
                  <h3 className=\"text-xl text-white mb-4\">
                    Selected: {selectedMovie.title}
                  </h3>
                  <p className=\"text-gray-400 mb-6\">{selectedMovie.description}</p>
                  {isHost && (
                    <Button onClick={startGame}>
                      Start Story
                    </Button>
                  )}
                </div>
              ) : (
                <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                  {movies.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => selectMovie(movie)}
                      className=\"glass-card p-6 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all\"
                    >
                      <h3 className=\"text-xl font-bold text-white mb-2\">{movie.title}</h3>
                      <p className=\"text-gray-300 text-sm mb-4\">{movie.description}</p>
                      <Button size=\"sm\" className=\"w-full\">
                        Select Movie
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {gameSession.state === 'character-selection' && (
            <div className=\"glass-card p-8 text-center\">
              <h2 className=\"text-2xl font-bold text-white mb-4\">
                Character Selection
              </h2>
              <p className=\"text-gray-400\">
                Character selection coming soon...
              </p>
            </div>
          )}

          {gameSession.state === 'playing' && (
            <div className=\"glass-card p-8 text-center\">
              <h2 className=\"text-2xl font-bold text-white mb-4\">
                Story in Progress
              </h2>
              <p className=\"text-gray-400\">
                Turn-based gameplay coming soon...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className=\"w-80 flex flex-col m-4 ml-0\">
        {/* Players List */}
        <div className=\"glass-card p-4 mb-4\">
          <h3 className=\"text-lg font-semibold text-white mb-4\">
            Players ({gameSession.players.length}/{gameSession.gameSettings.maxPlayers})
          </h3>
          <div className=\"space-y-2\">
            {gameSession.players.map((player) => (
              <div key={player.id} className=\"flex items-center gap-3 p-2 rounded-lg bg-white/5\">
                <div className=\"relative\">
                  <div className=\"w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center\">
                    <span className=\"text-xs font-medium text-white\">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(player.status)}`}></div>
                </div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"flex items-center gap-1\">
                    <span className=\"text-sm text-white truncate\">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className=\"text-xs bg-indigo-500 text-white px-1 rounded\">
                        HOST
                      </span>
                    )}
                    {player.isReady && (
                      <span className=\"text-xs bg-green-500 text-white px-1 rounded\">
                        READY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className=\"glass-card flex-1 flex flex-col\">
          <div className=\"p-4 border-b border-gray-700\">
            <h3 className=\"text-lg font-semibold text-white\">Chat</h3>
          </div>
          
          {/* Messages */}
          <div className=\"flex-1 p-4 overflow-y-auto\">
            <div className=\"space-y-3\">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'message' && (
                    <div className=\"flex gap-3\">
                      <div className=\"w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0\">
                        <span className=\"text-xs font-medium text-white\">
                          {message.playerName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className=\"flex-1\">
                        <div className=\"flex items-center gap-2 mb-1\">
                          <span className=\"text-sm font-medium text-white\">
                            {message.playerName}
                          </span>
                          <span className=\"text-xs text-gray-500\">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className=\"text-gray-200 text-sm\">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {message.type === 'system' && (
                    <div className=\"text-center\">
                      <span className=\"text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full\">
                        {message.text}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className=\"p-4 border-t border-gray-700\">
            <form onSubmit={sendMessage} className=\"flex gap-2\">
              <input
                type=\"text\"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder=\"Type a message...\"
                className=\"flex-1 bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm\"
                disabled={!isConnected}
              />
              <Button
                type=\"submit\"
                disabled={!newMessage.trim() || !isConnected}
                size=\"sm\"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGameRoom;"