'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function TestAnimationsPage() {
  const [showElements, setShowElements] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const choices = [
    { id: 1, text: 'Step forward boldly', impact: 'Show confidence' },
    { id: 2, text: 'Wait nervously', impact: 'Learn from observation' },
    { id: 3, text: 'Seek reassurance', impact: 'Build connections' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating magical particles */}
        <motion.div 
          className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-70"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-6 h-6 bg-pink-400 rounded-full opacity-60"
          animate={{
            y: [0, -15, 0],
            x: [0, -15, 0],
            scale: [1, 0.8, 1.3, 1],
            rotate: [0, -90, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Additional floating elements */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              ['bg-yellow-300', 'bg-pink-300', 'bg-blue-300', 'bg-purple-300', 'bg-green-300', 'bg-orange-300'][i]
            } opacity-40`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <Container className="py-8 relative z-10">
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Advanced Story Animations Test
          </motion.h1>
          
          <Button 
            onClick={() => setShowElements(!showElements)}
            className="mb-8"
          >
            {showElements ? 'Hide' : 'Show'} Story Elements
          </Button>
        </div>

        {/* Story roadmap */}
        <div className="relative max-w-4xl mx-auto">
          {/* Central timeline */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-indigo-500 h-full rounded-full opacity-60"></div>
          
          {/* Story segments */}
          <AnimatePresence>
            {showElements && (
              <motion.div
                initial={{ opacity: 0, x: -100, y: 50, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, x: 100, y: -50, scale: 0.8, rotate: 5 }}
                transition={{
                  duration: 1.2,
                  ease: [0.4, 0, 0.2, 1],
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="relative flex items-center justify-start mb-12"
              >
                {/* Timeline node */}
                <motion.div 
                  className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-lg z-10"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5,
                    ease: "backOut"
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)"
                  }}
                >
                  <motion.div 
                    className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-orange-400"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(251, 191, 36, 0.7)",
                        "0 0 0 10px rgba(251, 191, 36, 0)",
                        "0 0 0 0 rgba(251, 191, 36, 0.7)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                {/* Content card */}
                <motion.div 
                  className="w-full max-w-md mr-auto pr-8"
                  whileHover={{ 
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card 
                    variant="glass" 
                    className="p-6 bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30 transition-all duration-300"
                  >
                    <motion.div 
                      className="mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-purple-400 to-pink-400 h-32"
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 1,
                        delay: 0.8,
                        ease: "easeOut"
                      }}
                      whileHover={{ scale: 1.05 }}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: 1,
                        ease: "easeOut"
                      }}
                    >
                      <motion.p 
                        className="text-gray-200 leading-relaxed mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 1.5,
                          delay: 1.2
                        }}
                      >
                        The Great Hall of Hogwarts stands before you, its enchanted ceiling reflecting the starry night sky. This is where your story begins...
                      </motion.p>
                    </motion.div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choice selection */}
          <AnimatePresence>
            {showElements && (
              <motion.div 
                className="mt-12 relative"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ 
                  opacity: 0, 
                  y: -30, 
                  scale: 0.8,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }}
                transition={{
                  duration: 0.8,
                  delay: 1.5,
                  ease: [0.4, 0, 0.2, 1],
                  type: "spring",
                  stiffness: 100
                }}
              >
                {/* Timeline node for choices */}
                <motion.div 
                  className="absolute left-1/2 transform -translate-x-1/2 -top-6 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 1.8,
                    ease: "backOut"
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    boxShadow: "0 0 25px rgba(34, 197, 94, 0.8)"
                  }}
                >
                  <motion.div 
                    className="w-full h-full rounded-full bg-gradient-to-br from-green-300 to-emerald-400"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.7)",
                        "0 0 0 15px rgba(34, 197, 94, 0)",
                        "0 0 0 0 rgba(34, 197, 94, 0.7)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                <Card variant="glass" className="p-6 bg-green-500/20 border-green-500/50 hover:bg-green-500/30 transition-all duration-300">
                  <motion.h3 
                    className="text-xl font-bold text-white mb-4 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 2 }}
                  >
                    Choose Your Path
                  </motion.h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {choices.map((choice, index) => (
                      <motion.div
                        key={choice.id}
                        initial={{ 
                          opacity: 0, 
                          x: -50, 
                          scale: 0.8,
                          rotateY: -90
                        }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          scale: 1,
                          rotateY: 0
                        }}
                        transition={{
                          duration: 0.6,
                          delay: 2.2 + index * 0.15,
                          ease: [0.4, 0, 0.2, 1],
                          type: "spring",
                          stiffness: 120
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          x: 8,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="secondary"
                          className={`w-full text-left p-4 h-auto transition-all duration-300 ${
                            selectedChoice === choice.id
                              ? 'bg-green-500/30 border-green-400 scale-95'
                              : 'hover:bg-white/10 hover:border-white/30'
                          }`}
                          onClick={() => setSelectedChoice(choice.id)}
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 2.4 + index * 0.1 }}
                          >
                            <div className="font-medium text-white mb-1">
                              {String.fromCharCode(65 + index)}. {choice.text}
                            </div>
                            <div className="text-sm text-gray-400">
                              Impact: {choice.impact}
                            </div>
                          </motion.div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </div>
  );
}