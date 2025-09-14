import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const moviePath = path.join(process.cwd(), 'data', 'movies', `${id}.json`);
    
    if (!fs.existsSync(moviePath)) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    const movieData = JSON.parse(fs.readFileSync(moviePath, 'utf8'));
    return NextResponse.json(movieData);
  } catch (error) {
    console.error('Error loading movie:', error);
    return NextResponse.json({ error: 'Failed to load movie' }, { status: 500 });
  }
}