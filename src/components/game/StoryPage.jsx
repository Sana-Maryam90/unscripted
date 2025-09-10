'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Card from '../ui/Card';

const StoryPage = ({ session, currentPlayer, onSessionUpdate }) => {
  const [storySegments, setStorySegments] = useState([]);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [visibleSegments, setVisibleSegments] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const storyRef = useRef(null);

  // Initialize with base content
  useEffect(() => {
    if (storySegments.length === 0) {
      // Base content appears first as per requirement 11.2
      setStorySegments([
        {
          id: 'base-content',
          type: 'narrative',
          content: `The Great Hall of Hogwarts stands before you, its enchanted ceiling reflecting the starry night sky. Hundreds of candles float in mid-air, casting dancing shadows across the four long house tables. Professor McGonagall holds the ancient Sorting Hat, its brim worn and patched from centuries of use. This is the moment that will define your destiny at Hogwarts School of Witchcraft and Wizardry. The original story begins here, but your choices will reshape everything that follows...`,
          image: '/.kiro/steering/Image generation art style/pixel eg.png',
          timestamp: new Date(),
          side: 'center', // Base content starts in center
          isBaseContent: true
        }
      ]);

      // Set initial choices - these will appear after base content
      setCurrentChoices([
        {
          id: 'choice-1',
          text: 'Step forward boldly when your name is called',
          impact: 'Show confidence and leadership'
        },
        {
          id: 'choice-2', 
          text: 'Wait nervously and watch other students first',
          impact: 'Learn from observation'
        },
        {
          id: 'choice-3',
          text: 'Try to catch Harry Potter\'s eye for reassurance',
          impact: 'Seek connection with the famous wizard'
        }
      ]);

      // Animate base content appearing first
      setTimeout(() => {
        setVisibleSegments(1);
        // Show choices after base content is visible
        setTimeout(() => setShowChoices(true), 1500);
      }, 800);
    }
  }, [session.movieTitle]);

  // Check if it's current player's turn
  useEffect(() => {
    setIsMyTurn(session.currentTurn === currentPlayer.id);
  }, [session.currentTurn, currentPlayer.id]);

  // Turn timer
  useEffect(() => {
    if (isMyTurn && timeLeft > 0 && currentChoices.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, timeLeft, currentChoices.length]);

  // Auto-scroll to latest content
  useEffect(() => {
    if (storyRef.current) {
      const lastElement = storyRef.current.lastElementChild;
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [storySegments]);

  // Animate new segments
  useEffect(() => {
    if (storySegments.length > visibleSegments) {
      const timer = setTimeout(() => {
        setVisibleSegments(storySegments.length);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [storySegments.length, visibleSegments]);

  const handleChoiceSelection = async (choice) => {
    if (!isMyTurn || isLoading || selectedChoice) return;

    setSelectedChoice(choice.id);
    setIsLoading(true);

    // Enhanced choice disappearance animation as per requirement 11.3
    setShowChoices(false);
    
    // Add advanced disappearing animation to selected choice
    const selectedButton = document.querySelector(`[data-choice-id="${choice.id}"]`);
    if (selectedButton) {
      selectedButton.style.transform = 'scale(0.9) rotateY(15deg)';
      selectedButton.style.opacity = '0.7';
      selectedButton.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Animate choice selection and story progression
    setTimeout(async () => {
      // Add player choice to story
      const choiceSegment = {
        id: `choice-${Date.now()}`,
        type: 'choice',
        content: `${currentPlayer.name} chose: "${choice.text}"`,
        player: currentPlayer.name,
        character: getCurrentCharacterName(),
        choice: choice,
        timestamp: new Date(),
        side: storySegments.length % 2 === 0 ? 'left' : 'right'
      };

      // Generate AI response (mock for now)
      const aiSegment = {
        id: `ai-${Date.now()}`,
        type: 'narrative',
        content: generateAIResponse(choice),
        image: generateMockImage(choice),
        timestamp: new Date(),
        side: (storySegments.length + 1) % 2 === 0 ? 'left' : 'right'
      };

      // Update story segments with staggered animation
      setStorySegments(prev => [...prev, choiceSegment]);
      
      // Add AI segment after choice segment appears
      setTimeout(() => {
        setStorySegments(prev => [...prev, aiSegment]);
        setVisibleSegments(prev => prev + 2);
      }, 800);

      // Clear choices temporarily
      setCurrentChoices([]);
      
      // Generate new choices after a delay
      setTimeout(() => {
        if (storySegments.length < 8) { // Continue for 4-5 iterations
          setCurrentChoices(generateNewChoices());
          setShowChoices(true);
        } else {
          // Story complete
          const updatedSession = {
            ...session,
            state: 'completed'
          };
          onSessionUpdate(updatedSession);
        }
        setIsLoading(false);
        setSelectedChoice(null);
        setTimeLeft(300);
      }, 2500);

      // Update session
      const updatedSession = {
        ...session,
        currentTurn: getNextPlayer(),
        storyProgress: {
          ...session.storyProgress,
          currentCheckpoint: (session.storyProgress?.currentCheckpoint || 0) + 1,
          completedChoices: [...(session.storyProgress?.completedChoices || []), choice]
        }
      };
      onSessionUpdate(updatedSession);
    }, 1000);
  };

  const getCurrentCharacterName = () => {
    // Mock character name - in real implementation, get from movie data
    return 'Harry Potter';
  };

  const getNextPlayer = () => {
    if (session.mode === 'single') return currentPlayer.id;
    
    const currentIndex = session.players.findIndex(p => p.id === session.currentTurn);
    const nextIndex = (currentIndex + 1) % session.players.length;
    return session.players[nextIndex].id;
  };

  const generateAIResponse = (choice) => {
    const responses = [
      `Your decision to "${choice.text}" creates ripples through the magical atmosphere. The other students watch with curiosity as your path diverges from the original tale. Professor McGonagall raises an eyebrow, sensing something different about this moment...`,
      `The choice resonates through the Great Hall. By choosing to "${choice.text}", you've opened a door to possibilities that didn't exist in the original story. The Sorting Hat seems to whisper secrets only you can hear...`,
      `Magic crackles in the air as your decision takes hold. "${choice.text}" - these words echo through the hall, changing the very fabric of destiny. What happens next will be unlike anything from the books...`,
      `The story shifts like sand through an hourglass. Your choice to "${choice.text}" has set events in motion that will reshape everything. Even Dumbledore seems to sense the change, his eyes twinkling with newfound curiosity...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateMockImage = (choice) => {
    // Use images from steering directory as per requirement
    const steeringImages = [
      '/.kiro/steering/Image generation art style/pixel eg.png',
      '/.kiro/steering/Image generation art style/pixel eg2.png',
      '/.kiro/steering/Image generation art style/pixel eg3.png',
      '/.kiro/steering/Image generation art style/stranger things.png',
      '/.kiro/steering/Image generation art style/Code_Generated_Image.png'
    ];
    return steeringImages[Math.floor(Math.random() * steeringImages.length)];
  };

  const generateNewChoices = () => {
    const choiceSets = [
      [
        { id: 'choice-a1', text: 'Follow the mysterious corridor to the left', impact: 'Discover hidden secrets' },
        { id: 'choice-a2', text: 'Join the other students in the common room', impact: 'Build friendships' },
        { id: 'choice-a3', text: 'Seek out Professor Dumbledore for guidance', impact: 'Gain wisdom' }
      ],
      [
        { id: 'choice-b1', text: 'Practice magic spells in secret', impact: 'Develop hidden talents' },
        { id: 'choice-b2', text: 'Investigate the strange noises from the dungeon', impact: 'Uncover mysteries' },
        { id: 'choice-b3', text: 'Write a letter to your family about the changes', impact: 'Maintain connections' }
      ],
      [
        { id: 'choice-c1', text: 'Challenge the established rules of the school', impact: 'Revolutionary thinking' },
        { id: 'choice-c2', text: 'Form an alliance with unexpected characters', impact: 'Surprising partnerships' },
        { id: 'choice-c3', text: 'Discover a hidden room in the castle', impact: 'Unlock ancient secrets' }
      ]
    ];
    
    const randomSet = choiceSets[Math.floor(Math.random() * choiceSets.length)];
    return randomSet;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTurnPlayer = session.players?.find(p => p.id === session.currentTurn);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Enhanced dark background with grain effect and subtle patterns */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 30%),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='5' cy='5' r='0.5'/%3E%3Ccircle cx='15' cy='5' r='0.5'/%3E%3Ccircle cx='25' cy='5' r='0.5'/%3E%3Ccircle cx='35' cy='5' r='0.5'/%3E%3Ccircle cx='5' cy='15' r='0.5'/%3E%3Ccircle cx='15' cy='15' r='0.5'/%3E%3Ccircle cx='25' cy='15' r='0.5'/%3E%3Ccircle cx='35' cy='15' r='0.5'/%3E%3Ccircle cx='5' cy='25' r='0.5'/%3E%3Ccircle cx='15' cy='25' r='0.5'/%3E%3Ccircle cx='25' cy='25' r='0.5'/%3E%3Ccircle cx='35' cy='25' r='0.5'/%3E%3Ccircle cx='5' cy='35' r='0.5'/%3E%3Ccircle cx='15' cy='35' r='0.5'/%3E%3Ccircle cx='25' cy='35' r='0.5'/%3E%3Ccircle cx='35' cy='35' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `
        }}
      />
      
      {/* Animated grain overlay */}
      <motion.div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
      
      {/* Enhanced animated background elements inspired by advanceAnimationExample.md */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating magical orbs with advanced animations */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className={`absolute rounded-full ${
              ['bg-amber-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-pink-400', 'bg-cyan-400'][i]
            }`}
            style={{
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              y: [0, -30 - Math.random() * 20, 0],
              x: [0, 15 - Math.random() * 30, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 6
            }}
          />
        ))}
        
        {/* Pulsing light effects */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`light-${i}`}
            className="absolute rounded-full"
            style={{
              width: '120px',
              height: '120px',
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
              background: `radial-gradient(circle, ${
                ['rgba(251, 191, 36, 0.1)', 'rgba(59, 130, 246, 0.08)', 'rgba(168, 85, 247, 0.06)'][i]
              } 0%, transparent 70%)`
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
          />
        ))}
      </div>

      <Container className="py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-wide"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {session.movieTitle || 'Interactive Story'}
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center space-x-6 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="bg-gray-800/50 px-3 py-1 rounded-full">Room: {session.roomCode}</span>
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span className="bg-gray-800/50 px-3 py-1 rounded-full">Chapter {Math.floor(storySegments.length / 2) + 1}</span>
          </motion.div>
        </div>

        {/* Turn indicator */}
        {currentChoices.length > 0 && (
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isMyTurn ? (
              <div className="inline-flex items-center space-x-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full px-6 py-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400 font-medium">Your Turn</span>
                <span className="text-amber-400">({formatTime(timeLeft)})</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-3 bg-amber-500/20 border border-amber-500/50 rounded-full px-6 py-3 backdrop-blur-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-amber-400">Waiting for {currentTurnPlayer?.name}...</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Enhanced story roadmap with improved layout */}
        <div className="relative max-w-7xl mx-auto" ref={storyRef}>
          {/* Enhanced central timeline with gradient and glow */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full rounded-full opacity-60">
            <motion.div 
              className="w-full h-full bg-gradient-to-b from-amber-400 via-orange-500 via-red-500 to-purple-600 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(251, 191, 36, 0.3)",
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 10px rgba(251, 191, 36, 0.3)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          {/* Enhanced story segments with improved roadmap layout */}
          <div className="space-y-20">
            <AnimatePresence>
              {storySegments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ 
                    opacity: 0, 
                    y: 80,
                    scale: 0.8,
                    rotateX: 15
                  }}
                  animate={{ 
                    opacity: index < visibleSegments ? 1 : 0, 
                    y: 0,
                    scale: 1,
                    rotateX: 0
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="relative"
                  style={{ perspective: '1000px' }}
                >
                  {/* Enhanced timeline node with multiple layers */}
                  <motion.div 
                    className="absolute left-1/2 transform -translate-x-1/2 z-20"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                      scale: index < visibleSegments ? 1 : 0,
                      rotate: 0
                    }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.5 + 0.4,
                      ease: "backOut"
                    }}
                  >
                    {/* Outer glow ring */}
                    <motion.div 
                      className="w-8 h-8 rounded-full border-2 border-amber-400/30 absolute -inset-2"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Main node */}
                    <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-gray-900 shadow-lg relative">
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400"
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(251, 191, 36, 0.6)",
                            "0 0 0 12px rgba(251, 191, 36, 0)",
                            "0 0 0 0 rgba(251, 191, 36, 0.6)"
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Inner sparkle */}
                      <motion.div 
                        className="absolute inset-1 rounded-full bg-white/40"
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: Math.random() * 2
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Enhanced content layout - image opposite to content as per requirements */}
                  <div className={`grid grid-cols-1 xl:grid-cols-12 gap-12 items-start ${
                    segment.isBaseContent ? 'xl:grid-cols-1' : ''
                  }`}>
                    
                    {/* Image section - positioned opposite to content */}
                    {segment.image && !segment.isBaseContent && (
                      <motion.div 
                        className={`xl:col-span-5 ${
                          index % 2 === 0 ? 'xl:order-2' : 'xl:order-1'
                        }`}
                        initial={{ 
                          opacity: 0, 
                          scale: 1.2, 
                          x: index % 2 === 0 ? 60 : -60,
                          rotateY: index % 2 === 0 ? -15 : 15
                        }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          x: 0,
                          rotateY: 0
                        }}
                        transition={{
                          duration: 1,
                          delay: index * 0.5 + 0.7,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{ perspective: '1000px' }}
                      >
                        <div className="relative group">
                          {/* Image container with enhanced styling */}
                          <motion.div 
                            className="relative rounded-3xl overflow-hidden shadow-2xl"
                            whileHover={{ 
                              scale: 1.02,
                              rotateY: index % 2 === 0 ? 2 : -2
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <img 
                              src={segment.image} 
                              alt="Story scene"
                              className="w-full h-72 xl:h-80 object-cover"
                              onError={(e) => {
                                // Use images from steering directory as per requirements
                                const steeringImages = [
                                  '/.kiro/steering/Image generation art style/pixel eg.png',
                                  '/.kiro/steering/Image generation art style/pixel eg2.png',
                                  '/.kiro/steering/Image generation art style/pixel eg3.png',
                                  '/.kiro/steering/Image generation art style/stranger things.png',
                                  '/.kiro/steering/Image generation art style/Code_Generated_Image.png'
                                ];
                                e.target.src = steeringImages[index % steeringImages.length];
                              }}
                            />
                            
                            {/* Enhanced overlay effects */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                              transition={{ duration: 0.3 }}
                            />
                            
                            {/* Decorative corner elements */}
                            <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-amber-400/50"></div>
                            <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-amber-400/50"></div>
                            <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-amber-400/50"></div>
                            <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-amber-400/50"></div>
                          </motion.div>
                          
                          {/* Floating glow effect */}
                          <motion.div 
                            className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Base content image (centered) */}
                    {segment.image && segment.isBaseContent && (
                      <motion.div 
                        className="xl:col-span-12 flex justify-center mb-8"
                        initial={{ opacity: 0, scale: 1.1, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          duration: 1.2,
                          delay: 0.5,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      >
                        <div className="relative max-w-2xl">
                          <motion.div 
                            className="relative rounded-3xl overflow-hidden shadow-2xl"
                            animate={{
                              boxShadow: [
                                "0 20px 40px rgba(0,0,0,0.3)",
                                "0 25px 50px rgba(251, 191, 36, 0.2)",
                                "0 20px 40px rgba(0,0,0,0.3)"
                              ]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <img 
                              src={segment.image} 
                              alt="Story opening scene"
                              className="w-full h-80 object-cover"
                              onError={(e) => {
                                e.target.src = '/.kiro/steering/Image generation art style/pixel eg.png';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Text content section - improved typography and layout */}
                    <motion.div 
                      className={`xl:col-span-7 ${
                        segment.isBaseContent ? 'xl:col-span-12 text-center' : 
                        index % 2 === 0 ? 'xl:order-1' : 'xl:order-2'
                      }`}
                      initial={{ 
                        opacity: 0, 
                        x: segment.isBaseContent ? 0 : (index % 2 === 0 ? -60 : 60),
                        y: 30
                      }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{
                        duration: 1,
                        delay: index * 0.5 + 0.9,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      <div className={`space-y-6 ${segment.isBaseContent ? 'max-w-4xl mx-auto' : ''}`}>
                        {/* Enhanced content as proper paragraphs */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.5 + 1.1,
                            ease: "easeOut"
                          }}
                          className="relative"
                        >
                          {/* Content background with subtle styling */}
                          <div className={`relative p-8 rounded-2xl ${
                            segment.isBaseContent 
                              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50' 
                              : 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30'
                          }`}>
                            {/* Decorative quote mark for narrative content */}
                            {segment.type === 'narrative' && (
                              <motion.div 
                                className="absolute -top-2 -left-2 text-6xl text-amber-400/30 font-serif"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.5 + 1.3, duration: 0.5 }}
                              >
                                "
                              </motion.div>
                            )}
                            
                            <div className="prose prose-invert prose-xl max-w-none">
                              <motion.p 
                                className={`text-gray-100 leading-relaxed font-light tracking-wide ${
                                  segment.isBaseContent ? 'text-xl' : 'text-lg'
                                }`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                  duration: 1,
                                  delay: index * 0.5 + 1.4
                                }}
                              >
                                {segment.content}
                              </motion.p>
                            </div>
                            
                            {/* Enhanced choice metadata */}
                            {segment.type === 'choice' && (
                              <motion.div 
                                className="flex items-center justify-between text-sm text-gray-400 pt-6 mt-6 border-t border-gray-600/50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: index * 0.5 + 1.6
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                  <span className="font-medium text-emerald-300">{segment.player}</span>
                                </div>
                                <span className="text-gray-500">{segment.timestamp.toLocaleTimeString()}</span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Enhanced choice selection with advanced animations */}
          <AnimatePresence>
            {currentChoices.length > 0 && showChoices && (
              <motion.div 
                className="mt-20 relative"
                initial={{ opacity: 0, y: 80, scale: 0.8, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ 
                  opacity: 0, 
                  y: -50, 
                  scale: 0.7,
                  rotateX: -20,
                  transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
                }}
                transition={{
                  duration: 1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{ perspective: '1000px' }}
              >
                {/* Enhanced timeline node for choices */}
                <motion.div 
                  className="absolute left-1/2 transform -translate-x-1/2 -top-10 z-20"
                  initial={{ scale: 0, rotate: -360, y: -20 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: "backOut"
                  }}
                >
                  {/* Multiple glow rings */}
                  <motion.div 
                    className="w-12 h-12 rounded-full border-2 border-emerald-400/20 absolute -inset-3"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.5, 0.2],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="w-8 h-8 rounded-full border-2 border-emerald-400/40 absolute -inset-1"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.7, 0.4],
                      rotate: [360, 180, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main choice node */}
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-gray-900 shadow-lg relative">
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-green-400"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(34, 197, 94, 0.6)",
                          "0 0 0 16px rgba(34, 197, 94, 0)",
                          "0 0 0 0 rgba(34, 197, 94, 0.6)"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Pulsing center */}
                    <motion.div 
                      className="absolute inset-1 rounded-full bg-white/60"
                      animate={{
                        scale: [0.5, 1, 0.5],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-5xl mx-auto"
                  style={{ perspective: '1000px' }}
                >
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-gray-600/50 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
                    
                    <motion.h3 
                      className="text-3xl font-bold text-white mb-8 text-center relative z-10"
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <motion.span
                        animate={{
                          textShadow: [
                            "0 0 10px rgba(34, 197, 94, 0.3)",
                            "0 0 20px rgba(34, 197, 94, 0.5)",
                            "0 0 10px rgba(34, 197, 94, 0.3)"
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {isMyTurn ? 'Choose Your Path' : `Waiting for ${currentTurnPlayer?.name}'s choice...`}
                      </motion.span>
                    </motion.h3>
                    
                    {isMyTurn ? (
                      <div className="grid grid-cols-1 gap-6 relative z-10">
                        {currentChoices.map((choice, index) => (
                          <motion.div
                            key={choice.id}
                            initial={{ 
                              opacity: 0, 
                              x: -50, 
                              scale: 0.8,
                              rotateY: -15
                            }}
                            animate={{ 
                              opacity: 1, 
                              x: 0, 
                              scale: 1,
                              rotateY: 0
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.8,
                              x: 50,
                              rotateY: 15,
                              transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                            }}
                            transition={{
                              duration: 0.7,
                              delay: 0.6 + index * 0.15,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            whileHover={{ 
                              scale: 1.03,
                              rotateY: 2,
                              transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.97 }}
                            style={{ perspective: '1000px' }}
                          >
                            <button
                              className={`w-full text-left p-8 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden group ${
                                selectedChoice === choice.id
                                  ? 'bg-emerald-500/20 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/20'
                                  : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 hover:bg-gradient-to-br hover:from-gray-700/60 hover:to-gray-800/60 hover:border-gray-500/70 hover:shadow-xl'
                              }`}
                              onClick={() => handleChoiceSelection(choice)}
                              disabled={isLoading || selectedChoice}
                              data-choice-id={choice.id}
                            >
                              {/* Animated background gradient on hover */}
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                              />
                              
                              {/* Choice letter indicator */}
                              <motion.div 
                                className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                  duration: 0.5, 
                                  delay: 0.8 + index * 0.15,
                                  ease: "backOut"
                                }}
                              >
                                {String.fromCharCode(65 + index)}
                              </motion.div>
                              
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 + index * 0.15 }}
                                className="relative z-10"
                              >
                                <div className="font-semibold text-white mb-3 text-xl leading-relaxed pr-12">
                                  {choice.text}
                                </div>
                                <div className="text-sm text-gray-400 flex items-center space-x-2">
                                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                                  <span>Impact: {choice.impact}</span>
                                </div>
                              </motion.div>
                              
                              {/* Selection indicator */}
                              {selectedChoice === choice.id && (
                                <motion.div 
                                  className="absolute inset-0 border-2 border-emerald-400 rounded-2xl"
                                  initial={{ scale: 1.1, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <div className="flex justify-center space-x-2 mb-4">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-3 h-3 bg-amber-400 rounded-full"
                              animate={{
                                y: [0, -8, 0],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-amber-400">Waiting for {currentTurnPlayer?.name}...</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state for AI generation */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                className="mt-12 relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div 
                  className="absolute left-1/2 transform -translate-x-1/2 -top-6 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-3 border-gray-800 shadow-lg z-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center">
                  <div className="flex justify-center space-x-2 mb-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-amber-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  <motion.p 
                    className="text-amber-200 mb-4"
                    animate={{
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Weaving your choice into the story...
                  </motion.p>
                  
                  {/* Progress bar animation */}
                  <motion.div 
                    className="w-full bg-amber-900/30 rounded-full h-2 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: 2.5,
                        ease: "easeInOut",
                        repeat: Infinity
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </Container>
    </div>
  );
};

export default StoryPage;