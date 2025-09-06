// Client-side movie data (no file system access)

const movieData = {
  'harry-potter-1': {
    id: 'harry-potter-1',
    title: 'Harry Potter and the Philosopher\'s Stone',
    description: 'Join Harry on his magical journey to Hogwarts and discover alternate paths in the wizarding world.',
    poster: '/images/moviePosters/Harry Potter.jpg',
    genre: ['Fantasy', 'Adventure', 'Family'],
    characters: [
      {
        id: 'harry',
        name: 'Harry Potter',
        description: 'The Boy Who Lived, a young wizard discovering his magical heritage',
        personality: 'brave, curious, loyal, sometimes impulsive',
        background: 'Raised by his muggle relatives, unaware of his fame in the wizarding world',
        traits: ['Brave', 'Curious', 'Loyal']
      },
      {
        id: 'hermione',
        name: 'Hermione Granger',
        description: 'A brilliant witch and Harry\'s loyal friend',
        personality: 'intelligent, logical, determined, rule-following',
        background: 'Muggle-born witch with exceptional magical abilities and love for learning',
        traits: ['Intelligent', 'Logical', 'Studious']
      },
      {
        id: 'ron',
        name: 'Ron Weasley',
        description: 'Harry\'s best friend from a pure-blood wizarding family',
        personality: 'loyal, brave, humorous, sometimes insecure',
        background: 'Youngest son of the Weasley family, overshadowed by his accomplished siblings',
        traits: ['Loyal', 'Humorous', 'Brave']
      },
      {
        id: 'hagrid',
        name: 'Hagrid',
        description: 'Keeper of Keys and Grounds at Hogwarts',
        personality: 'kind-hearted, protective, loves magical creatures',
        background: 'Half-giant who introduces Harry to the wizarding world',
        traits: ['Kind', 'Protective', 'Gentle']
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint-1',
        position: 1,
        title: 'The Hogwarts Letter',
        context: 'Harry receives his Hogwarts letter on his 11th birthday',
        characterChoices: {
          'harry': [
            {
              id: 'choice-1a',
              text: 'Ask Hagrid about his parents immediately',
              impact: 'eager for truth'
            },
            {
              id: 'choice-1b',
              text: 'Focus on learning about the wizarding world first',
              impact: 'cautious curiosity'
            },
            {
              id: 'choice-1c',
              text: 'Express anger at the Dursleys for lying',
              impact: 'confrontational'
            }
          ],
          'hermione': [
            {
              id: 'choice-1d',
              text: 'Research everything about Hogwarts immediately',
              impact: 'thorough preparation'
            },
            {
              id: 'choice-1e',
              text: 'Help Harry understand his situation',
              impact: 'supportive friendship'
            }
          ],
          'ron': [
            {
              id: 'choice-1f',
              text: 'Share stories about wizard life',
              impact: 'cultural bridge'
            },
            {
              id: 'choice-1g',
              text: 'Invite Harry to the Burrow',
              impact: 'family inclusion'
            }
          ]
        }
      },
      {
        id: 'checkpoint-2',
        position: 2,
        title: 'Diagon Alley Shopping',
        context: 'Harry visits Diagon Alley to buy his school supplies',
        characterChoices: {
          'harry': [
            {
              id: 'choice-2a',
              text: 'Spend extra time in Ollivanders learning about wands',
              impact: 'magical knowledge focus'
            },
            {
              id: 'choice-2b',
              text: 'Explore Knockturn Alley despite warnings',
              impact: 'rebellious curiosity'
            }
          ],
          'hermione': [
            {
              id: 'choice-2c',
              text: 'Buy extra books for advanced study',
              impact: 'academic excellence'
            }
          ],
          'ron': [
            {
              id: 'choice-2d',
              text: 'Show Harry the best wizard candy',
              impact: 'fun friendship'
            }
          ]
        }
      },
      {
        id: 'checkpoint-3',
        position: 3,
        title: 'The Sorting Hat',
        context: 'Harry faces the Sorting Hat at Hogwarts',
        characterChoices: {
          'harry': [
            {
              id: 'choice-3a',
              text: 'Accept Slytherin and embrace ambition',
              impact: 'dark path potential'
            },
            {
              id: 'choice-3b',
              text: 'Strongly request Gryffindor',
              impact: 'brave determination'
            }
          ]
        }
      }
    ],
    difficulty: 'beginner',
    maxPlayers: 4,
    estimatedPlayTime: '45-60 minutes'
  },
  
  'star-wars-4': {
    id: 'star-wars-4',
    title: 'Star Wars: A New Hope',
    description: 'Experience the galaxy far, far away and reshape the destiny of the Rebel Alliance.',
    poster: '/images/moviePosters/Star Wars.jpg',
    genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
    characters: [
      {
        id: 'luke',
        name: 'Luke Skywalker',
        description: 'A young farm boy destined to become a Jedi Knight',
        personality: 'idealistic, brave, impatient, strong with the Force',
        traits: ['Idealistic', 'Brave', 'Force-Sensitive']
      },
      {
        id: 'leia',
        name: 'Princess Leia',
        description: 'Leader of the Rebel Alliance and secret twin sister to Luke',
        personality: 'strong-willed, diplomatic, fearless, natural leader',
        traits: ['Leader', 'Diplomatic', 'Fearless']
      },
      {
        id: 'han',
        name: 'Han Solo',
        description: 'Smuggler and captain of the Millennium Falcon',
        personality: 'roguish, sarcastic, loyal when it matters, skeptical',
        traits: ['Roguish', 'Sarcastic', 'Pilot']
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint-1',
        position: 1,
        title: 'The Binary Sunset',
        context: 'Luke discovers the message from Princess Leia in R2-D2',
        characterChoices: {
          'luke': [
            {
              id: 'choice-1a',
              text: 'Immediately seek out Ben Kenobi',
              impact: 'proactive heroism'
            },
            {
              id: 'choice-1b',
              text: 'Try to convince Uncle Owen to help',
              impact: 'family loyalty'
            }
          ]
        }
      }
    ],
    difficulty: 'intermediate',
    maxPlayers: 4,
    estimatedPlayTime: '60-75 minutes'
  },
  
  'stranger-things-1': {
    id: 'stranger-things-1',
    title: 'Stranger Things: Season 1',
    description: 'Enter the Upside Down and help the kids of Hawkins face supernatural horrors.',
    poster: '/images/moviePosters/Stranger Things.jpg',
    genre: ['Sci-Fi', 'Horror', 'Drama'],
    characters: [
      {
        id: 'eleven',
        name: 'Eleven',
        description: 'A girl with psychokinetic abilities who escaped from Hawkins Lab',
        personality: 'quiet, powerful, loyal, traumatized but brave',
        traits: ['Psychic', 'Powerful', 'Loyal']
      },
      {
        id: 'mike',
        name: 'Mike Wheeler',
        description: 'Leader of the group and Eleven\'s closest friend',
        personality: 'determined, loyal, protective, natural leader',
        traits: ['Leader', 'Loyal', 'Protective']
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint-1',
        position: 1,
        title: 'Will\'s Disappearance',
        context: 'Will Byers goes missing after a D&D campaign',
        characterChoices: {
          'mike': [
            {
              id: 'choice-1a',
              text: 'Organize a secret search party with the boys',
              impact: 'independent action'
            }
          ]
        }
      }
    ],
    difficulty: 'intermediate',
    maxPlayers: 4,
    estimatedPlayTime: '60-75 minutes'
  },

  'bridge-to-terabithia': {
    id: 'bridge-to-terabithia',
    title: 'Bridge to Terabithia',
    description: 'Explore the magical kingdom of Terabithia and the power of friendship and imagination.',
    poster: '/images/moviePosters/Bridge to Terabithia.jpg',
    genre: ['Drama', 'Family', 'Fantasy'],
    characters: [
      {
        id: 'jess',
        name: 'Jess Aarons',
        description: 'A creative boy who dreams of being the fastest runner in school',
        personality: 'artistic, sensitive, competitive, loyal',
        traits: ['Creative', 'Artistic', 'Loyal']
      },
      {
        id: 'leslie',
        name: 'Leslie Burke',
        description: 'An imaginative girl who becomes Jess\'s best friend and co-ruler of Terabithia',
        personality: 'imaginative, fearless, kind, adventurous',
        traits: ['Imaginative', 'Fearless', 'Kind']
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint-1',
        position: 1,
        title: 'Meeting Leslie',
        context: 'Jess meets the new girl Leslie Burke who beats him in the race',
        characterChoices: {
          'jess': [
            {
              id: 'choice-1a',
              text: 'Accept defeat gracefully and befriend Leslie',
              impact: 'friendship building'
            },
            {
              id: 'choice-1b',
              text: 'Feel embarrassed and avoid Leslie',
              impact: 'missed opportunity'
            }
          ]
        }
      }
    ],
    difficulty: 'beginner',
    maxPlayers: 4,
    estimatedPlayTime: '45-60 minutes'
  },

  'diary-of-wimpy-kid': {
    id: 'diary-of-wimpy-kid',
    title: 'Diary of a Wimpy Kid',
    description: 'Navigate the challenges of middle school with Greg Heffley in this comedic adventure.',
    poster: '/images/moviePosters/Diary of a Wimpy Kid.jpg',
    genre: ['Comedy', 'Family', 'Adventure'],
    characters: [
      {
        id: 'greg',
        name: 'Greg Heffley',
        description: 'A middle school student trying to survive the social hierarchy',
        personality: 'scheming, self-centered, funny, relatable',
        traits: ['Scheming', 'Funny', 'Ambitious']
      },
      {
        id: 'rowley',
        name: 'Rowley Jefferson',
        description: 'Greg\'s innocent and loyal best friend',
        personality: 'naive, loyal, kind-hearted, optimistic',
        traits: ['Innocent', 'Loyal', 'Optimistic']
      }
    ],
    checkpoints: [
      {
        id: 'checkpoint-1',
        position: 1,
        title: 'First Day of Middle School',
        context: 'Greg starts middle school and wants to become popular',
        characterChoices: {
          'greg': [
            {
              id: 'choice-1a',
              text: 'Try to sit with the popular kids at lunch',
              impact: 'social climbing'
            },
            {
              id: 'choice-1b',
              text: 'Stick with Rowley and be content',
              impact: 'friendship loyalty'
            }
          ]
        }
      }
    ],
    difficulty: 'beginner',
    maxPlayers: 4,
    estimatedPlayTime: '30-45 minutes'
  }
};

/**
 * Get a specific movie by ID (client-side)
 * @param {string} movieId - The movie ID
 * @returns {Promise<Object|null>} Movie object or null if not found
 */
export async function getMovieByIdClient(movieId) {
  try {
    const movie = movieData[movieId];
    return movie || null;
  } catch (error) {
    console.error(`Error loading movie ${movieId}:`, error);
    return null;
  }
}

/**
 * Get all available movies (client-side)
 * @returns {Promise<Array>} Array of movie objects
 */
export async function getAllMoviesClient() {
  try {
    return Object.values(movieData);
  } catch (error) {
    console.error('Error loading movies:', error);
    return [];
  }
}