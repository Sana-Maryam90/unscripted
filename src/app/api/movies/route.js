import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const moviesDir = path.join(process.cwd(), 'data', 'movies');
    const files = fs.readdirSync(moviesDir);
    
    const movies = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(moviesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const movie = JSON.parse(fileContent);
        
        // Return only essential data for the movie selection interface
        return {
          id: movie.id,
          title: movie.title,
          description: movie.description,
          genre: movie.genre,
          duration: movie.duration,
          image: movie.image,
          characterCount: movie.characters?.length || 0
        };
      });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}