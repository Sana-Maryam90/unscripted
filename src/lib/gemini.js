// Gemini API client configuration
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

export function getGeminiClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return genAI;
}

/**
 * Randomly selects a scene from harryPotter.json using Gemini API
 * @param {Object} movieData - The movie data containing scenes
 * @returns {Promise<Object>} Selected scene with enhanced description
 */
export async function selectRandomScene(movieData) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Randomly select a scene
    const randomIndex = Math.floor(Math.random() * movieData.scenes.length);
    const selectedScene = movieData.scenes[randomIndex];

    const prompt = `
You are a storytelling assistant. I will provide you with a scene from Harry Potter, and you need to describe it exactly as it appears in the original source material, maintaining the authentic tone and details.

Scene: ${selectedScene.title}
Context: ${selectedScene.context}

Please provide a detailed description of this scene exactly as it would appear in the original Harry Potter story. Keep the description faithful to the source material, maintaining the magical atmosphere and specific details from the books/movies. The description should be 2-3 paragraphs long and capture the essence of the original scene.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedDescription = response.text();

    return {
      ...selectedScene,
      enhancedDescription,
      originalContext: selectedScene.context
    };
  } catch (error) {
    console.error('Error selecting random scene with Gemini:', error);
    
    // Fallback: return a random scene without enhancement
    const randomIndex = Math.floor(Math.random() * movieData.scenes.length);
    const fallbackScene = movieData.scenes[randomIndex];
    
    return {
      ...fallbackScene,
      enhancedDescription: fallbackScene.context,
      originalContext: fallbackScene.context,
      fallback: true
    };
  }
}

/**
 * Generates base content that describes scenes exactly as written in source material
 * @param {Object} scene - The selected scene
 * @param {Array} characters - Available characters
 * @returns {Promise<string>} Base content description
 */
export async function generateBaseContent(scene, characters) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are creating the opening content for an interactive Harry Potter storytelling game. 

Scene: ${scene.title}
Context: ${scene.context}
Available Characters: ${Array.isArray(characters) ? 
      (typeof characters[0] === 'string' ? characters.join(', ') : characters.map(c => c.name).join(', '))
      : 'Unknown'}

Create the base content that describes this scene exactly as it appears in the original Harry Potter story. This will be the starting point for players to make choices from their character's perspective.

CRITICAL REQUIREMENTS:
- Write EXACTLY ONE PARAGRAPH describing the context as it is in the original movies
- Keep it concise but descriptive (approximately 100-150 words)
- Describe the scene exactly as written in the source material
- Maintain the authentic Harry Potter tone and atmosphere
- Include specific details that make the scene recognizable
- Set up the scene so players can make meaningful character-based choices
- Do not include any choices or questions - this is just the scene description
- Write in present tense as if the scene is unfolding now

The base content should be just a paragraph describing the context exactly as it is in the original movies, not a lengthy exposition.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating base content:', error);
    
    // Fallback content - keep it concise
    return `${scene.context} The scene unfolds exactly as in the original story, setting the stage for the characters to make their choices.`;
  }
}

/**
 * Validates generated content for appropriateness and coherence
 * @param {string} content - The generated content to validate
 * @param {Object} context - Context for validation
 * @returns {Object} Validation result with isValid flag and issues
 */
export function validateContent(content, context = {}) {
  const issues = [];
  
  // Check for minimum length
  if (content.length < 50) {
    issues.push('Content too short');
  }
  
  // Check for maximum length
  if (content.length > 2000) {
    issues.push('Content too long');
  }
  
  // Check for inappropriate content (basic filtering)
  const inappropriateWords = ['violence', 'explicit', 'inappropriate'];
  const hasInappropriate = inappropriateWords.some(word => 
    content.toLowerCase().includes(word)
  );
  
  if (hasInappropriate) {
    issues.push('Contains potentially inappropriate content');
  }
  
  // Check for coherence (basic check for complete sentences)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) {
    issues.push('Content lacks sufficient detail');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    content
  };
}

/**
 * Generates character-specific choices for the current story context with enhanced context reading
 * @param {Object} context - Story context including scene, character, and previous choices
 * @param {string} character - The character making the choice
 * @returns {Promise<Array>} Array of character-specific choice objects
 */
export async function generateCharacterChoices(context, character) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Enhanced context reading - build comprehensive story understanding
    const recentEventsText = context.recentEvents && context.recentEvents.length > 0 
      ? context.recentEvents.map(event => `${event.character} ${event.action}: ${event.result}`).join('\n')
      : 'No recent events';

    const characterDevelopmentText = context.characterDevelopment && context.characterDevelopment.choicesMade
      ? context.characterDevelopment.choicesMade.slice(-3).map(choice => 
          `Previously chose: ${choice.choice} (${choice.reasoning})`
        ).join('\n')
      : 'No previous character choices';

    const narrativeContextText = context.narrativeContinuity 
      ? `Current tone: ${context.narrativeContinuity.currentTone}. Recent narrative: ${context.narrativeContinuity.previousSegmentSummary}`
      : 'No narrative context';

    // Add unique context identifiers to prevent repetitive choices
    const contextHash = generateContextHash(context, character);
    const turnSpecificContext = `Turn ${context.turnCount || 1} - Context ID: ${contextHash}`;
    
    // Build world state context for better continuity
    const worldStateText = context.worldState && Object.keys(context.worldState).length > 0
      ? Object.entries(context.worldState).map(([key, value]) => `${key}: ${value}`).join('\n')
      : 'No specific world changes recorded';

    // Enhanced story progression context
    const storyProgressionText = context.choiceHistory && context.choiceHistory.length > 0
      ? `Story has progressed through ${context.choiceHistory.length} choices. Latest developments: ${context.choiceHistory.slice(-2).map(h => h.outcome.substring(0, 80)).join(' ')}`
      : 'This is the beginning of the story';

    const prompt = `
You are creating character-specific choices for an interactive Harry Potter storytelling game.

CONTEXT READING AND ANALYSIS:
${turnSpecificContext}
Current Scene Analysis: ${context.scene?.title || 'Unknown Scene'} - ${context.scene?.context || context.sceneDescription || 'No context provided'}
Story Progression: ${storyProgressionText}

CHARACTER: ${character}

COMPREHENSIVE STORY CONTEXT:
Turn Number: ${context.turnCount || 0}
${narrativeContextText}

WORLD STATE CHANGES:
${worldStateText}

RECENT STORY EVENTS:
${recentEventsText}

CHARACTER'S DEVELOPMENT HISTORY:
${characterDevelopmentText}

COMPLETE CHOICE HISTORY FOR CONTEXT:
${context.choiceHistory && context.choiceHistory.length > 0 
  ? context.choiceHistory.slice(-5).map(h => `Turn ${h.turnNumber}: ${h.character} chose "${h.choice.text || h.choice}" - Result: ${h.outcome.substring(0, 120)}...`).join('\n')
  : 'This is the beginning of the story'}

CRITICAL: Read the full context above carefully before generating choices. Each choice must be COMPLETELY UNIQUE to this specific moment and context.

Generate 3 EXTREMELY SPECIFIC and CONTEXTUAL choices that ${character} could make in this exact situation. These choices MUST be:

1. ULTRA-SPECIFIC to the current context and situation (NEVER use generic phrases like "act bravely", "think clearly", "do the right thing", "be cautious", "help friends", "use magic", "step forward boldly", "observe carefully", "seek guidance", "explore", "investigate", "examine", "consider", "reflect", "prepare")
2. Reference SPECIFIC objects, spells, locations, people, or magical items mentioned in the current scene context
3. True to ${character}'s personality, knowledge, and magical abilities from the Harry Potter series
4. Contextually relevant to what's happening RIGHT NOW in the scene - not general actions
5. Based on the character's specific knowledge and abilities at this point in the story
6. Each choice must lead to distinctly different story outcomes
7. Include specific dialogue, spell names, character interactions, or physical actions with scene elements
8. MUST reference specific elements from the scene description provided above
9. Each choice should be a complete action that ${character} would realistically take in this specific moment
10. WRITE ALL CHOICES IN FIRST PERSON - use "I" instead of third person references
11. AVOID any generic action words like "explore", "investigate", "examine", "consider", "reflect", "prepare", "observe", "seek", "help", "use", "act", "think", "be"
12. Each choice must be a SPECIFIC ACTION with SPECIFIC OBJECTS/SPELLS/PEOPLE mentioned by name
13. NEVER repeat choices from previous turns - each choice must be completely new and unique
14. Build upon the story progression and character development shown above

CRITICAL REQUIREMENTS:
- Each choice MUST reference specific elements from the current scene context (objects, people, locations mentioned above)
- NO generic choices allowed - every choice must be unique to this exact situation and would NOT make sense in any other scene
- Include specific spell names, character names, object names, or location details when relevant
- Make choices that only make sense in this specific context, not in any other scene
- ALL CHOICES MUST BE IN FIRST PERSON (use "I will...", "I cast...", "I grab...", etc.)
- Each choice must reference AT LEAST ONE specific element from the scene description above
- If the scene mentions specific objects, spells, characters, or locations, the choices MUST incorporate these elements
- Choices should feel like they could ONLY happen in this exact scene with these exact circumstances

Format your response as a JSON array with this structure (NO IMPACT FIELD):
[
  {
    "id": "choice-1",
    "text": "Highly specific action referencing current scene elements",
    "reasoning": "Why this specific choice fits the character and exact current context"
  },
  {
    "id": "choice-2", 
    "text": "Another highly specific action with scene references",
    "reasoning": "Character motivation for this specific action in this context"
  },
  {
    "id": "choice-3",
    "text": "Third highly specific contextual action", 
    "reasoning": "Character justification for this particular action now"
  }
]

Examples of EXCELLENT context-specific choices (IN FIRST PERSON):
- "I cast a Protean Charm on the coins to communicate with the others"
- "I sneak through the secret passage behind the portrait of the Fat Lady"
- "I use the Marauder's Map to check for approaching teachers in the corridor"
- "I whisper 'Mischief Managed' to hide the map from Snape's approaching footsteps"
- "I pull out the Invisibility Cloak and hide behind the statue of Gregory the Smarmy"
- "I cast 'Alohomora' on the locked door to Professor McGonagall's office"
- "I grab the Time-Turner from Hermione's bag and turn it three times"
- "I throw Dungbombs down the corridor to create a distraction"
- "I use 'Expelliarmus' to disarm Malfoy before he can cast his spell"
- "I climb through the portrait hole while the Fat Lady is singing"

Examples of TERRIBLE choices (NEVER USE THESE):
- "Act bravely" - TOO GENERIC
- "Think carefully about the situation" - TOO GENERIC
- "Do the right thing" - TOO GENERIC
- "Be cautious" - TOO GENERIC
- "Help friends" - TOO GENERIC
- "Use magic" - TOO GENERIC
- "Make a wise decision" - TOO GENERIC
- "Stay calm" - TOO GENERIC
- "Be clever" - TOO GENERIC
- "Explore the area" - TOO GENERIC
- "Investigate further" - TOO GENERIC
- "Examine the surroundings" - TOO GENERIC
- "Consider my options" - TOO GENERIC
- "Reflect on the situation" - TOO GENERIC
- "Prepare for what's ahead" - TOO GENERIC
- "Observe carefully" - TOO GENERIC
- "Seek guidance" - TOO GENERIC
- "Continue forward" - TOO GENERIC
- "Look around" - TOO GENERIC

REMEMBER: Each choice must be specific to the current scene context and reference actual elements from the situation described.

Respond only with the JSON array, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let choicesText = response.text().trim();
    
    // Clean up the response to ensure it's valid JSON
    if (choicesText.startsWith('```json')) {
      choicesText = choicesText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const choices = JSON.parse(choicesText);
      
      // Validate the choices structure
      if (!Array.isArray(choices) || choices.length !== 3) {
        throw new Error('Invalid choices format');
      }
      
      // Validate each choice has required fields (impact field removed as per task requirements)
      const validatedChoices = choices.map((choice, index) => ({
        id: choice.id || `choice-${index + 1}`,
        text: choice.text || `Choice ${index + 1}`,
        reasoning: choice.reasoning || 'Character-based decision',
        character
      }));
      
      return validatedChoices;
    } catch (parseError) {
      console.error('Error parsing choices JSON:', parseError);
      throw new Error('Failed to parse generated choices');
    }
  } catch (error) {
    console.error('Error generating character choices:', error);
    
    // Fallback choices based on character
    return generateFallbackChoices(character, context);
  }
}

/**
 * Generates a unique context hash to prevent repetitive AI responses
 * @param {Object} context - Story context
 * @param {string} character - Character name
 * @returns {string} Unique context identifier
 */
function generateContextHash(context, character) {
  const contextString = JSON.stringify({
    scene: context.scene?.title,
    character,
    turnCount: context.turnCount,
    recentChoices: context.choiceHistory?.slice(-2).map(h => h.choice.text || h.choice),
    narrativeTone: context.narrativeContinuity?.currentTone,
    timestamp: Date.now()
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < contextString.length; i++) {
    const char = contextString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries + 1} attempts failed:`, error.message);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Generates fallback choices when API fails
 * @param {string} character - The character name
 * @param {Object} context - Story context
 * @returns {Array} Fallback choice objects
 */
function generateFallbackChoices(character, context) {
  const sceneContext = context?.scene?.context || context?.sceneDescription || '';
  
  const characterChoices = {
    'Harry Potter': [
      { id: 'choice-1', text: 'I draw my wand and cast "Expelliarmus" at the nearest threat', reasoning: 'Harry\'s instinct to disarm opponents' },
      { id: 'choice-2', text: 'I pull out the Invisibility Cloak and hide behind the nearest pillar', reasoning: 'Harry\'s resourcefulness with inherited items' },
      { id: 'choice-3', text: 'I call out "Hedwig!" to summon help from above', reasoning: 'Harry\'s bond with his owl companion' }
    ],
    'Hermione Granger': [
      { id: 'choice-1', text: 'I cast "Protego" while backing toward the library entrance', reasoning: 'Hermione\'s defensive spell expertise' },
      { id: 'choice-2', text: 'I quickly flip through "Hogwarts: A History" for relevant information', reasoning: 'Hermione\'s scholarly approach to problems' },
      { id: 'choice-3', text: 'I whisper "Lumos Maxima" to illuminate hidden details in the shadows', reasoning: 'Hermione\'s methodical investigation skills' }
    ],
    'Ron Weasley': [
      { id: 'choice-1', text: 'I grab a Chocolate Frog from my pocket and throw it as a distraction', reasoning: 'Ron\'s improvised problem-solving' },
      { id: 'choice-2', text: 'I shout "Bloody hell!" and charge forward with my wand raised', reasoning: 'Ron\'s direct confrontational approach' },
      { id: 'choice-3', text: 'I pull out the Deluminator and plunge the area into darkness', reasoning: 'Ron\'s use of inherited magical items' }
    ]
  };
  
  const defaultChoices = [
    { id: 'choice-1', text: 'I cast "Alohomora" on the nearest locked door to find an escape route', reasoning: 'Basic unlocking spell for tactical retreat' },
    { id: 'choice-2', text: 'I grab a nearby magical portrait and ask it for directions', reasoning: 'Using Hogwarts\' living artwork for guidance' },
    { id: 'choice-3', text: 'I light my wand tip and examine the ancient runes carved into the stone wall', reasoning: 'Investigating magical inscriptions for clues' }
  ];
  
  const choices = characterChoices[character] || defaultChoices;
  return choices.map(choice => ({ ...choice, character, fallback: true }));
}

/**
 * Generates detailed quiz questions about a specific movie using AI
 * @param {string} movieId - The movie ID
 * @param {Object} movieData - The movie data object
 * @returns {Promise<Array>} Array of 20 detailed quiz questions
 */
export async function generateBuzzerQuizQuestions(movieId, movieData) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const movieTitle = movieData?.title || 'Unknown Movie';
    const movieDescription = movieData?.description || '';
    const characters = movieData?.characters || [];
    const scenes = movieData?.scenes || [];

    const prompt = `
Generate exactly 20 detailed quiz questions about "${movieTitle}" for a competitive buzzer quiz game.

Movie Information:
- Title: ${movieTitle}
- Description: ${movieDescription}
- Characters: ${characters.map(c => `${c.name} - ${c.description}`).join(', ')}
- Key Scenes: ${scenes.slice(0, 5).map(s => `${s.title}: ${s.context}`).join('; ')}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 20 questions - no more, no less
2. Questions must be VERY DETAILED and require DEEP knowledge of the movie
3. Questions should NOT be obvious or general - they must require specific knowledge about:
   - Specific dialogue lines and quotes
   - Minor character names and details
   - Specific locations and settings within the movie
   - Plot details that casual viewers might miss
   - Behind-the-scenes information (cast, crew, production details)
   - Specific magical spells, objects, or creatures (if applicable)
   - Chronological order of events
   - Character relationships and motivations
   - Specific numbers, dates, or measurements mentioned
   - Visual details from specific scenes

4. Each question must have exactly 4 multiple choice options (A, B, C, D)
5. Questions should be challenging enough that only true fans would know the answers
6. Avoid questions that can be answered with basic plot knowledge
7. Include questions about supporting characters, not just main characters
8. Include questions about specific scenes, locations, and dialogue
9. Make questions that would stump casual viewers but reward dedicated fans

Format your response as a JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Detailed, specific question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  },
  {
    "id": 2,
    "question": "Another detailed, specific question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 1
  }
]

Examples of GOOD detailed questions:
- "What specific incantation does Hermione use to unlock the door in the third-floor corridor?"
- "What is the exact wording of the riddle that guards the Philosopher's Stone?"
- "Which specific Quidditch position does Oliver Wood play for Gryffindor?"
- "What is the name of the three-headed dog guarding the trapdoor?"
- "In what specific location does Harry first meet Draco Malfoy before Hogwarts?"

Examples of BAD general questions (DO NOT USE):
- "Who is the main character?" (too obvious)
- "What school does Harry attend?" (too general)
- "Who is the villain?" (too basic)

Generate exactly 20 questions that would challenge even dedicated fans of ${movieTitle}.

Respond only with the JSON array, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questionsText = response.text().trim();

    // Clean up the response to ensure it's valid JSON
    if (questionsText.startsWith('```json')) {
      questionsText = questionsText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }

    const questions = JSON.parse(questionsText);

    // Validate the questions
    if (!Array.isArray(questions) || questions.length !== 20) {
      throw new Error(`Expected exactly 20 questions, got ${questions.length}`);
    }

    // Validate each question structure
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number') {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      if (q.correct < 0 || q.correct > 3) {
        throw new Error(`Invalid correct answer index at question ${index + 1}`);
      }
    });

    console.log(`✅ Generated ${questions.length} detailed quiz questions for ${movieTitle}`);
    return questions;

  } catch (error) {
    console.error('Error generating buzzer quiz questions:', error);
    throw error; // Re-throw to let caller handle fallback
  }
}

/**
 * Validates character choices for coherence and appropriateness
 * @param {Array} choices - Array of choice objects to validate
 * @param {string} character - Character name
 * @param {Object} context - Story context
 * @returns {Object} Validation result
 */
export function validateCharacterChoices(choices, character, context) {
  const issues = [];
  
  // Check if we have the right number of choices
  if (!Array.isArray(choices) || choices.length !== 3) {
    issues.push('Must have exactly 3 choices');
  }
  
  // Check each choice structure
  choices.forEach((choice, index) => {
    if (!choice.text || choice.text.length < 10) {
      issues.push(`Choice ${index + 1} text too short or missing`);
    }
    
    if (!choice.reasoning) {
      issues.push(`Choice ${index + 1} missing reasoning`);
    }
    
    // Impact field removed as per task requirements
    
    // Check for generic choices - comprehensive list
    const genericPhrases = [
      'act bravely', 'think clearly', 'do the right thing', 'be careful', 'be cautious',
      'help friends', 'use magic', 'make a wise decision', 'stay calm', 'be clever',
      'think about it', 'consider options', 'be smart', 'act wisely', 'do what\'s best',
      'be heroic', 'show courage', 'be strategic', 'use wisdom', 'be thoughtful',
      'explore the', 'investigate', 'examine the surroundings', 'examine the area', 'consider my', 'reflect on',
      'prepare for', 'observe', 'seek guidance', 'continue forward', 'look around',
      'move forward', 'step back', 'take a moment', 'pause to', 'decide to',
      'choose to', 'try to', 'attempt to', 'plan to', 'hope to'
    ];
    const isGeneric = genericPhrases.some(phrase => 
      choice.text.toLowerCase().includes(phrase)
    );
    
    if (isGeneric) {
      issues.push(`Choice ${index + 1} is too generic - must be context-specific`);
    }
    
    // Check for specific context elements (spells, objects, locations)
    const hasSpell = /\b[A-Z][a-z]*o\b/.test(choice.text) || /"[^"]*"/.test(choice.text); // Spell names or quoted spells
    const hasSpecificObject = /\b(wand|cloak|map|door|portrait|rune|stone|wall|book|potion|inscriptions|tapestry|statue|corridor|stairs|room|chamber|passage|tower|dungeon)\b/i.test(choice.text);
    const hasCharacterName = /\b(Harry|Hermione|Ron|Dumbledore|Snape|McGonagall|Hagrid|Voldemort|Malfoy)\b/i.test(choice.text);
    const hasLocationName = /\b(Hogwarts|Gryffindor|Slytherin|Hufflepuff|Ravenclaw|Diagon|Hogsmeade|Forbidden|Great Hall|Library|Potions|Transfiguration)\b/i.test(choice.text);
    
    const hasSpecificElements = hasSpell || hasSpecificObject || hasCharacterName || hasLocationName;
    
    if (!hasSpecificElements && choice.text.length > 20) {
      issues.push(`Choice ${index + 1} lacks specific contextual elements (spells, objects, characters, or locations)`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    choices
  };
}

/**
 * Processes a player choice and generates the next narrative segment
 * @param {Object} choiceContext - Context including choice, character, and story state
 * @returns {Promise<Object>} Generated story segment with continuation
 */
export async function processChoiceAndGenerateSegment(choiceContext) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { 
      choice, 
      character, 
      scene, 
      previousSegments, 
      turnCount,
      storyContext,
      narrativeContinuity,
      characterDevelopment,
      choiceHistory,
      recentNarrative
    } = choiceContext;

    // Build enhanced context for better continuity
    const characterHistoryText = characterDevelopment && characterDevelopment.choicesMade
      ? characterDevelopment.choicesMade.slice(-3).map(c => 
          `Previously: ${c.choice} (${c.reasoning})`
        ).join('\n')
      : 'No previous character choices';

    const keyEventsText = storyContext && storyContext.keyEvents
      ? storyContext.keyEvents.slice(-3).map(event => 
          `Turn ${event.turnNumber}: ${event.character} - ${event.event} (${event.reasoning})`
        ).join('\n')
      : 'No key events recorded';

    const recentChoicesText = choiceHistory && choiceHistory.length > 0
      ? choiceHistory.slice(-3).map(h => 
          `Turn ${h.turnNumber}: ${h.character} chose "${h.choice}" - Result: ${h.outcome.substring(0, 100)}...`
        ).join('\n')
      : 'This is the beginning of the story';

    const prompt = `
You are continuing an interactive Harry Potter story. A player has made a choice, and you need to generate the next narrative segment that maintains perfect continuity with the story so far.

CURRENT SCENE:
Title: ${scene?.title || 'Unknown Scene'}
Context: ${scene?.context || 'No context'}

CHARACTER & CHOICE:
Character: ${character}
Choice Made: ${choice.text}
Choice Reasoning: ${choice.reasoning}

STORY PROGRESSION:
Turn Count: ${turnCount || 1}
Current Narrative Tone: ${narrativeContinuity?.currentTone || 'neutral'}
Recent Narrative Context: ${recentNarrative || 'No recent context'}

CHARACTER DEVELOPMENT:
${characterHistoryText}

RECENT STORY EVENTS:
${recentChoicesText}

KEY STORY MOMENTS:
${keyEventsText}

PREVIOUS STORY SEGMENTS:
${previousSegments ? previousSegments.slice(-2).map((seg, i) => `Recent Segment ${i + 1}: ${seg.content}`).join('\n\n') : 'This is the first choice in the story.'}

Generate the next story segment that:
1. Shows the immediate consequences of ${character}'s choice: "${choice.text}"
2. Builds directly on the recent narrative context and maintains perfect continuity
3. Reflects the character's development and previous choices
4. Advances the plot meaningfully while staying true to Harry Potter lore
5. Contains AT LEAST 3-4 full paragraphs of professionally written text (MINIMUM 400 words, TARGET 500-600 words)
6. Sets up the situation for the next player's choice
7. Maintains the current narrative tone: ${narrativeContinuity?.currentTone || 'neutral'}
8. Includes vivid descriptions, character reactions, dialogue, and environmental details
9. Keeps the magical atmosphere of the Harry Potter universe
10. References or builds upon recent key events when relevant
11. Include specific magical effects, character emotions, and detailed scene descriptions
12. Show how other characters react to the choice made
13. Describe the magical environment and atmosphere in detail

CRITICAL LENGTH AND QUALITY REQUIREMENTS:
- Write AT LEAST 400 words (3-4 full paragraphs minimum) - THIS IS MANDATORY
- NEVER write just 2-3 sentences - this must be substantial story content
- Include dialogue from characters when appropriate (use proper quotation marks)
- Describe magical effects, sounds, sights, and atmosphere in rich detail
- Show character emotions and reactions in depth
- Build tension or resolution as appropriate to the story
- Make the reader feel completely immersed in the magical world
- Include sensory details (what characters see, hear, feel, smell)
- Show the ripple effects of the choice on the environment and other characters
- Create a sense of progression and momentum in the story

WRITING STYLE REQUIREMENTS:
- Write in present tense, third person
- Use rich, descriptive language worthy of the Harry Potter universe
- Include specific magical terminology and references
- Show consequences through action and dialogue rather than just telling
- Create vivid scenes that readers can visualize clearly
- Build emotional connection with the characters
- Maintain the wonder and magic of the wizarding world

The segment should be engaging, detailed, and move the story forward significantly while maintaining perfect continuity with what came before. Each story segment must be substantial enough to feel like meaningful progression - think of it as a full scene from a Harry Potter book, not just a brief summary.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Validate content length - ensure substantial content
    if (content.length < 400) {
      throw new Error('Generated content too short - must be at least 400 characters');
    }
    
    if (content.length > 3000) {
      throw new Error('Generated content too long - must be under 3000 characters');
    }

    return {
      content,
      character,
      choice: choice.text,
      choiceReasoning: choice.reasoning,
      turnCount,
      timestamp: new Date().toISOString(),
      wordCount: content.split(' ').length,
      // Enhanced context for future reference
      contextUsed: {
        previousTone: narrativeContinuity?.currentTone,
        characterHistory: characterDevelopment?.choicesMade?.length || 0,
        keyEventsReferenced: storyContext?.keyEvents?.length || 0
      }
    };
  } catch (error) {
    console.error('Error processing choice and generating segment:', error);
    
    // Fallback content - ensure it's substantial
    return {
      content: `${choiceContext.character} ${choice.text}. The decision ripples through the magical world around them, setting new events in motion that will reshape the very fabric of their adventure. The consequences of this choice become immediately apparent as the magical atmosphere shifts dramatically around the characters, causing ancient enchantments to stir and respond to their actions with unprecedented intensity.

The air itself seems to crackle with newfound possibility, and magical energy swirls visibly around them like golden threads of light, weaving patterns that speak of destiny and change. The very walls of Hogwarts seem to pulse with ancient magic, responding to the weight of the decision that has just been made. Torches flicker in their sconces, casting dancing shadows that seem to whisper secrets of what is to come.

Other characters in the scene react with a mixture of surprise, concern, and admiration, their faces reflecting the gravity of what has just transpired. Some step forward in support, their eyes bright with determination and loyalty, while others hesitate at the threshold of uncertainty, unsure of what this bold choice might bring to their shared journey. The magical portraits on the walls lean forward with keen interest, their painted eyes following every movement as if they too understand that something truly significant has just occurred.

The magical world responds to their agency with remarkable sensitivity, creating opportunities for further choices and developments that will undoubtedly shape the ultimate outcome of their journey through this reimagined tale. Ancient spells seem to awaken in response to their actions, and the very stones of the castle appear to shift subtly, as if rearranging themselves to accommodate the new path that has been chosen. The story continues to unfold with renewed energy and purpose, the ramifications of this decision leading the characters deeper into their adventure, opening new paths while closing others, and setting the stage for even greater challenges and discoveries that lie ahead in the magical world that surrounds them.`,
      character: choiceContext.character,
      choice: choice.text,
      choiceReasoning: choice.reasoning || 'Character decision',
      turnCount: choiceContext.turnCount || 1,
      timestamp: new Date().toISOString(),
      fallback: true,
      wordCount: 320,
      contextUsed: {
        previousTone: 'neutral',
        characterHistory: 0,
        keyEventsReferenced: 0
      }
    };
  }
}

/**
 * Manages the story cycle for 4-5 choice iterations with improved completion detection
 * @param {Object} storyState - Current story state
 * @returns {Object} Updated story state with cycle management
 */
export function manageStoryCycle(storyState) {
  const maxTurns = 5;
  const currentTurn = storyState.turnCount || 1;
  
  // Enhanced completion detection
  const shouldContinue = currentTurn < maxTurns && !storyState.forceComplete;
  
  // Determine next phase based on story progression
  let nextPhase = 'choice-generation';
  if (currentTurn >= maxTurns || storyState.forceComplete) {
    nextPhase = 'story-completion';
  } else if (currentTurn >= 4) {
    nextPhase = 'building-conclusion';
  } else if (currentTurn >= 3) {
    nextPhase = 'building-climax';
  } else if (currentTurn >= 2) {
    nextPhase = 'developing-conflict';
  }
  
  // Check for natural story completion points
  const hasNaturalEnding = checkForNaturalEnding(storyState);
  
  return {
    ...storyState,
    shouldContinue: shouldContinue && !hasNaturalEnding,
    nextPhase,
    turnsRemaining: Math.max(0, maxTurns - currentTurn),
    progressPercentage: Math.min(100, (currentTurn / maxTurns) * 100),
    hasNaturalEnding,
    storyIntensity: calculateStoryIntensity(storyState)
  };
}

/**
 * Checks for natural story ending points based on content analysis
 * @param {Object} storyState - Current story state
 * @returns {boolean} Whether story has reached a natural ending
 */
function checkForNaturalEnding(storyState) {
  if (!storyState.segments || storyState.segments.length === 0) {
    return false;
  }
  
  const recentSegments = storyState.segments.slice(-2);
  const recentContent = recentSegments.map(seg => seg.content).join(' ').toLowerCase();
  
  // Check for resolution keywords
  const resolutionKeywords = [
    'resolved', 'concluded', 'ended', 'finished', 'completed', 'victory', 'defeated',
    'peace', 'safe', 'home', 'celebration', 'triumph', 'success', 'accomplished'
  ];
  
  const hasResolution = resolutionKeywords.some(keyword => recentContent.includes(keyword));
  
  // Check story length and complexity
  const hasSubstantialContent = storyState.segments.length >= 3 && 
                               storyState.turnCount >= 3;
  
  return hasResolution && hasSubstantialContent;
}

/**
 * Calculates story intensity for better pacing
 * @param {Object} storyState - Current story state
 * @returns {string} Story intensity level
 */
function calculateStoryIntensity(storyState) {
  const turnCount = storyState.turnCount || 1;
  
  if (turnCount >= 4) return 'climactic';
  if (turnCount >= 3) return 'high';
  if (turnCount >= 2) return 'building';
  return 'introductory';
}

/**
 * Detects if the story should be completed and generates natural conclusion
 * @param {Object} storyState - Current story state
 * @returns {Promise<Object>} Story completion result
 */
export async function detectAndCompleteStory(storyState) {
  const { turnCount, segments, scene, characters } = storyState;
  
  // Check completion conditions
  const shouldComplete = turnCount >= 5 || 
                        (segments && segments.length >= 4) ||
                        storyState.forceComplete;
  
  if (!shouldComplete) {
    return {
      isComplete: false,
      storyState
    };
  }
  
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const storySegmentsText = segments ? 
      segments.map((seg, i) => `Turn ${i + 1} (${seg.character}): ${seg.content}`).join('\n\n') :
      'No previous segments available.';

    const prompt = `
You are concluding an interactive Harry Potter story. The players have made their choices, and now you need to create a satisfying conclusion.

Original Scene: ${scene?.title || 'Unknown Scene'}
Scene Context: ${scene?.context || 'No context'}
Characters Involved: ${characters ? 
      (Array.isArray(characters) && typeof characters[0] === 'string' ? characters.join(', ') : 
       Array.isArray(characters) ? characters.map(c => c.name || c).join(', ') : characters) 
      : 'Unknown characters'}
Number of Turns Completed: ${turnCount}

Story So Far:
${storySegmentsText}

Create a natural, satisfying conclusion to this story that:
1. Resolves the main conflict or situation from the original scene
2. Shows the consequences of all the players' choices
3. Maintains the magical atmosphere of Harry Potter
4. Provides closure while staying true to the characters
5. Is at least 200 words long
6. Feels like a proper ending, not an abrupt stop
7. Celebrates the collaborative storytelling experience

Write in present tense, third person. Make it feel like a proper conclusion to a Harry Potter adventure.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const conclusion = response.text();

    return {
      isComplete: true,
      conclusion,
      storyState: {
        ...storyState,
        isComplete: true,
        completedAt: new Date().toISOString(),
        finalWordCount: conclusion.split(' ').length
      }
    };
  } catch (error) {
    console.error('Error generating story conclusion:', error);
    
    // Fallback conclusion
    const fallbackConclusion = `The adventure comes to an end as the characters reflect on their choices and the magical journey they've shared. Through their decisions, they've created a unique story that will be remembered. The magic of Hogwarts continues, and new adventures await those brave enough to seek them.`;
    
    return {
      isComplete: true,
      conclusion: fallbackConclusion,
      storyState: {
        ...storyState,
        isComplete: true,
        completedAt: new Date().toISOString(),
        fallback: true
      }
    };
  }
}

/**
 * Generates detailed image descriptions using Gemini for scene visualization
 * @param {string} sceneDescription - Description of the scene to visualize
 * @param {string} style - Art style (default: 'pixel art')
 * @returns {Promise<Object>} Generated image description and mock image data
 */
export async function generateSceneImageDescription(sceneDescription, style = 'pixel art') {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert art director creating detailed visual descriptions for a Harry Potter storytelling game.

Scene Description: ${sceneDescription}
Art Style: ${style}

Create a detailed visual description that could be used to generate an image. The description should:

1. Be specific and vivid, including colors, lighting, composition
2. Follow the ${style} aesthetic appropriate for the Harry Potter universe
3. Include magical elements and atmosphere
4. Be appropriate for general audiences
5. Specify character positions, expressions, and actions if characters are present
6. Include environmental details like setting, weather, magical effects
7. Be detailed enough for an artist to create the image

Format your response as a JSON object with this structure:
{
  "description": "Detailed visual description for image generation",
  "style": "${style}",
  "elements": ["key visual element 1", "key visual element 2", "key visual element 3"],
  "mood": "overall mood/atmosphere",
  "colors": ["primary color", "secondary color", "accent color"],
  "composition": "description of how elements are arranged"
}

Focus on creating a magical, engaging visual that captures the essence of the Harry Potter world in ${style} style.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let descriptionText = response.text().trim();
    
    // Clean up the response to ensure it's valid JSON
    if (descriptionText.startsWith('```json')) {
      descriptionText = descriptionText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const imageDescription = JSON.parse(descriptionText);
      
      // Generate a mock image URL for testing purposes
      // In a real implementation, this would be sent to an image generation service
      const mockImageUrl = generateMockImageUrl(imageDescription);
      
      return {
        description: imageDescription.description,
        style: imageDescription.style || style,
        elements: imageDescription.elements || [],
        mood: imageDescription.mood || 'magical',
        colors: imageDescription.colors || ['purple', 'gold', 'silver'],
        composition: imageDescription.composition || 'centered composition',
        imageUrl: mockImageUrl,
        timestamp: new Date().toISOString(),
        generatedBy: 'gemini'
      };
    } catch (parseError) {
      console.error('Error parsing image description JSON:', parseError);
      
      // Fallback with basic description
      return {
        description: `A magical ${style} scene depicting: ${sceneDescription}. The image shows mystical elements with warm magical lighting, featuring characters in a Harry Potter setting with enchanted atmosphere.`,
        style,
        elements: ['magical lighting', 'characters', 'mystical atmosphere'],
        mood: 'magical',
        colors: ['purple', 'gold', 'silver'],
        composition: 'centered composition',
        imageUrl: generateMockImageUrl({ description: sceneDescription }),
        timestamp: new Date().toISOString(),
        generatedBy: 'gemini',
        fallback: true
      };
    }
  } catch (error) {
    console.error('Error generating scene image description:', error);
    
    // Fallback description
    return {
      description: `A ${style} illustration of ${sceneDescription} in the Harry Potter universe, featuring magical elements and atmospheric lighting.`,
      style,
      elements: ['magical scene', 'atmospheric lighting'],
      mood: 'mystical',
      colors: ['blue', 'gold'],
      composition: 'balanced',
      imageUrl: generateMockImageUrl({ description: sceneDescription }),
      timestamp: new Date().toISOString(),
      generatedBy: 'gemini',
      fallback: true,
      error: error.message
    };
  }
}

/**
 * Generates a mock image URL for testing purposes
 * @param {Object} imageDescription - The image description object
 * @returns {string} Mock image URL
 */
function generateMockImageUrl(imageDescription) {
  // Create a deterministic mock URL based on the description
  const description = imageDescription.description || 'magical scene';
  const hash = description.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Use a placeholder service that generates images based on text
  const encodedDescription = encodeURIComponent(description.substring(0, 100));
  return `https://via.placeholder.com/512x512/4A5568/F7FAFC?text=${encodedDescription}`;
}

/**
 * Generates an alternate script based on all player choices
 * @param {Object} completeStoryState - The completed story state
 * @returns {Promise<string>} Generated alternate script
 */
export async function generateAlternateScript(completeStoryState) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { scene, segments, conclusion, characters } = completeStoryState;

    const prompt = `
Create an alternate script summary for this collaborative Harry Potter story.

Original Scene: ${scene?.title || 'Unknown Scene'}
Characters: ${characters ? 
      (Array.isArray(characters) && typeof characters[0] === 'string' ? characters.join(', ') : 
       Array.isArray(characters) ? characters.map(c => c.name || c).join(', ') : characters) 
      : 'Various characters'}

Story Progression:
${segments ? segments.map((seg, i) => `Act ${i + 1}: ${seg.content.substring(0, 200)}...`).join('\n\n') : 'No segments available'}

Conclusion:
${conclusion || 'Story concluded'}

Create a script-style summary that:
1. Shows how this version differs from the original Harry Potter story
2. Highlights the key choices that changed the narrative
3. Presents it as an "Alternate Version" script outline
4. Maintains the magical tone while showing the unique path taken
5. Is formatted like a movie script summary
6. Celebrates the collaborative storytelling

Format as:
TITLE: [Original Scene] - Alternate Version
CHARACTERS: [List]
SYNOPSIS: [Brief summary of changes]
KEY SCENES: [Major story beats with choices highlighted]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating alternate script:', error);
    
    return `ALTERNATE SCRIPT: ${completeStoryState.scene?.title || 'Harry Potter Adventure'}\n\nThis unique version was created through collaborative storytelling, where players made choices that led to an alternate path through the magical world. Each decision shaped the narrative, creating a one-of-a-kind Harry Potter adventure.`;
  }
}

