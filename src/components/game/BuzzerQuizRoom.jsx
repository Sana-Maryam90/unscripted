'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Button from '../ui/Button';

const BuzzerQuizRoom = ({ roomCode, playerId, playerName, selectedMovie, selectedCharacter, movieData, onLeave }) => {
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [activeBuzzer, setActiveBuzzer] = useState(null); // playerId who buzzed first
  const [scores, setScores] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canBuzz, setCanBuzz] = useState(false);
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [totalQuestions] = useState(20);
  const [roomEvents, setRoomEvents] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState({}); // Track wrong answers for cut marks
  const [movieTitle, setMovieTitle] = useState(selectedMovie?.title || '');
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [currentMovieData, setCurrentMovieData] = useState(movieData);
  const timerRef = useRef(null);

  // Add room event helper
  const addRoomEvent = (text, type = 'info') => {
    const event = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date()
    };
    setRoomEvents(prev => [...prev.slice(-9), event]); // Keep last 10 events
  };

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && activeBuzzer === playerId) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeBuzzer === playerId) {
      // Time's up - release control
      if (socket) {
        socket.emit('buzzer-timeout');
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, activeBuzzer, playerId, socket]);

  useEffect(() => {
    // Create socket connection
    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    // Connection status
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Connected to buzzer quiz server');
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
      console.log('🚪 Joining buzzer quiz room:', { 
        roomCode, 
        playerId, 
        playerName, 
        movieId: selectedMovie?.id,
        characterId: selectedCharacter?.id 
      });
      socket.emit('join-buzzer-room', {
        roomCode,
        playerId,
        playerName,
        movieId: selectedMovie?.id,
        characterId: selectedCharacter?.id
      });
    }

    // Listen for room events
    socket.on('buzzer-room-joined', (data) => {
      console.log('✅ Joined buzzer quiz room:', data);
      setPlayers(data.room.players || []);
      setWrongAnswers(data.room.wrongAnswers || {});
      
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
        setActiveBuzzer(data.room.activeBuzzer);
        setScores(data.room.scores || {});
        setQuestionNumber(data.room.questionNumber || 0);
        setShowAnswer(data.room.showAnswer || false);
        setCanBuzz(data.room.canBuzz || false);
        setTimeLeft(data.room.timeLeft || 0);
      }
      
      addRoomEvent(`You joined the buzzer quiz room`, 'success');
    });

    socket.on('buzzer-session-updated', (session) => {
      console.log('🔄 Buzzer quiz session updated:', session);
      setPlayers(session.players || []);
      setWrongAnswers(session.wrongAnswers || {});
      
      // Update available characters for character selection
      if (session.availableCharacters) {
        setAvailableCharacters(session.availableCharacters);
      }
      
      if (session.gameState) {
        setGameState(session.gameState);
        setCurrentQuestion(session.currentQuestion);
        setActiveBuzzer(session.activeBuzzer);
        setScores(session.scores || {});
        setQuestionNumber(session.questionNumber || 0);
        setShowAnswer(session.showAnswer || false);
        setCanBuzz(session.canBuzz || false);
        setTimeLeft(session.timeLeft || 0);
      }
    });

    socket.on('player-joined', (data) => {
      console.log('👤 Player joined:', data.player.name);
      setPlayers(data.room.players || []);
      addRoomEvent(`${data.player.name} joined the quiz`, 'success');
    });

    socket.on('player-left', (data) => {
      console.log('👋 Player left:', data.playerName);
      setPlayers(data.room.players || []);
      addRoomEvent(`${data.playerName} left the quiz`, 'warning');
    });

    // Buzzer quiz specific events
    socket.on('buzzer-quiz-started', (data) => {
      console.log('🚨 Buzzer quiz started!');
      setGameState('playing');
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setActiveBuzzer(null);
      setCanBuzz(true);
      setBuzzerPressed(false);
      
      addRoomEvent(`🚨 Quiz started! ${totalQuestions} questions about "${data.movieTitle || selectedMovie?.title}"`, 'success');
    });

    socket.on('buzzer-pressed', (data) => {
      console.log('🚨 Buzzer pressed by:', data.playerName);
      setActiveBuzzer(data.playerId);
      setCanBuzz(false);
      setTimeLeft(2); // 2 seconds to answer
      
      if (data.playerId === playerId) {
        setBuzzerPressed(true);
      }
      
      addRoomEvent(`🚨 ${data.playerName} buzzed in! 2 seconds to answer...`, 'info');
    });

    socket.on('buzzer-answer-submitted', (data) => {
      console.log('📝 Buzzer answer submitted:', data);
      setShowAnswer(true);
      setScores(data.scores);
      setActiveBuzzer(null);
      setCanBuzz(false);
      setTimeLeft(0);
      setBuzzerPressed(false);
      
      const isCorrect = data.selectedAnswer === data.correctAnswer;
      
      // Track wrong answers for cut marks
      if (!isCorrect) {
        setWrongAnswers(prev => ({
          ...prev,
          [data.playerId]: (prev[data.playerId] || 0) + 1
        }));
      }
      
      addRoomEvent(
        `${data.playerName}: ${data.answerText} - ${isCorrect ? '✅ Correct! (+1 point)' : `❌ Wrong (Correct: ${data.correctAnswerText})`}`,
        isCorrect ? 'success' : 'error'
      );
    });

    socket.on('buzzer-timeout', (data) => {
      console.log('⏰ Buzzer timeout');
      setActiveBuzzer(null);
      setCanBuzz(true);
      setTimeLeft(0);
      setBuzzerPressed(false);
      
      addRoomEvent(`⏰ ${data.playerName} ran out of time! Buzzer is open again.`, 'warning');
    });

    socket.on('buzzer-next-question', (data) => {
      console.log('➡️ Next buzzer question:', data);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setActiveBuzzer(null);
      setCanBuzz(true);
      setTimeLeft(0);
      setBuzzerPressed(false);
      
      addRoomEvent(`Question ${data.questionNumber}/${totalQuestions}`, 'info');
    });

    socket.on('buzzer-quiz-finished', (data) => {
      console.log('🏁 Buzzer quiz finished!');
      setGameState('finished');
      setScores(data.scores);
      setActiveBuzzer(null);
      setCanBuzz(false);
      
      const winner = data.winner;
      addRoomEvent(`🏆 Quiz Complete! Winner: ${winner.name} with ${winner.score} points!`, 'success');
    });

    socket.on('character-selected', (data) => {
      console.log('🎭 Character selected:', data);
      addRoomEvent(`${data.playerName} selected ${data.characterName}`, 'success');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      alert(error.message);
    });

    return () => {
      if (socket) {
        socket.off('buzzer-room-joined');
        socket.off('buzzer-session-updated');
        socket.off('player-joined');
        socket.off('player-left');
        socket.off('buzzer-quiz-started');
        socket.off('buzzer-pressed');
        socket.off('buzzer-answer-submitted');
        socket.off('buzzer-timeout');
        socket.off('buzzer-next-question');
        socket.off('buzzer-quiz-finished');
        socket.off('character-selected');
        socket.off('error');
      }
    };
  }, [socket, roomCode, playerId, playerName, selectedMovie, totalQuestions]);

  const startBuzzerQuiz = () => {
    if (!socket) return;
    socket.emit('start-buzzer-quiz');
  };

  const pressBuzzer = () => {
    if (!socket || !canBuzz || activeBuzzer) return;
    
    socket.emit('press-buzzer');
  };

  const submitAnswer = (answerIndex) => {
    if (!socket || activeBuzzer !== playerId || showAnswer) return;
    
    setSelectedAnswer(answerIndex);
    socket.emit('submit-buzzer-answer', {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex
    });
  };

  const nextQuestion = () => {
    if (!socket) return;
    socket.emit('buzzer-next-question');
  };

  const resetBuzzerQuiz = () => {
    if (!socket) return;
    socket.emit('reset-buzzer-quiz');
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

  const getEventColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const renderCutMarks = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <span key={i} className="text-red-500 text-lg">✗</span>
    ));
  };

  const currentPlayer = players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const activeBuzzerPlayer = players.find(p => p.id === activeBuzzer);

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
      <div className="w-80 glass-card m-4 p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">
            Buzzer Quiz: {roomCode}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {selectedMovie && (
            <div className="mt-2 p-2 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
              <p className="text-indigo-300 text-xs">🎬 Movie:</p>
              <p className="text-white text-sm font-medium">{selectedMovie.title}</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Players ({players.length}/4)
          </h3>
          <div className="space-y-2 mb-4">
            {players.map((player) => (
              <div key={player.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                activeBuzzer === player.id ? 'bg-yellow-500/20 ring-1 ring-yellow-500' : 'bg-white/5'
              }`}>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(player.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white truncate font-medium">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded">
                        HOST
                      </span>
                    )}
                    {activeBuzzer === player.id && gameState === 'playing' && (
                      <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded animate-pulse">
                        BUZZER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">
                        {player.characterId ? `Playing as ${player.characterId}` : (player.status || 'online')}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        {gameState === 'playing' && (
                          <span className="text-sm text-green-400 font-bold">
                            {scores[player.id] || 0} pts
                          </span>
                        )}
                        {wrongAnswers[player.id] > 0 && (
                          <div className="flex gap-1">
                            {renderCutMarks(wrongAnswers[player.id])}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Room Events */}
          <div className="flex-1 min-h-0">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Room Events</h3>
            <div className="bg-gray-800/50 rounded-lg p-3 h-32 overflow-y-auto">
              <div className="space-y-1">
                {roomEvents.map((event) => (
                  <div key={event.id} className="text-xs">
                    <span className={getEventColor(event.type)}>
                      {event.text}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          {gameState === 'waiting' && isHost && players.length >= 2 && (
            <Button onClick={startBuzzerQuiz} className="w-full mb-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500">
              🚨 Start Buzzer Quiz
            </Button>
          )}
          
          {gameState === 'finished' && isHost && (
            <Button onClick={resetBuzzerQuiz} variant="secondary" className="w-full mb-3">
              🔄 New Quiz
            </Button>
          )}
          
          <Button onClick={onLeave} variant="ghost" className="w-full">
            ← Leave Room
          </Button>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 flex flex-col m-4 ml-0">
        <div className="glass-card flex-1 flex flex-col justify-center">
          {/* Waiting State */}
          {gameState === 'waiting' && (
            <div className="text-center p-12">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                  <span className="text-3xl">🚨</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Buzzer Quiz Ready
                </h2>
                {selectedMovie && (
                  <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg max-w-md mx-auto">
                    <p className="text-indigo-300 font-medium">🎬 Selected Movie:</p>
                    <p className="text-white text-xl font-bold">{selectedMovie.title}</p>
                  </div>
                )}
                <p className="text-gray-400 text-lg mb-4">
                  First come, first serve! Press the buzzer to answer questions.
                </p>
                <p className="text-yellow-400">
                  Need at least 2 players to start • {totalQuestions} questions total
                </p>
              </div>
            </div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && currentQuestion && (
            <div className="text-center p-8">
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-lg text-gray-400 bg-gray-800 px-4 py-2 rounded-full">
                    Question {questionNumber}/{totalQuestions}
                  </span>
                  {activeBuzzerPlayer && (
                    <div className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500 px-4 py-2 rounded-full">
                      <span className="text-yellow-400 font-medium">
                        {activeBuzzerPlayer.name} has control
                      </span>
                      {timeLeft > 0 && (
                        <span className="text-2xl font-bold text-red-400 animate-pulse">
                          {timeLeft}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Question Text */}
                <div className="max-w-4xl mx-auto mb-8">
                  <h3 className="text-2xl font-bold text-white leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>
              </div>

              {/* Buzzer Button */}
              {!activeBuzzer && canBuzz && (
                <div className="mb-8">
                  <button
                    onClick={pressBuzzer}
                    className="w-40 h-40 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-full border-8 border-red-300 shadow-2xl transform hover:scale-105 transition-all duration-200 animate-pulse"
                  >
                    <div className="text-white font-bold text-2xl">
                      🚨<br />BUZZ
                    </div>
                  </button>
                  <p className="text-gray-400 text-lg mt-4">Click to buzz in!</p>
                </div>
              )}

              {/* Answer Options */}
              {activeBuzzer && (
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => submitAnswer(index)}
                        disabled={activeBuzzer !== playerId || showAnswer}
                        className={`p-6 rounded-xl border-3 transition-all text-left ${
                          showAnswer
                            ? index === currentQuestion.correct
                              ? 'border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20'
                              : selectedAnswer === index
                              ? 'border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20'
                              : 'border-gray-600 bg-gray-800 text-gray-400'
                            : selectedAnswer === index
                            ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20'
                            : activeBuzzer === playerId
                            ? 'border-gray-600 bg-gray-800 text-white hover:border-yellow-500 hover:bg-yellow-500/10 hover:shadow-lg'
                            : 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl font-bold bg-white/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-lg">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {showAnswer && isHost && (
                <div className="mt-8">
                  <Button 
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-8 py-3 text-lg"
                  >
                    {questionNumber < totalQuestions ? '➡️ Next Question' : '🏁 Finish Quiz'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Finished State */}
          {gameState === 'finished' && (
            <div className="text-center p-12">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-8">
                  Quiz Complete!
                </h2>
              </div>
              
              <div className="max-w-lg mx-auto">
                <h3 className="text-xl font-semibold text-white mb-6">Final Scores:</h3>
                <div className="space-y-3">
                  {players
                    .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                    .map((player, index) => (
                      <div key={player.id} className={`flex items-center justify-between p-4 rounded-xl ${
                        index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-500 shadow-lg' : 'bg-white/5 border border-gray-600'
                      }`}>
                        <div className="flex items-center gap-3">
                          {index === 0 && <span className="text-2xl">👑</span>}
                          <span className="text-white font-bold text-lg">{player.name}</span>
                          {wrongAnswers[player.id] > 0 && (
                            <div className="flex gap-1 ml-2">
                              {renderCutMarks(wrongAnswers[player.id])}
                            </div>
                          )}
                        </div>
                        <span className="text-green-400 font-bold text-xl">{scores[player.id] || 0} pts</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuzzerQuizRoom;