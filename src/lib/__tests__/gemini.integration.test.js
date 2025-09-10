// Integration tests for Gemini API with real movie data
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  selectRandomScene,
  generateBaseContent,
  generateCharacterChoices,
  processChoiceAndGenerateSegment
} from '../gemini.js';

// Skip these tests if no API key is provided
const skipTests = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here';

describe('Gemini API Integration Tests', () => {
  let harryPotterData;

  beforeAll(() => {
    // Load real movie data
    try {
      const dataPath = join(process.cwd(), 'data', 'movies', 'harryPotter.json');
      const rawData = readFileSync(dataPath, 'utf8');
      harryPotterData = JSON.parse(rawData);
    } catch (error) {
      console.warn('Could not load harryPotter.json for integration tests');
      harryPotterData = {
        scenes: [
          { id: 1, title: 'Test Scene', context: 'Test context for integration' }
        ],
        characters: ['Harry Potter', 'Hermione Granger', 'Ron Weasley']
      };
    }
  });

  describe('Scene Selection Integration', () => {
    it('should select and enhance a real scene', async () => {
      if (skipTests) {
        console.log('Skipping integration test - no API key provided');
        return;
      }

      const result = await selectRandomScene(harryPotterData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('enhancedDescription');
      expect(result.enhancedDescription).not.toBe(result.originalContext);
      expect(result.enhancedDescription.length).toBeGreaterThan(100);
    }, 15000); // 15 second timeout for API calls
  });

  describe('Base Content Generation Integration', () => {
    it('should generate base content for a real scene', async () => {
      if (skipTests) {
        console.log('Skipping integration test - no API key provided');
        return;
      }

      const scene = harryPotterData.scenes[0];
      const characters = harryPotterData.characters || ['Harry Potter', 'Hermione Granger'];

      const result = await generateBaseContent(scene, characters);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(150);
      expect(result).toContain(scene.title);
    }, 15000);
  });

  describe('Character Choices Integration', () => {
    it('should generate character-specific choices', async () => {
      if (skipTests) {
        console.log('Skipping integration test - no API key provided');
        return;
      }

      const context = {
        scene: harryPotterData.scenes[0],
        previousChoices: []
      };

      const result = await generateCharacterChoices(context, 'Harry Potter');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      
      result.forEach(choice => {
        expect(choice).toHaveProperty('id');
        expect(choice).toHaveProperty('text');
        expect(choice).toHaveProperty('reasoning');
        expect(choice).toHaveProperty('impact');
        expect(choice).toHaveProperty('character', 'Harry Potter');
        expect(choice.text.length).toBeGreaterThan(10);
      });
    }, 15000);
  });

  describe('Story Segment Generation Integration', () => {
    it('should process choice and generate story segment', async () => {
      if (skipTests) {
        console.log('Skipping integration test - no API key provided');
        return;
      }

      const choiceContext = {
        choice: {
          text: 'Cast a Protean Charm on the coins',
          reasoning: 'Harry uses his magical knowledge',
          impact: 'Creates magical communication'
        },
        character: 'Harry Potter',
        scene: harryPotterData.scenes[0],
        previousSegments: [],
        turnCount: 1
      };

      const result = await processChoiceAndGenerateSegment(choiceContext);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('character', 'Harry Potter');
      expect(result).toHaveProperty('turnCount', 1);
      expect(result.content.length).toBeGreaterThan(150);
      expect(result.content).toContain('Harry Potter');
    }, 15000);
  });

  describe('Error Handling Integration', () => {
    it('should handle API failures gracefully', async () => {
      // Temporarily break the API key to test error handling
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'invalid-key';

      try {
        const result = await selectRandomScene(harryPotterData);
        
        // Should return fallback content
        expect(result).toHaveProperty('fallback', true);
        expect(result).toHaveProperty('enhancedDescription');
      } finally {
        // Restore the original key
        process.env.GEMINI_API_KEY = originalKey;
      }
    }, 10000);
  });
});