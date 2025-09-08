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
    <div className="flex h-screen bg-gray-900">
      {/* Players Sidebar */}
      <div className="w-64 glass-card m-4 p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">
            Room: {roomCode}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Players ({players.length}/4)
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(player.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white truncate">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className="text-xs bg-indigo-500 text-white px-1 rounded">
                        HOST
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {player.status || 'online'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sendAction('waved')}
              className="p-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              👋 Wave
            </button>
            <button
              onClick={() => sendAction('is ready')}
              className="p-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              ✅ Ready
            </button>
            <button
              onClick={() => sendAction('is thinking')}
              className="p-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              🤔 Think
            </button>
            <button
              onClick={() => sendAction('likes this')}
              className="p-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              ❤️ Like
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col m-4 ml-0">
        <div className="glass-card flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  {message.type === 'message' && (
                    <>
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-white">
                          {message.playerName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {message.playerName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-200 text-sm">
                          {message.text}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {message.type === 'system' && (
                    <div className="flex-1 text-center">
                      <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                        {message.text}
                      </span>
                    </div>
                  )}
                  
                  {message.type === 'action' && (
                    <div className="flex-1 text-center">
                      <span className="text-xs text-indigo-400 bg-indigo-900/30 px-3 py-1 rounded-full">
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
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="modern-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;