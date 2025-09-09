'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatRoom = ({ roomCode, playerId, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

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
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    return () => {
      socketInstance.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Join room when socket connects
    if (roomCode && playerId && playerName) {
      console.log('🚪 Joining room:', { roomCode, playerId, playerName });
      socket.emit('join-room', {
        roomCode,
        playerId,
        playerName
      });
    }

    // Listen for room events
    socket.on('room-joined', (data) => {
      console.log('✅ Joined room:', data);
      setPlayers(data.room.players || []);
      setMessages(data.room.messages || []);
    });

    socket.on('session-updated', (session) => {
      console.log('Session updated:', session);
      setPlayers(session.players || []);
      setMessages(session.messages || []);
    });

    socket.on('new-message', (message) => {
      console.log('New message:', message);
      setMessages(prev => [...prev, message]);
    });

    socket.on('player-joined', (data) => {
      console.log('👤 Player joined:', data.player.name);
      setPlayers(data.room.players || []);
      
      // Add system message
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.player.name} joined the room`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('player-left', (data) => {
      console.log('Player left:', data.playerName);
      setPlayers(data.room.players || []);
      
      // Add system message
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} left the room`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('player-action', (data) => {
      console.log('Player action:', data);
      
      // Add action message
      const actionMessage = {
        id: Date.now().toString(),
        type: 'action',
        text: `${data.playerName} ${data.action}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, actionMessage]);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('room-joined');
        socket.off('session-updated');
        socket.off('new-message');
        socket.off('player-joined');
        socket.off('player-left');
        socket.off('player-action');
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

  const sendAction = (action) => {
    if (!socket) return;
    
    socket.emit('player-action', {
      action
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gradient-to-br from-game-cream to-pink-50">
      {/* Players Sidebar */}
      <div className="w-64 cartoon-card m-4 p-4 flex flex-col max-h-full">
        <div className="mb-4">
          <h2 
            className="text-lg font-semibold text-purple-900 mb-2"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            🎮 Room: {roomCode}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span 
              className="text-purple-700 font-medium"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 
            className="text-sm font-bold text-purple-800 mb-3"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            👥 Players ({players.length}/4)
          </h3>
          <div className="space-y-2 overflow-y-auto flex-1">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(player.status)} shadow-lg`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm text-purple-900 truncate font-bold"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span 
                        className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full font-bold shadow-sm"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        👑 HOST
                      </span>
                    )}
                  </div>
                  <span 
                    className="text-xs text-purple-600 font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {player.status || 'online'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t-2 border-pink-300">
          <h4 
            className="text-xs font-bold text-purple-800 mb-3"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            ⚡ Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sendAction('waved')}
              className="p-2 text-xs bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white transition-all transform hover:scale-105 font-bold shadow-md"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              👋 Wave
            </button>
            <button
              onClick={() => sendAction('is ready')}
              className="p-2 text-xs bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-xl text-white transition-all transform hover:scale-105 font-bold shadow-md"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              ✅ Ready
            </button>
            <button
              onClick={() => sendAction('is thinking')}
              className="p-2 text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-xl text-white transition-all transform hover:scale-105 font-bold shadow-md"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              🤔 Think
            </button>
            <button
              onClick={() => sendAction('likes this')}
              className="p-2 text-xs bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-xl text-white transition-all transform hover:scale-105 font-bold shadow-md"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              ❤️ Like
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col m-4 ml-0 max-h-full">
        <div className="cartoon-card flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b-2 border-pink-300">
            <h3 
              className="text-xl font-bold text-purple-900"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              💬 Chat Room
            </h3>
          </div>

          {/* Messages Container - Fixed Height with Scroll */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto scroll-smooth" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3 animate-slide-up">
                    {message.type === 'message' && (
                      <>
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white">
                          <span className="text-sm font-bold text-white">
                            {message.playerName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="text-sm font-bold text-purple-900"
                              style={{ fontFamily: 'Fredoka, sans-serif' }}
                            >
                              {message.playerName}
                            </span>
                            <span 
                              className="text-xs text-purple-600"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p 
                            className="text-purple-800 text-sm leading-relaxed"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            {message.text}
                          </p>
                        </div>
                      </>
                    )}
                    
                    {message.type === 'system' && (
                      <div className="flex-1 text-center">
                        <span 
                          className="text-sm text-blue-700 font-medium inline-block"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          ℹ️ {message.text}
                        </span>
                      </div>
                    )}
                    
                    {message.type === 'action' && (
                      <div className="flex-1 text-center">
                        <span 
                          className="text-sm text-purple-700 font-medium inline-block"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          ⭐ {message.text}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Message Input - Fixed at Bottom */}
          <div className="p-4 border-t-2 border-pink-300 bg-white/50">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message... 💭"
                className="flex-1 bg-white/90 border-3 border-purple-300 rounded-2xl px-4 py-3 text-purple-900 placeholder-purple-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 font-medium shadow-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="bg-game-pink hover:bg-game-purple text-white font-bold px-6 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border-2 border-white"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                🚀 SEND
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;