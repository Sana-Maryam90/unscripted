import { NextResponse } from 'next/server';
import { generateCharacterChoices, retryWithBackoff } from '../../../../../lib/gemini.js';

import { storyEngine } from '../../../../../services/storyEngine.js';
import { soloSessionManager } from '../../../../../lib/soloSessions.js';

/**
 * Generates contextual fallback choices that are specific and in first person
 * @param {string} character - The character name
 * @returns {Array} Array of contextual choice objects
 */
function generateContextualFallbackChoices(character) {
  const characterChoices = {
    'Harry Potter': [
      { 
        id: 'fallback-1', 
        text: 'I draw my wand and cast "Expelliarmus" to disarm any potential threats', 
        reasoning: 'Harry\'s signature spell and defensive instinct'
      },
      { 
        id: 'fallback-2', 
        text: 'I pull out the Invisibility Cloak and move stealthily through the shadows', 
        reasoning: 'Harry\'s resourcefulness with his inherited magical items'
      },
      { 
        id: 'fallback-3', 
        text: 'I whisper "Lumos" and examine the magical inscriptions on the nearby walls', 
        reasoning: 'Harry\'s curiosity about magical mysteries and clues'
      }
    ],
    'Hermione Granger': [
      { 
        id: 'fallback-1', 
        text: 'I cast "Protego" while quickly scanning for the nearest library or source of information', 
        reasoning: 'Hermione\'s defensive expertise combined with her scholarly instincts'
      },
      { 
        id: 'fallback-2', 
        text: 'I pull out "Hogwarts: A History" and search for relevant passages about this location', 
        reasoning: 'Hermione\'s encyclopedic knowledge and methodical approach'
      },
      { 
        id: 'fallback-3', 
        text: 'I cast "Revelio" to detect any hidden magical objects or enchantments nearby', 
        reasoning: 'Hermione\'s thorough investigation skills and spell knowledge'
      }
    ],
    'Ron Weasley': [
      { 
        id: 'fallback-1', 
        text: 'I grab a Chocolate Frog from my pocket and use it to test for magical traps', 
        reasoning: 'Ron\'s practical thinking and willingness to use available resources'
      },
      { 
        id: 'fallback-2', 
        text: 'I shout "Bloody hell, what\'s that?" and point my wand at the most suspicious area', 
        reasoning: 'Ron\'s direct approach and instinct to confront problems head-on'
      },
      { 
        id: 'fallback-3', 
        text: 'I pull out the Deluminator and extinguish nearby magical lights for tactical advantage', 
        reasoning: 'Ron\'s strategic use of inherited magical items in combat situations'
      }
    ]
  };
  
  const defaultChoices = [
    { 
      id: 'fallback-1', 
      text: 'I cast "Alohomora" on the nearest locked door to explore new pathways', 
      reasoning: 'Basic unlocking charm to access restricted areas'
    },
    { 
      id: 'fallback-2', 
      text: 'I approach the nearest magical portrait and ask about recent unusual activities', 
      reasoning: 'Portraits are excellent sources of information about castle happenings'
    },
    { 
      id: 'fallback-3', 
      text: 'I examine the ancient runes carved into the stone walls with my wand light', 
      reasoning: 'Ancient magical inscriptions often contain important clues'
    }
  ];
  
  const choices = characterChoices[character] || defaultChoices;
  return choices.map(choice => ({ ...choice, character, fallback: true }));
}

export async function POST(request) {
  try {
    const { sessionId, character } = await request.json();

    if (!sessionId || !character) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, character' },
        { status: 400 }
      );
    }

    console.log(`🎯 Solo API: Generating choices for ${character} in session ${sessionId}`);

    // Check if session exists in solo session manager
    if (!soloSessionManager.hasSession(sessionId)) {
      console.error(`❌ Solo session not found in session manager: ${sessionId}`);
      
      // Return contextual fallback choices instead of failing
      const fallbackChoices = generateContextualFallbackChoices(character);

      console.log(`🔄 Solo API: Providing fallback choices for ${character}`);
      
      return NextResponse.json({
        success: true,
        choices: fallbackChoices,
        message: 'Fallback choices provided due to session state issue',
        fallback: true
      });
    }

    // Check if story exists in story engine
    if (!storyEngine.hasStory(sessionId)) {
      console.error(`❌ Story not found in story engine for ${sessionId}`);
      
      // Return contextual fallback choices instead of failing
      const fallbackChoices = generateContextualFallbackChoices(character);

      console.log(`🔄 Solo API: Providing fallback choices for ${character}`);
      
      return NextResponse.json({
        success: true,
        choices: fallbackChoices,
        message: 'Fallback choices provided due to story engine state issue',
        fallback: true
      });
    }

    // Use story engine to generate choices
    const choices = await storyEngine.generateChoicesForPlayer(sessionId, character);

    console.log(`✅ Solo API: Generated ${choices.length} choices for ${character}`);
    return NextResponse.json({
      success: true,
      choices,
      message: 'Choices generated successfully'
    });

  } catch (error) {
    console.error('❌ Solo API Error generating choices:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate choices',
        details: error.message 
      },
      { status: 500 }
    );
  }
}