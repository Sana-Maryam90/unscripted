import { NextResponse } from 'next/server';
import { storyEngine } from '../../../../services/storyEngine.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const { roomId, movieId, characters } = await request.json();

    if (!roomId || !movieId || !characters) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, movieId, characters' },
        { status: 400 }
      );
    }

    console.log(`🎬 API: Initializing story for room ${roomId}, movie ${movieId}`);

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

    // Initialize story with AI
    const storyState = await storyEngine.initializeStory(roomId, movieData, characters);

    console.log(`✅ API: Story initialized for room ${roomId}`);
    console.log(`📊 Total active stories after initialization: ${storyEngine.getActiveStoryRooms().length}`);
    console.log(`🗂️ Active room IDs: ${storyEngine.getActiveStoryRooms().join(', ')}`);

    return NextResponse.json({
      success: true,
      storyState,
      message: 'Story initialized successfully'
    });

  } catch (error) {
    console.error('❌ API Error initializing story:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize story',
        details: error.message 
      },
      { status: 500 }
    );
  }
}