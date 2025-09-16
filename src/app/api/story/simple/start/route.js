import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { generateStoryContent } from '../../../../../lib/gemini.js';

export async function POST(request) {
  try {
    const { movieId, movieTitle, character } = await request.json();

    if (!movieId || !movieTitle || !character) {
      return NextResponse.json(
        { error: 'Missing required fields: movieId, movieTitle, character' },
        { status: 400 }
      );
    }

    console.log(`🎬 Starting story for movie: ${movieTitle}, character: ${character}`);

    // Load the specific movie data
    let movieData;
    try {
      const moviePath = join(process.cwd(), 'data', 'movies', `${movieId}.json`);
      const movieContent = await readFile(moviePath, 'utf8');
      movieData = JSON.parse(movieContent);
    } catch (error) {
      console.error('Error loading movie data:', error);
      return NextResponse.json(
        { error: 'Movie data not found' },
        { status: 404 }
      );
    }

    // Find the character data
    const characterData = movieData.characters.find(c => c.name === character);
    if (!characterData) {
      return NextResponse.json(
        { error: 'Character not found in movie data' },
        { status: 404 }
      );
    }

    // Generate base content using AI
    const baseContent = await generateStoryContent({
      movieTitle,
      movieDescription: movieData.description,
      character: characterData,
      storyContext: `Opening scene of ${movieTitle}`,
      isOpeningScene: true
    });

    // Generate initial choices
    const initialChoices = await generateChoices({
      movieTitle,
      movieDescription: movieData.description,
      character: characterData,
      currentContext: baseContent
    });

    console.log(`✅ Story started for ${movieTitle} as ${character}`);

    return NextResponse.json({
      success: true,
      baseContent,
      initialChoices
    });

  } catch (error) {
    console.error('❌ Error starting story:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to start story',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to generate choices using AI
async function generateChoices({ movieTitle, movieDescription, character, currentContext }) {
  try {
    const choicesPrompt = `
Generate 3 interesting story choices for this interactive story:

Movie: ${movieTitle}
Description: ${movieDescription}
Character: ${character.name} - ${character.description}
Character Personality: ${character.personality}
Current Story Context: ${currentContext}

Generate choices that:
1. Are written in first person (I will...)
2. Reflect the character's personality and abilities
3. Lead to different narrative branches
4. Are appropriate for the movie's tone and setting
5. Are specific and actionable

Return as JSON array with objects containing 'id', 'text', and 'reasoning' fields.
`;

    const response = await generateStoryContent({
      prompt: choicesPrompt,
      format: 'choices'
    });

    // If AI response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch {
        // Fallback to contextual choices if parsing fails
        return generateFallbackChoices(character.name, movieTitle);
      }
    }

    return response || generateFallbackChoices(character.name, movieTitle);
  } catch (error) {
    console.error('Error generating choices:', error);
    return generateFallbackChoices(character.name, movieTitle);
  }
}

// Fallback choices when AI generation fails
function generateFallbackChoices(characterName, movieTitle) {
  const genericChoices = [
    {
      id: 'explore',
      text: 'I decide to explore my surroundings carefully',
      reasoning: 'A cautious approach to understand the situation'
    },
    {
      id: 'interact',
      text: 'I approach the nearest person and try to start a conversation',
      reasoning: 'Seeking information through social interaction'
    },
    {
      id: 'observe',
      text: 'I stay back and observe what happens next',
      reasoning: 'Gathering information before making decisions'
    }
  ];

  console.log(`Using fallback choices for ${characterName} in ${movieTitle}`);
  return genericChoices;
}