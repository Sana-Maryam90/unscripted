import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { generateStoryContent } from '../../../../../lib/gemini.js';

export async function POST(request) {
  try {
    const { movieId, movieTitle, character, choice, storyHistory } = await request.json();

    if (!movieId || !movieTitle || !character || !choice || !storyHistory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🎬 Continuing story for movie: ${movieTitle}, character: ${character}, choice: ${choice}`);

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

    // Build story context from history
    const storyContext = storyHistory.map(entry => {
      if (entry.type === 'story') {
        return `Story: ${entry.content}`;
      } else if (entry.type === 'choice') {
        return `Choice made: ${entry.content}`;
      }
      return '';
    }).join('\n');

    // Generate next story content based on choice
    const nextContent = await generateStoryContent({
      movieTitle,
      movieDescription: movieData.description,
      character: characterData,
      storyContext,
      playerChoice: choice,
      isOpeningScene: false
    });

    // Generate next choices
    const nextChoices = await generateChoices({
      movieTitle,
      movieDescription: movieData.description,
      character: characterData,
      currentContext: nextContent,
      storyHistory: storyHistory
    });

    console.log(`✅ Story continued for ${movieTitle} as ${character}`);

    return NextResponse.json({
      success: true,
      nextContent,
      nextChoices
    });

  } catch (error) {
    console.error('❌ Error continuing story:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to continue story',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to generate choices using AI
async function generateChoices({ movieTitle, movieDescription, character, currentContext, storyHistory }) {
  try {
    const storyContextSummary = storyHistory.slice(-4).map(entry => entry.content).join(' ');
    
    const choicesPrompt = `
Generate 3 interesting story choices for this interactive story:

Movie: ${movieTitle}
Description: ${movieDescription}
Character: ${character.name} - ${character.description}
Character Personality: ${character.personality}
Recent Story: ${storyContextSummary}
Current Scene: ${currentContext}

Generate choices that:
1. Are written in first person (I will...)
2. Reflect the character's personality and abilities
3. Lead to different narrative branches
4. Are appropriate for the movie's tone and setting
5. Are specific and actionable
6. Progress the story meaningfully

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
      id: 'continue',
      text: 'I continue forward with determination',
      reasoning: 'Moving the story forward'
    },
    {
      id: 'investigate',
      text: 'I investigate the situation more carefully',
      reasoning: 'Gathering more information'
    },
    {
      id: 'help',
      text: 'I look for ways to help others around me',
      reasoning: 'Acting with compassion and support'
    }
  ];

  console.log(`Using fallback choices for ${characterName} in ${movieTitle}`);
  return genericChoices;
}