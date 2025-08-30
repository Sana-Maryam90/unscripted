'use client';

import { useState, useEffect } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function SinglePlayerGame({ movie, onBack }) {
  const [gameState, setGameState] = useState('character-selection');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [storyHistory, setStoryHistory] = useState([]);
  const [currentStory, setCurrentStory] = useState('');
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (movie && gameState === 'character-selection') {
      // Initialize the game with the movie's first checkpoint
      const firstCheckpoint = movie.checkpoints[0];
      setCurrentStory(firstCheckpoint.context || firstCheckpoint.description || `Welcome to ${movie.title}! Your adventure is about to begin...`);
    }
  }, [movie, gameState]);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setGameState('playing');
    
    // Set initial story from the first checkpoint
    const firstCheckpoint = movie.checkpoints[currentCheckpoint];
    const sceneDesc = firstCheckpoint.sceneDescription || firstCheckpoint.context;
    const initialStory = `${firstCheckpoint.title}\n\n${sceneDesc}\n\nAs ${character.name}, ${character.description.toLowerCase()}. You must decide how to proceed in this crucial moment.`;
    setCurrentStory(initialStory);
    
    // Get character-specific choices from the first checkpoint
    const characterChoices = firstCheckpoint.characterChoices?.[character.id];
    if (characterChoices && characterChoices.length > 0) {
      setChoices(characterChoices);
    } else {
      // Fallback to generic choices if no character-specific ones exist
      setChoices(generateChoices(null, character));
    }
  };

  const handleChoice = async (choice) => {
    setIsLoading(true);
    
    // Add current story and choice to history
    setStoryHistory(prev => [...prev, {
      story: currentStory,
      choice: choice.text,
      character: selectedCharacter.name,
      impact: choice.impact || 'unknown'
    }]);

    // Simulate AI story generation (in real implementation, this would call OpenAI)
    setTimeout(() => {
      const nextStory = generateNextStory(choice, selectedCharacter);
      setCurrentStory(nextStory);
      
      // Try to advance to next checkpoint or generate new choices
      const nextCheckpointIndex = currentCheckpoint + 1;
      if (nextCheckpointIndex < movie.checkpoints.length) {
        // Move to next checkpoint
        setCurrentCheckpoint(nextCheckpointIndex);
        const nextCheckpoint = movie.checkpoints[nextCheckpointIndex];
        const characterChoices = nextCheckpoint.characterChoices?.[selectedCharacter.id];
        
        if (characterChoices && characterChoices.length > 0) {
          setChoices(characterChoices);
        } else {
          setChoices(generateChoices(choice, selectedCharacter));
        }
      } else {
        // Generate new choices for continued story
        const newChoices = generateChoices(choice, selectedCharacter);
        setChoices(newChoices);
      }
      
      setIsLoading(false);
    }, 2000);
  };

  const generateNextStory = (choice, character) => {
    // Use choice consequences if available
    const consequences = choice.consequences || [];
    const impact = choice.impact || 'unknown';
    
    // Create story based on the choice impact and consequences
    let storyBase = '';
    
    if (consequences.length > 0) {
      const consequence = consequences[Math.floor(Math.random() * consequences.length)];
      storyBase = `Your decision to ${choice.text.toLowerCase()} leads to ${consequence}. `;
    } else {
      storyBase = `As ${character.name}, you ${choice.text.toLowerCase()}. `;
    }
    
    // Add movie-specific flavor
    const flavorTexts = {
      'harry-potter-1': [
        'The magical world around you responds to your choice. Ancient spells seem to whisper approval as you forge your own path through Hogwarts.',
        'Your decision echoes through the castle corridors. The other students watch with growing respect as you demonstrate the true spirit of your character.',
        'Magic crackles in the air as your choice reshapes the very fabric of the wizarding world around you.'
      ],
      'star-wars-4': [
        'The Force flows through your decision, guiding you toward your destiny. The twin suns of Tatooine seem to shine brighter as you choose your path.',
        'Your choice reverberates across the galaxy. The Rebel Alliance grows stronger with decisions like these.',
        'The Death Star looms in the distance, but your resolve only grows stronger with each choice you make.'
      ],
      'stranger-things-1': [
        'The Upside Down seems to pulse with energy as your decision creates ripples in both dimensions.',
        'Your choice sends shockwaves through Hawkins. The other kids look to you for leadership in these dark times.',
        'Strange things are happening, but your determination lights the way forward through the supernatural darkness.'
      ]
    };
    
    const movieFlavors = flavorTexts[movie.id] || [
      'Your choice creates new possibilities in the story, opening paths that were never explored before.',
      'The other characters react with surprise and admiration as you take control of your destiny.',
      'Your decision reshapes the narrative, proving that every choice has the power to change everything.'
    ];
    
    const flavor = movieFlavors[Math.floor(Math.random() * movieFlavors.length)];
    
    return storyBase + flavor;
  };

  const generateChoices = (previousChoice, character) => {
    // Generate contextual choices based on character traits and movie context
    const characterTraits = character.traits || [];
    
    let choicePool = [];
    
    // Add character-specific choices based on traits
    if (characterTraits.includes('Brave') || characterTraits.includes('Leader')) {
      choicePool.push(
        { text: "Take charge and lead the way", description: "Use your natural leadership to guide others" },
        { text: "Face the danger head-on", description: "Confront the challenge with courage" }
      );
    }
    
    if (characterTraits.includes('Intelligent') || characterTraits.includes('Studious')) {
      choicePool.push(
        { text: "Research the problem thoroughly", description: "Use knowledge to find the best solution" },
        { text: "Analyze all possible outcomes", description: "Think through every angle before acting" }
      );
    }
    
    if (characterTraits.includes('Loyal') || characterTraits.includes('Protective')) {
      choicePool.push(
        { text: "Protect your friends at all costs", description: "Put others' safety before your own" },
        { text: "Stand by your allies", description: "Support those who matter most to you" }
      );
    }
    
    if (characterTraits.includes('Creative') || characterTraits.includes('Imaginative')) {
      choicePool.push(
        { text: "Think of a creative solution", description: "Use imagination to find an unexpected path" },
        { text: "Try an unconventional approach", description: "Break the rules to achieve your goal" }
      );
    }
    
    // Add some universal choices
    choicePool.push(
      { text: "Trust your instincts", description: "Follow your gut feeling about what's right" },
      { text: "Seek advice from others", description: "Get input before making a decision" },
      { text: "Take time to observe", description: "Watch and wait for the right moment" },
      { text: "Act with compassion", description: "Choose the path that helps others" }
    );
    
    // Shuffle and return 3-4 choices
    const shuffled = choicePool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(4, shuffled.length));
  };

  const handleEndGame = () => {
    setGameState('complete');
  };

  if (gameState === 'character-selection') {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="pt-32 pb-20">
          <Container>
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Choose Your Character
              </h1>
              <p className="text-xl text-gray-300">
                Select which character's perspective you want to experience in {movie.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {movie.characters.map((character) => (
                <Card 
                  key={character.id} 
                  variant="glass" 
                  className="p-6 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleCharacterSelect(character)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {character.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {character.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {character.description}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {character.traits.map((trait, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" onClick={onBack}>
                Back to Movie Selection
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (gameState === 'complete') {
    return (
      <div className="min-h-screen relative">
        <Header />
        <main className="pt-32 pb-20">
          <Container>
            <Card variant="glass" className="p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Story Complete!
                </h1>
                <p className="text-gray-300">
                  You've successfully reshaped the story of {movie.title} as {selectedCharacter?.name}
                </p>
              </div>

              <div className="mb-8">
                <div className="max-w-4xl mx-auto">
                  {/* Modern Header */}
                  <div className="glass-card p-8 mb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {selectedCharacter?.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2 modern-text">
                          Your {movie.title} Story
                        </h1>
                        <p className="text-gray-400 mb-3">
                          Experienced through {selectedCharacter?.name}'s perspective
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{storyHistory.length} chapters</span>
                          <span>•</span>
                          <span>{selectedCharacter?.name}</span>
                          <span>•</span>
                          <span>Interactive Story</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Story Content */}
                  <div className="glass-card p-8">
                    <div className="prose prose-lg max-w-none">
                      <div className="story-text space-y-6">
                        {(() => {
                          // Create clean, flowing narrative
                          let narrative = `In this unique retelling of ${movie.title}, ${selectedCharacter?.name} embarked on a journey that would reshape the story's destiny. `;
                          
                          storyHistory.forEach((entry, index) => {
                            let cleanStory = entry.story
                              .replace(new RegExp(`As ${selectedCharacter?.name}, you`, 'gi'), 'They')
                              .replace(new RegExp(`${selectedCharacter?.name}'s`, 'gi'), 'Their')
                              .replace(new RegExp(`Your choice to`, 'gi'), 'The decision to');
                            
                            narrative += cleanStory + ' ';
                          });
                          
                          narrative += `Through these ${storyHistory.length} pivotal moments, a completely new narrative emerged—one where every choice mattered and the story took unexpected turns that created a truly unique experience.`;
                          
                          // Split into readable paragraphs
                          const sentences = narrative.split('. ');
                          const paragraphs = [];
                          let currentParagraph = '';
                          
                          sentences.forEach((sentence, index) => {
                            currentParagraph += sentence + (index < sentences.length - 1 ? '. ' : '');
                            
                            if ((index + 1) % 4 === 0 || index === sentences.length - 1) {
                              paragraphs.push(currentParagraph.trim());
                              currentParagraph = '';
                            }
                          });
                          
                          return paragraphs.map((paragraph, index) => (
                            <p key={index} className="text-gray-200 leading-relaxed text-lg mb-6">
                              {paragraph}
                            </p>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={onBack}>
                  Play Another Story
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/'}>
                  Back to Home
                </Button>
              </div>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Header />
      <main className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Game Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              <p className="text-purple-300">
                Playing as: <span className="font-semibold">{selectedCharacter?.name}</span>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {currentCheckpoint < movie.checkpoints.length 
                  ? `Checkpoint: ${movie.checkpoints[currentCheckpoint]?.title}` 
                  : 'Free Play Mode'
                }
              </p>
            </div>

            {/* Story Display */}
            <Card variant="glass" className="p-8 mb-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-200 leading-relaxed">
                  {currentStory}
                </p>
              </div>
            </Card>

            {/* Choices */}
            {!isLoading && choices.length > 0 && (
              <Card variant="glass" className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 text-center">
                  What does {selectedCharacter?.name} do?
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {choices.map((choice, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 text-left justify-start h-auto hover:bg-purple-500/20"
                      onClick={() => handleChoice(choice)}
                    >
                      <div>
                        <div className="font-semibold text-white mb-1">
                          {choice.text}
                        </div>
                        {choice.description && (
                          <div className="text-sm text-gray-400">
                            {choice.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Debug info - remove in production */}
            {!isLoading && choices.length === 0 && (
              <Card variant="glass" className="p-6 text-center">
                <p className="text-yellow-300 mb-4">
                  No choices available. Generating new options...
                </p>
                <Button 
                  onClick={() => setChoices(generateChoices(null, selectedCharacter))}
                  variant="outline"
                >
                  Generate Choices
                </Button>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card variant="glass" className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-300">
                  Generating the next part of your story...
                </p>
              </Card>
            )}

            {/* Game Controls */}
            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={onBack}>
                Exit Game
              </Button>
              
              {storyHistory.length >= 5 && (
                <Button onClick={handleEndGame}>
                  End Story
                </Button>
              )}
            </div>

            {/* Story Progress */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Story segments: {storyHistory.length}
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}