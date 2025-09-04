'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Button from '../ui/Button';

const TurnBasedQuizRoom = ({ roomCode, playerId, playerName, selectedMovie, selectedCharacter, movieData, onLeave }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [movieTitle, setMovieTitle] = useState(selectedMovie?.title || '');
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [currentMovieData, setCurrentMovieData] = useState(movieData);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Create socket connection (using same pattern as working ChatRoom)
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    // Connection status
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Connected to quiz server');
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

    // Join room when socket connects (same pattern as ChatRoom)
    if (roomCode && playerId && playerName) {
      console.log('🚪 Joining quiz room:', { 
        roomCode, 
        playerId, 
        playerName, 
        movieId: selectedMovie?.id,
        characterId: selectedCharacter?.id 
      });
      socket.emit('join-room', {
        roomCode,
        playerId,
        playerName,
        movieId: selectedMovie?.id,
        characterId: selectedCharacter?.id
      });
    }

    // Listen for room events (same as ChatRoom)
    socket.on('room-joined', (data) => {
      console.log('✅ Joined quiz room:', data);
      setPlayers(data.room.players || []);
      setMessages(data.room.messages || []);
      
      // Set movie data if joining an existing room
      if (data.room.movieData && !currentMovieData) {
        setCurrentMovieData(data.room.movieData);
        setMovieTitle(data.room.movieData.title);
      }
      
      // Show character selection if no character selected and movie data available
      if (!selectedCharacter && data.room.movieData) {
        setShowCharacterSelection(true);
        setAvailableCharacters(data.room.availableCharacters || data.room.movieData.characters);
      }
      
      // Initialize game state
      if (data.room.gameState) {
        setGameState(data.room.gameState);
        setCurrentQuestion(data.room.currentQuestion);
        setCurrentTurn(data.room.currentTurn);
        setScores(data.room.scores || {});
        setQuestionNumber(data.room.questionNumber || 0);
        setShowAnswer(data.room.showAnswer || false);
      }
    });

    socket.on('session-updated', (session) => {
      console.log('🔄 Quiz session updated:', session);
      setPlayers(session.players || []);
      setMessages(session.messages || []);
      
      // Update available characters for character selection
      if (session.availableCharacters) {
        setAvailableCharacters(session.availableCharacters);
      }
      
      if (session.gameState) {
        setGameState(session.gameState);
        setCurrentQuestion(session.currentQuestion);
        setCurrentTurn(session.currentTurn);
        setScores(session.scores || {});
        setQuestionNumber(session.questionNumber || 0);
        setShowAnswer(session.showAnswer || false);
      }
    });

    socket.on('player-joined', (data) => {
      console.log('👤 Player joined:', data.player.name);
      setPlayers(data.room.players || []);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.player.name} joined the quiz`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('player-left', (data) => {
      console.log('👋 Player left:', data.playerName);
      setPlayers(data.room.players || []);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} left the quiz`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Quiz-specific events
    socket.on('quiz-started', (data) => {
      console.log('🎯 Quiz started!');
      setGameState('playing');
      setCurrentQuestion(data.question);
      setCurrentTurn(data.currentTurn);
      setQuestionNumber(data.questionNumber);
      setShowAnswer(false);
      setSelectedAnswer(null);
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `🎬 Quiz started for "${data.movieTitle || movieTitle}"! Question ${data.questionNumber}/5`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('question-answered', (data) => {
      console.log('📝 Question answered:', data);
      setShowAnswer(true);
      setScores(data.scores);
      setStoryContent(data.storyContent || '');
      
      const isCorrect = data.selectedAnswer === data.correctAnswer;
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} answered: ${data.answerText} - ${isCorrect ? '✅ Correct!' : `❌ Wrong (Correct: ${data.correctAnswerText})`}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('next-question', (data) => {
      console.log('➡️ Next question:', data);
      setCurrentQuestion(data.question);
      setCurrentTurn(data.currentTurn);
      setQuestionNumber(data.questionNumber);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setStoryContent('');
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `Question ${data.questionNumber}/5 - ${data.currentPlayerName}'s turn`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('quiz-finished', (data) => {
      console.log('🏁 Quiz finished!');
      setGameState('finished');
      setScores(data.scores);
      
      const winner = data.winner;
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `🏆 Quiz finished! Winner: ${winner.name} with ${winner.score} points!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('character-selected', (data) => {
      console.log('🎭 Character selected:', data);
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} selected ${data.characterName}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
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
        socket.off('quiz-started');
        socket.off('question-answered');
        socket.off('next-question');
        socket.off('quiz-finished');
        socket.off('character-selected');
        socket.off('error');
      }
    };
  }, [socket, roomCode, playerId, playerName, selectedMovie, movieTitle]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      text: newMessage.trim()
    });

    setNewMessage('');
  };

  const startQuiz = () => {
    if (!socket) return;
    socket.emit('start-quiz');
  };

  const answerQuestion = (answerIndex) => {
    if (!socket || currentTurn !== playerId || showAnswer) return;
    
    setSelectedAnswer(answerIndex);
    socket.emit('answer-question', {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex
    });
  };

  const nextQuestion = () => {
    if (!socket) return;
    socket.emit('next-question');
  };

  const resetQuiz = () => {
    if (!socket) return;
    socket.emit('reset-quiz');
  };

  const selectCharacterInRoom = (character) => {
    if (!socket) return;
    
    console.log('🎭 Selecting character:', character.name);
    socket.emit('select-character', {
      characterId: character.id,
      characterName: character.name
    });
    
    setShowCharacterSelection(false);
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
  const currentTurnPlayer = players.find(p => p.id === currentTurn);

  // Character Selection Modal
  if (showCharacterSelection && currentMovieData) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="glass-card p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Choose Your Character
            </h2>
            <p className="text-gray-400 mb-2">
              Select a character from <strong>{currentMovieData.title}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Room: <span className="font-mono text-white">{roomCode}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentMovieData.characters.map((character) => {
              const isTaken = players.some(p => p.characterId === character.id);
              const takenBy = isTaken ? players.find(p => p.characterId === character.id)?.name : null;
              
              return (
                <div
                  key={character.id}
                  onClick={() => !isTaken && selectCharacterInRoom(character)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isTaken 
                      ? 'border-red-500/50 bg-red-500/10 cursor-not-allowed opacity-50' 
                      : 'border-gray-600 bg-white/5 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {character.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">
                      {character.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {character.description}
                    </p>
                    {isTaken && (
                      <div className="text-red-400 text-xs">
                        Taken by {takenBy}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Button onClick={onLeave} variant="secondary">
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Players Sidebar */}
      <div className="w-64 glass-card m-4 p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">
            Quiz Room: {roomCode}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {movieTitle && (
            <div className="mt-2 p-2 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
              <p className="text-indigo-300 text-xs">🎬 Movie:</p>
              <p className="text-white text-sm font-medium">{movieTitle}</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Players ({players.length}/4)
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className={`flex items-center gap-3 p-2 rounded-lg ${
                currentTurn === player.id ? 'bg-indigo-500/20 ring-1 ring-indigo-500' : 'bg-white/5'
              }`}>
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
                    {currentTurn === player.id && gameState === 'playing' && (
                      <span className="text-xs bg-yellow-500 text-white px-1 rounded">
                        TURN
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {player.characterId ? `Playing as ${player.characterId}` : (player.status || 'online')}
                    </span>
                    {gameState === 'playing' && (
                      <span className="text-xs text-green-400 font-medium">
                        {scores[player.id] || 0} pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          {gameState === 'waiting' && isHost && players.length >= 1 && (
            <Button onClick={startQuiz} className="w-full mb-2">
              Start Quiz
            </Button>
          )}
          
          {gameState === 'finished' && isHost && (
            <Button onClick={resetQuiz} variant="secondary" className="w-full mb-2">
              New Quiz
            </Button>
          )}
          
          <Button onClick={onLeave} variant="ghost" className="w-full">
            Leave Room
          </Button>
        </div>
      </div>

      {/* Quiz/Chat Area */}
      <div className="flex-1 flex flex-col m-4 ml-0">
        <div className="glass-card flex-1 flex flex-col">
          {/* Quiz Content */}
          {gameState === 'waiting' && (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Waiting for Quiz to Start
              </h2>
              {movieTitle && (
                <div className="mb-4 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
                  <p className="text-indigo-300 font-medium">🎬 Selected Movie:</p>
                  <p className="text-white text-lg">{movieTitle}</p>
                </div>
              )}
              <p className="text-gray-400 mb-4">
                Ready to test your knowledge about this movie!
              </p>
              {players.length < 1 && (
                <p className="text-yellow-400">
                  Waiting for players... ({players.length}/4)
                </p>
              )}
            </div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <div className="p-6 border-b border-gray-700">
              <div className="text-center mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">
                    Question {questionNumber}/5
                  </span>
                  <span className="text-sm text-indigo-400">
                    {currentTurnPlayer?.name}'s Turn
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6">
                  {currentQuestion.question}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => answerQuestion(index)}
                    disabled={currentTurn !== playerId || showAnswer}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      showAnswer
                        ? index === currentQuestion.correct
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : selectedAnswer === index
                          ? 'border-red-500 bg-red-500/20 text-red-400'
                          : 'border-gray-600 bg-gray-800 text-gray-400'
                        : selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                        : currentTurn === playerId
                        ? 'border-gray-600 bg-gray-800 text-white hover:border-indigo-500 hover:bg-indigo-500/10'
                        : 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
              
              {showAnswer && storyContent && (
                <div className="mt-6 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
                  <h4 className="text-lg font-semibold text-indigo-300 mb-2">📖 Story Context</h4>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {storyContent}
                  </p>
                </div>
              )}
              
              {showAnswer && isHost && (
                <div className="text-center mt-6">
                  <Button onClick={nextQuestion}>
                    {questionNumber < 5 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {gameState === 'finished' && (
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                🏆 Quiz Complete!
              </h2>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Final Scores:</h3>
                <div className="space-y-2">
                  {players
                    .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                    .map((player, index) => (
                      <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-white/5'
                      }`}>
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-yellow-500">👑</span>}
                          <span className="text-white font-medium">{player.name}</span>
                        </div>
                        <span className="text-green-400 font-bold">{scores[player.id] || 0} pts</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
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
              <Button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                size="sm"
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

export default TurnBasedQuizRoom;