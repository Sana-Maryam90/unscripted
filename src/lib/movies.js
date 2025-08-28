import fs from 'fs';
import path from 'path';

/**
 * Get all available movies
 * @returns {Array} Array of movie objects
 */
export async function getAllMovies() {
    const moviesDirectory = path.join(process.cwd(), 'data', 'movies');

    try {
        const filenames = fs.readdirSync(moviesDirectory);
        const movies = [];

        for (const filename of filenames) {
            if (filename.endsWith('.json')) {
                const filePath = path.join(moviesDirectory, filename);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const movie = JSON.parse(fileContents);
                movies.push(movie);
            }
        }

        return movies.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
        console.error('Error loading movies:', error);
        return [];
    }
}

/**
 * Get a specific movie by ID
 * @param {string} movieId - The movie ID
 * @returns {Object|null} Movie object or null if not found
 */
export async function getMovieById(movieId) {
    try {
        const filePath = path.join(process.cwd(), 'data', 'movies', `${movieId}.json`);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error(`Error loading movie ${movieId}:`, error);
        return null;
    }
}

/**
 * Get featured movies for the homepage
 * @returns {Array} Array of featured movie objects
 */
export async function getFeaturedMovies() {
    const allMovies = await getAllMovies();

    // Return first 3 movies as featured, or all if less than 3
    return allMovies.slice(0, 3);
}

/**
 * Get movies by genre
 * @param {string} genre - Genre to filter by
 * @returns {Array} Array of movie objects
 */
export async function getMoviesByGenre(genre) {
    const allMovies = await getAllMovies();

    return allMovies.filter(movie =>
        movie.genre && movie.genre.some(g =>
            g.toLowerCase() === genre.toLowerCase()
        )
    );
}

/**
 * Get movies by difficulty
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 * @returns {Array} Array of movie objects
 */
export async function getMoviesByDifficulty(difficulty) {
    const allMovies = await getAllMovies();

    return allMovies.filter(movie =>
        movie.difficulty && movie.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
}