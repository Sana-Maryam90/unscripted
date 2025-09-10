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
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

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
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are creating the opening content for an interactive Harry Potter storytelling game. 

Scene: ${scene.title}
Context: ${scene.context}
Available Characters: ${characters.join(', ')}

Create the base content that describes this scene exactly as it appears in the original Harry Potter story. This will be the starting point for players to make choices from their character's perspective.

Requirements:
- Describe the scene exactly as written in the source material
- Maintain the authentic Harry Potter tone and atmosphere
- Include specific details that make the scene recognizable
- Write 2-3 paragraphs of professional, engaging text
- Set up the scene so players can make meaningful character-based choices
- Do not include any choices or questions - this is just the scene description

Write in present tense as if the scene is unfolding now.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating base content:', error);
    
    // Fallback content
    return `${scene.title}\n\n${scene.context}\n\nThe scene unfolds before you, filled with magic and possibility. The characters find themselves at a crucial moment where their decisions will shape the story ahead.`;
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
 * Generates character-specific choices for the current story context
 * @param {Object} context - Story context including scene, character, and previous choices
 * @param {string} character - The character making the choice
 * @returns {Promise<Array>} Array of character-specific choice objects
 */
export async function generateCharacterChoices(context, character) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are creating character-specific choices for an interactive Harry Potter storytelling game.

Current Scene: ${context.scene?.title || 'Unknown Scene'}
Scene Context: ${context.scene?.context || context.sceneDescription || 'No context provided'}
Character: ${character}
Previous Story Context: ${context.previousChoices ? context.previousChoices.map(c => `${c.character} chose: ${c.choice}`).join('\n') : 'This is the beginning of the story'}

Generate 3 specific choices that ${character} could make in this situation. These choices should be:

1. Specific to the context and situation (NOT generic like "act bravely" or "think clearly")
2. True to ${character}'s personality and abilities from the Harry Potter series
3. Meaningful choices that would lead to different story outcomes
4. Appropriate for the current scene and circumstances

Format your response as a JSON array with this structure:
[
  {
    "id": "choice-1",
    "text": "Specific action the character would take",
    "reasoning": "Why this choice fits the character",
    "impact": "Brief description of potential consequences"
  },
  {
    "id": "choice-2", 
    "text": "Another specific action",
    "reasoning": "Character motivation",
    "impact": "Potential outcome"
  },
  {
    "id": "choice-3",
    "text": "Third specific action", 
    "reasoning": "Character justification",
    "impact": "Expected result"
  }
]

Examples of GOOD choices:
- "Cast a Protean Charm on the coins to communicate with the others"
- "Sneak through the secret passage behind the portrait of the Fat Lady"
- "Use the Marauder's Map to check for approaching teachers"

Examples of BAD choices (too generic):
- "Act bravely"
- "Think carefully about the situation"
- "Do the right thing"

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
      
      // Validate each choice has required fields
      const validatedChoices = choices.map((choice, index) => ({
        id: choice.id || `choice-${index + 1}`,
        text: choice.text || `Choice ${index + 1}`,
        reasoning: choice.reasoning || 'Character-based decision',
        impact: choice.impact || 'Will affect the story',
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
 * Generates fallback choices when API fails
 * @param {string} character - The character name
 * @param {Object} context - Story context
 * @returns {Array} Fallback choice objects
 */
function generateFallbackChoices(character, context) {
  const characterChoices = {
    'Harry Potter': [
      { id: 'choice-1', text: 'Step forward to protect others', reasoning: 'Harry\'s heroic nature', impact: 'Takes on the danger personally' },
      { id: 'choice-2', text: 'Look for a magical solution', reasoning: 'Harry\'s resourcefulness', impact: 'Seeks creative problem-solving' },
      { id: 'choice-3', text: 'Rally friends for support', reasoning: 'Harry values friendship', impact: 'Strengthens group unity' }
    ],
    'Hermione Granger': [
      { id: 'choice-1', text: 'Research the situation thoroughly', reasoning: 'Hermione\'s scholarly approach', impact: 'Gains valuable knowledge' },
      { id: 'choice-2', text: 'Cast a protective spell', reasoning: 'Hermione\'s magical expertise', impact: 'Provides magical defense' },
      { id: 'choice-3', text: 'Analyze the logical options', reasoning: 'Hermione\'s rational thinking', impact: 'Makes informed decisions' }
    ],
    'Ron Weasley': [
      { id: 'choice-1', text: 'Stand by friends loyally', reasoning: 'Ron\'s loyalty', impact: 'Strengthens friendships' },
      { id: 'choice-2', text: 'Use humor to lighten the mood', reasoning: 'Ron\'s personality', impact: 'Reduces tension' },
      { id: 'choice-3', text: 'Take direct action', reasoning: 'Ron\'s straightforward nature', impact: 'Immediate response' }
    ]
  };
  
  const defaultChoices = [
    { id: 'choice-1', text: 'Proceed cautiously', reasoning: 'Careful approach', impact: 'Minimizes immediate risk' },
    { id: 'choice-2', text: 'Take bold action', reasoning: 'Decisive move', impact: 'Creates significant change' },
    { id: 'choice-3', text: 'Seek more information', reasoning: 'Thoughtful consideration', impact: 'Better understanding' }
  ];
  
  const choices = characterChoices[character] || defaultChoices;
  return choices.map(choice => ({ ...choice, character, fallback: true }));
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
    
    if (!choice.impact) {
      issues.push(`Choice ${index + 1} missing impact description`);
    }
    
    // Check for generic choices
    const genericPhrases = ['act bravely', 'think clearly', 'do the right thing', 'be careful'];
    const isGeneric = genericPhrases.some(phrase => 
      choice.text.toLowerCase().includes(phrase)
    );
    
    if (isGeneric) {
      issues.push(`Choice ${index + 1} is too generic`);
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
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const { choice, character, scene, previousSegments, turnCount } = choiceContext;

    const prompt = `
You are continuing an interactive Harry Potter story. A player has made a choice, and you need to generate the next narrative segment.

Current Scene: ${scene?.title || 'Unknown Scene'}
Scene Context: ${scene?.context || 'No context'}
Character Who Made Choice: ${character}
Choice Made: ${choice.text}
Choice Reasoning: ${choice.reasoning}
Turn Count: ${turnCount || 1}

Previous Story Segments:
${previousSegments ? previousSegments.map((seg, i) => `Segment ${i + 1}: ${seg.content}`).join('\n\n') : 'This is the first choice in the story.'}

Generate the next story segment that:
1. Shows the immediate consequences of ${character}'s choice: "${choice.text}"
2. Advances the plot meaningfully while staying true to Harry Potter lore
3. Contains at least one full paragraph of professionally written text (minimum 150 words)
4. Sets up the situation for the next player's choice
5. Maintains narrative coherence with previous segments
6. Includes vivid descriptions and character reactions
7. Keeps the magical atmosphere of the Harry Potter universe

Write in present tense, third person. Focus on showing the consequences of the choice through action and dialogue rather than just telling what happened.

The segment should be engaging, detailed, and move the story forward significantly.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Validate content length
    if (content.length < 150) {
      throw new Error('Generated content too short');
    }

    return {
      content,
      character,
      choice: choice.text,
      turnCount,
      timestamp: new Date().toISOString(),
      wordCount: content.split(' ').length
    };
  } catch (error) {
    console.error('Error processing choice and generating segment:', error);
    
    // Fallback content
    return {
      content: `${choice.character || character} ${choice.text}. The decision ripples through the magical world around them, setting new events in motion. The story continues to unfold as the consequences of this choice become clear, leading the characters deeper into their adventure.`,
      character,
      choice: choice.text,
      turnCount,
      timestamp: new Date().toISOString(),
      fallback: true,
      wordCount: 45
    };
  }
}

/**
 * Manages the story cycle for 4-5 choice iterations
 * @param {Object} storyState - Current story state
 * @returns {Object} Updated story state with cycle management
 */
export function manageStoryCycle(storyState) {
  const maxTurns = 5;
  const currentTurn = storyState.turnCount || 1;
  
  // Check if story should continue
  const shouldContinue = currentTurn < maxTurns;
  
  // Determine next phase
  let nextPhase = 'choice-generation';
  if (currentTurn >= maxTurns) {
    nextPhase = 'story-completion';
  } else if (currentTurn >= 3) {
    nextPhase = 'building-climax';
  }
  
  return {
    ...storyState,
    shouldContinue,
    nextPhase,
    turnsRemaining: Math.max(0, maxTurns - currentTurn),
    progressPercentage: Math.min(100, (currentTurn / maxTurns) * 100)
  };
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
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const storySegmentsText = segments ? 
      segments.map((seg, i) => `Turn ${i + 1} (${seg.character}): ${seg.content}`).join('\n\n') :
      'No previous segments available.';

    const prompt = `
You are concluding an interactive Harry Potter story. The players have made their choices, and now you need to create a satisfying conclusion.

Original Scene: ${scene?.title || 'Unknown Scene'}
Scene Context: ${scene?.context || 'No context'}
Characters Involved: ${characters ? characters.join(', ') : 'Unknown characters'}
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
 * Generates an alternate script based on all player choices
 * @param {Object} completeStoryState - The completed story state
 * @returns {Promise<string>} Generated alternate script
 */
export async function generateAlternateScript(completeStoryState) {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const { scene, segments, conclusion, characters } = completeStoryState;

    const prompt = `
Create an alternate script summary for this collaborative Harry Potter story.

Original Scene: ${scene?.title || 'Unknown Scene'}
Characters: ${characters ? characters.join(', ') : 'Various characters'}

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

/**
 * Retry mechanism for API calls with exponential backoff
 * @param {Function} apiCall - The API call function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Result of the API call
 */
export async function retryWithBackoff(apiCall, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`API call failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}