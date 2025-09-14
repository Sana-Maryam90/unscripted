import { NextResponse } from 'next/server';
import { storyEngine } from '../../../../services/storyEngine.js';

export async function POST(request) {
  try {
    const { roomId, character, choice } = await request.json();

    if (!roomId || !character || !choice) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, character, choice' },
        { status: 400 }
      );
    }

    console.log(`⚡ API: Processing choice for ${character} in room ${roomId}: ${choice.text}`);

    // Check if story exists first
    if (!storyEngine.hasStory(roomId)) {
      console.error(`❌ Story not found for room ${roomId}. Cannot process choice.`);
      
      // Return a fallback response
      const fallbackSegment = {
        content: `${character} ${choice.text}. The magical world responds to their decision with a shimmer of possibility, as ancient enchantments recognize the weight of their choice. The air around them seems to pulse with newfound energy, and the very stones of Hogwarts appear to whisper secrets of what is to come.

Other characters in the vicinity pause in their activities, sensing that something significant has just occurred. The magical atmosphere shifts subtly, creating ripples of change that will undoubtedly influence the path ahead. Portraits on the walls lean forward with interest, their painted eyes reflecting the gravity of the moment.

The consequences of this decision begin to unfold immediately, as the magical world itself seems to rearrange in response to their agency. New opportunities present themselves while others fade away, and the characters find themselves standing at the threshold of an entirely new chapter in their adventure. The story continues to evolve, shaped by their choices and the mysterious forces that govern the wizarding world.

As the immediate effects of their decision settle into place, the characters realize that they have crossed a point of no return. The magical energy that surrounds them now carries a different quality, charged with the potential for both great triumph and unexpected challenges. The path forward remains uncertain, but one thing is clear: their choice has set in motion events that will reshape their destiny in ways they cannot yet imagine.`,
        character,
        choice: choice.text,
        choiceReasoning: choice.reasoning || 'Character decision',
        turnCount: 1,
        timestamp: new Date().toISOString(),
        fallback: true,
        wordCount: 280
      };

      return NextResponse.json({
        success: true,
        result: {
          newSegment: fallbackSegment,
          storyState: {
            turnCount: 1,
            shouldContinue: true,
            segments: [fallbackSegment]
          }
        },
        completionResult: {
          isComplete: false,
          shouldContinue: true
        },
        message: 'Fallback choice processing due to story state issue',
        fallback: true
      });
    }

    // Process choice with AI story engine
    const result = await storyEngine.processPlayerChoice(roomId, character, choice);

    // Check if story should be completed
    const completionResult = await storyEngine.checkAndCompleteStory(roomId);

    console.log(`✅ API: Processed choice for ${character}. Turn ${result.storyState.turnCount}/5`);

    return NextResponse.json({
      success: true,
      result: {
        newSegment: result.newSegment,
        storyState: result.storyState
      },
      completionResult,
      message: 'Choice processed successfully'
    });

  } catch (error) {
    console.error('❌ API Error processing choice:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process choice',
        details: error.message 
      },
      { status: 500 }
    );
  }
}