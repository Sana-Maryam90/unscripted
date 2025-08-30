'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getMovieById } from '../../lib/movies';

const GameComplete = ({ session, currentPlayer }) => {
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const movieData = await getMovieById(session.movieId);
        setMovie(movieData);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [session.movieId]);

  const generateAlternateEnding = () => {
    const endings = [
      "In this alternate timeline, the characters discovered a path that was never explored in the original story. Their choices led to unexpected alliances and a resolution that surprised everyone involved.",
      "The decisions made throughout this journey created a completely new narrative arc. What started as a familiar tale became something entirely unique, with characters growing in ways the original story never imagined.",
      "Through your collective choices, the story took on a life of its own. The characters faced challenges differently, formed new relationships, and ultimately reached a conclusion that felt both surprising and inevitable.",
      "Your collaborative storytelling has woven a tale that honors the original while creating something fresh and exciting. The characters' journeys reflected the unique perspectives each player brought to the story."
    ];
    return endings[Math.floor(Math.random() * endings.length)];
  };

  const getPlayerStats = () => {
    return session.players.map(player => {
      const character = movie?.characters?.find(c => c.id === player.characterId);
      const choicesMade = session.storyProgress?.completedChoices?.filter(choice => choice.playerId === player.id)?.length || 0;
      
      return {
        ...player,
        characterName: character?.name || 'Unknown',
        choicesMade,
        impactLevel: choicesMade > 2 ? 'High' : choicesMade > 1 ? 'Medium' : 'Low'
      };
    });
  };

  const playAgain = () => {
    router.push('/movies');
  };

  const createNewRoom = () => {
    router.push('/multiplayer');
  };

  const goHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Generating your story...</p>
        </Card>
      </div>
    );
  }

  const playerStats = getPlayerStats();
  const totalChoices = session.storyProgress?.completedChoices?.length || 0;
  const alternateEnding = generateAlternateEnding();

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Story Complete!
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Congratulations! You've successfully created a unique alternate version of <strong>{movie?.title}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story Summary */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Your Alternate Story</h2>
              
              {/* Story Ending */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">The Ending You Created</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {alternateEnding}
                </p>
              </div>

              {/* Key Choices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Decisions Made</h3>
                <div className="space-y-3">
                  {session.storyProgress?.completedChoices?.slice(-3).map((choice, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {playerStats.find(p => p.id === choice.playerId)?.name} chose: "{choice.text}"
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Playing as {playerStats.find(p => p.id === choice.playerId)?.characterName}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-400 italic">No choices recorded</p>
                  )}
                </div>
              </div>

              {/* Story Impact */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Story Impact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-400 mb-1">{totalChoices}</div>
                    <div className="text-gray-300 text-sm">Choices Made</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">{session.players.length}</div>
                    <div className="text-gray-300 text-sm">Storytellers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400 mb-1">∞</div>
                    <div className="text-gray-300 text-sm">Possibilities</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={playAgain} className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Play Another Movie
              </Button>
              <Button variant="secondary" size="lg" onClick={createNewRoom} className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Create New Room
              </Button>
              <Button variant="ghost" size="lg" onClick={goHome} className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Button>
            </div>
          </div>

          {/* Player Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="glass" className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Player Stats</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowStats(!showStats)}
                  className="text-purple-400"
                >
                  {showStats ? 'Hide' : 'Show'} Details
                </Button>
              </div>

              <div className="space-y-4">
                {playerStats.map((player, index) => (
                  <div key={player.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{player.name}</span>
                          {player.id === currentPlayer.id && (
                            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Played as {player.characterName}
                        </div>
                      </div>
                    </div>

                    {showStats && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Choices:</span>
                            <span className="text-white ml-1">{player.choicesMade}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Impact:</span>
                            <span className={`ml-1 ${
                              player.impactLevel === 'High' ? 'text-green-400' :
                              player.impactLevel === 'Medium' ? 'text-yellow-400' : 'text-gray-400'
                            }`}>
                              {player.impactLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Info */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Game Session</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Room Code:</span>
                  <span className="text-white font-mono">{session.roomCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-white capitalize">{session.mode} Player</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">~15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-400">✓ Success</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Share Section */}
        <Card variant="glass" className="mt-8 p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-4">Share Your Story</h3>
          <p className="text-gray-300 mb-6">
            You've created something unique! Share your alternate storyline with friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button variant="secondary" className="flex-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Story
            </Button>
            <Button variant="secondary" className="flex-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Save Story
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default GameComplete;