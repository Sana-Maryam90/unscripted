'use client';

import { useState, useEffect } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getMovieByIdClient } from '../../lib/moviesClient';

const StoryProgression = ({ session, currentPlayer, onSessionUpdate }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [storyContent, setStoryContent] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const movieData = await getMovieByIdClient(session.movieId);
        setMovie(movieData);
        
        // Initialize story with opening
        setStoryContent([
          {
            type: 'narrative',
            content: `Welcome to ${movieData.title}! Your choices will reshape this beloved story...`,
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [session.movieId]);

  useEffect(() => {
    // Check if it's current player's turn
    setIsMyTurn(session.currentTurn === currentPlayer.id);
  }, [session.currentTurn, currentPlayer.id]);

  useEffect(() => {
    // Turn timer
    if (isMyTurn && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, timeLeft]);

  const makeChoice = (choice) => {
    if (!isMyTurn) return;

    // Add choice to story
    const choiceContent = {
      type: 'choice',
      content: `${currentPlayer.name} (${getCurrentCharacterName()}) chose: "${choice.text}"`,
      choice: choice,
      player: currentPlayer.name,
      character: getCurrentCharacterName(),
      timestamp: new Date()
    };

    // Add AI-generated response (mock)
    const aiResponse = {
      type: 'narrative',
      content: generateMockAIResponse(choice),
      timestamp: new Date()
    };

    setStoryContent(prev => [...prev, choiceContent, aiResponse]);

    // Advance to next checkpoint or next player
    const nextCheckpoint = currentCheckpoint + 1;
    const isStoryComplete = nextCheckpoint >= (movie?.checkpoints?.length || 3);

    if (isStoryComplete) {
      // Complete the game
      const updatedSession = {
        ...session,
        state: 'completed'
      };
      onSessionUpdate(updatedSession);
    } else {
      // Continue game - advance turn or checkpoint
      setCurrentCheckpoint(nextCheckpoint);
      
      const updatedSession = {
        ...session,
        currentTurn: getNextPlayer(),
        storyProgress: {
          ...session.storyProgress,
          currentCheckpoint: nextCheckpoint,
          completedChoices: [...(session.storyProgress.completedChoices || []), choice]
        }
      };
      onSessionUpdate(updatedSession);
    }

    // Reset timer
    setTimeLeft(300);
  };

  const getCurrentCharacterName = () => {
    if (!movie || !currentPlayer.characterId) return 'Unknown';
    const character = movie.characters.find(c => c.id === currentPlayer.characterId);
    return character?.name || 'Unknown';
  };

  const getNextPlayer = () => {
    if (session.mode === 'single') return currentPlayer.id;
    
    const currentIndex = session.players.findIndex(p => p.id === session.currentTurn);
    const nextIndex = (currentIndex + 1) % session.players.length;
    return session.players[nextIndex].id;
  };

  const getCurrentChoices = () => {
    if (!movie || !movie.checkpoints || currentCheckpoint >= movie.checkpoints.length) {
      return [];
    }

    const checkpoint = movie.checkpoints[currentCheckpoint];
    const characterChoices = checkpoint.characterChoices[currentPlayer.characterId];
    
    return characterChoices || [
      // Fallback choices
      {
        id: 'choice-a',
        text: 'Take the cautious approach',
        reasoning: 'careful consideration'
      },
      {
        id: 'choice-b', 
        text: 'Act boldly and decisively',
        reasoning: 'brave action'
      },
      {
        id: 'choice-c',
        text: 'Try to find a creative solution',
        reasoning: 'innovative thinking'
      }
    ];
  };

  const generateMockAIResponse = (choice) => {
    const responses = [
      `The decision to "${choice.text}" sends ripples through the story. The other characters react with surprise as the narrative takes an unexpected turn...`,
      `Your choice creates a new path in the story. The consequences of "${choice.text}" will shape what happens next in ways no one could have predicted...`,
      `The story shifts dramatically. By choosing to "${choice.text}", you've opened up possibilities that didn't exist in the original tale...`,
      `A new chapter begins. The impact of "${choice.text}" resonates through the story, changing the relationships and dynamics between characters...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading story...</p>
        </Card>
      </div>
    );
  }

  const currentChoices = getCurrentChoices();
  const currentTurnPlayer = session.players.find(p => p.id === session.currentTurn);

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {movie?.title}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="text-gray-300">Room: {session.roomCode}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">Checkpoint {currentCheckpoint + 1}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Story Content */}
          <div className="lg:col-span-3">
            <Card variant="glass" className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Story</h2>
                <div className="flex items-center space-x-4">
                  {isMyTurn && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Your Turn</span>
                      <span className="text-yellow-400 text-sm">({formatTime(timeLeft)})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Story Timeline */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {storyContent.map((content, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {content.type === 'choice' ? (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300 leading-relaxed">{content.content}</p>
                        {content.type === 'choice' && (
                          <div className="mt-2 text-xs text-gray-400">
                            {content.player} • {content.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Choices */}
            {currentChoices.length > 0 && (
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  {isMyTurn ? 'Your Choice' : `Waiting for ${currentTurnPlayer?.name}'s choice...`}
                </h3>
                
                {isMyTurn ? (
                  <div className="grid grid-cols-1 gap-3">
                    {currentChoices.map((choice, index) => (
                      <Button
                        key={choice.id}
                        variant="secondary"
                        className="text-left p-4 h-auto"
                        onClick={() => makeChoice(choice)}
                      >
                        <div>
                          <div className="font-medium text-white mb-1">
                            {String.fromCharCode(65 + index)}. {choice.text}
                          </div>
                          <div className="text-sm text-gray-400">
                            {choice.reasoning}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-pulse">
                      <div className="flex justify-center space-x-1 mb-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      {currentTurnPlayer?.name} is making their choice as {movie?.characters?.find(c => c.id === currentTurnPlayer?.characterId)?.name}...
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Players */}
            <Card variant="glass" className="p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Players</h3>
              <div className="space-y-3">
                {session.players.map((player) => {
                  const character = movie?.characters?.find(c => c.id === player.characterId);
                  const isCurrentTurn = session.currentTurn === player.id;
                  
                  return (
                    <div 
                      key={player.id}
                      className={`p-3 rounded-lg border ${
                        isCurrentTurn 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white text-sm font-medium">{player.name}</span>
                        {isCurrentTurn && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 ml-8">
                        Playing as {character?.name || 'Unknown'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Progress */}
            <Card variant="glass" className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Story Progress</span>
                    <span className="text-white">{currentCheckpoint + 1}/{movie?.checkpoints?.length || 3}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCheckpoint + 1) / (movie?.checkpoints?.length || 3)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400">
                  <div>Choices Made: {session.storyProgress?.completedChoices?.length || 0}</div>
                  <div>Current Turn: {currentTurnPlayer?.name}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default StoryProgression;