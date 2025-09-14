const { GoogleGenerativeAI } = require('google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate detailed movie questions using Gemini AI
 * @param {Object} movieData - Movie data object with title, characters, plot, etc.
 * @param {number} questionCount - Number of questions to generate (default: 20)
 * @returns {Promise<Array>} Array of question objects
 */
async function generateMovieQuestions(movieData, questionCount = 20) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate ${questionCount} detailed quiz questions about the movie "${movieData.title}". 

Movie Information:
- Title: ${movieData.title}
- Description: ${movieData.description}
- Characters: ${movieData.characters?.map(c => `${c.name} (${c.description})`).join(', ')}

Requirements for questions:
1. Questions should be DETAILED and require DEEP knowledge about the movie
2. Include questions about specific scenes, dialogue, character relationships, plot details
3. Include questions about movie production, cast, crew, behind-the-scenes facts
4. Avoid obvious or general questions that anyone could guess
5. Each question should have 4 multiple choice options (A, B, C, D)
6. Only ONE option should be correct
7. Questions should cover various aspects: plot details, character development, specific scenes, dialogue, production facts, cast information

Format each question as JSON:
{
  "id": 1,
  "question": "What specific spell does Hermione use to unlock the door in the third-floor corridor?",
  "options": ["Alohomora", "Expelliarmus", "Wingardium Leviosa", "Lumos"],
  "correct": 0,
  "category": "plot_details",
  "difficulty": "hard"
}

Categories to include:
- plot_details: Specific plot points and story elements
- character_development: Character relationships and growth
- dialogue: Specific quotes and conversations
- scenes: Detailed scene descriptions and events
- production: Behind-the-scenes, cast, crew information
- trivia: Interesting facts and easter eggs

Generate exactly ${questionCount} questions in valid JSON array format.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Validate and format questions
    const formattedQuestions = questions.map((q, index) => ({
      id: index + 1,
      question: q.question,
      options: q.options,
      corre