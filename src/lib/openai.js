// OpenAI client configuration
import OpenAI from 'openai';

let openai = null;

export function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openai;
}

export async function generateStoryContent(prompt) {
  try {
    const client = getOpenAIClient();
    
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller helping to create alternate movie storylines. Generate engaging, movie-appropriate content that flows naturally from the given context."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating story content:', error);
    throw new Error('Failed to generate story content');
  }
}

export async function generateSceneImage(description) {
  try {
    const client = getOpenAIClient();
    
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: `Movie scene: ${description}. Cinematic style, high quality, appropriate for general audiences.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating scene image:', error);
    throw new Error('Failed to generate scene image');
  }
}