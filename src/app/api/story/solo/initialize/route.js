import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  selectRandomScene,
  generateBaseContent,
  retryWithBackoff
} from '../../../../../lib/gemini.js';

import { storyEngine } from '../../../../../services/storyEngine.js';
import { soloSessionManager } from '../../../../../lib/soloSessions.js';

export async function POST(request) {
  try {
    const { sessionId, movieId, character } = await request.json();

    if (!sessionId || !movieId || !character) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, movieId, character' },
        { status: 400 }
      );
    }

    console.log(`🎬 Solo API: Initializing story for session ${sessionId}, movie ${movieId}, character ${character}`);

    // Load movie data - try harryPotter.json first for scenes, then individual movie file
    let movieData;
    
    try {
      // First try to load harryPotter.json which has scenes for AI generation
      const harryPotterPath = join(process.cwd(), 'data', 'movies', 'harryPotter.json');
      const harryPotterContent = await readFile(harryPotterPath, 'utf8');
      const harryPotterData = JSON.parse(harryPotterContent);
      
      // Also load the specific movie data for character info
      const moviePath = join(process.cwd(), 'data', 'movies', `${movieId}.json`);
      const movieContent = await readFile(moviePath, 'utf8');
      const specificMovieData = JSON.parse(movieContent);
      
      // Combine the data - use scenes from harryPotter.json and characters from specific movie
      movieData = {
        ...specificMovieData,
        scenes: harryPotterData.scenes,
        movie: harryPotterData.movie
      };
      
    } catch (error) {
      console.error('Error loading movie data:', error);
      return NextResponse.json(
        { error: 'Movie data not found' },
        { status: 404 }
      );
    }

    // Select random scene using Gemini API
    const selectedScene = await retryWithBackoff(
      () => selectRandomScene(movieData),
      3,
      1000
    );

    // Generate base content
    const baseContent = await retryWithBackoff(
      () => generateBaseContent(selectedScene, [{ name: character }]),
      3,
      1000
    );

    // Store session in solo session manager (no room logic)
    const sessionData = {
      movieId,
      character,
      movieData,
      mode: 'solo'
    };

    soloSessionManager.createSession(sessionId, sessionData);

    // Initialize story in story engine (using existing singleton pattern)
    const initializedStory = await storyEngine.initializeStory(sessionId, movieData, [{ name: character }]);

    console.log(`✅ Solo API: Story initialized for session ${sessionId}: ${selectedScene.title}`);
    console.log(`📊 Total active stories: ${storyEngine.getActiveStoryRooms().length}`);

    return NextResponse.json({
      success: true,
      storyState: initializedStory,
      message: 'Solo story initialized successfully'
    });

  } catch (error) {
    console.error('❌ Solo API Error initializing story:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize solo story',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

