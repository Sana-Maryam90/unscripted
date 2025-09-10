// Unit tests for Gemini API integration
import { jest } from '@jest/globals';

// Mock the Google Generative AI module
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }))
}));

// Import functions after mocking
import {
  selectRandomScene,
  generateBaseContent,
  generateCharacterChoices,
  processChoiceAndGenerateSegment,
  manageStoryCycle,
  detectAndCompleteStory,
  validateContent,
  validateCharacterChoices,
  retryWithBackoff
} from '../gemini.js';

describe('Gemini API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  describe('selectRandomScene', () => {
    const mockMovieData = {
      scenes: [
        { id: 1, title: 'Test Scene 1', context: 'Test context 1' },
        { id: 2, title: 'Test Scene 2', context: 'Test context 2' }
      ]
    };

    it('should select a random scene and enhance it with Gemini', async () => {
      const mockResponse = {
        response: {
          text: () => 'Enhanced scene description with magical details...'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await selectRandomScene(mockMovieData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('enhancedDescription');
      expect(result).toHaveProperty('originalContext');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should return fallback scene when API fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await selectRandomScene(mockMovieData);

      expect(result).toHaveProperty('fallback', true);
      expect(result).toHaveProperty('enhancedDescription');
      expect(result.enhancedDescription).toBe(result.originalContext);
    });
  });

  describe('generateBaseContent', () => {
    const mockScene = { title: 'Test Scene', context: 'Test context' };
    const mockCharacters = ['Harry Potter', 'Hermione Granger'];

    it('should generate base content for a scene', async () => {
      const mockResponse = {
        response: {
          text: () => 'The scene unfolds with magical atmosphere and detailed descriptions...'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateBaseContent(mockScene, mockCharacters);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should return fallback content when API fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await generateBaseContent(mockScene, mockCharacters);

      expect(typeof result).toBe('string');
      expect(result).toContain(mockScene.title);
      expect(result).toContain(mockScene.context);
    });
  });

  describe('generateCharacterChoices', () => {
    const mockContext = {
      scene: { title: 'Test Scene', context: 'Test context' },
      previousChoices: []
    };

    it('should generate character-specific choices', async () => {
      const mockChoices = [
        { id: 'choice-1', text: 'Cast a spell', reasoning: 'Magic solution', impact: 'Magical effect' },
        { id: 'choice-2', text: 'Sneak around', reasoning: 'Stealth approach', impact: 'Avoid detection' },
        { id: 'choice-3', text: 'Rally friends', reasoning: 'Team approach', impact: 'Group action' }
      ];
      
      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockChoices)
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateCharacterChoices(mockContext, 'Harry Potter');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('reasoning');
      expect(result[0]).toHaveProperty('impact');
      expect(result[0]).toHaveProperty('character', 'Harry Potter');
    });

    it('should return fallback choices when API fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await generateCharacterChoices(mockContext, 'Harry Potter');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('fallback', true);
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid JSON response'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateCharacterChoices(mockContext, 'Harry Potter');

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('fallback', true);
    });
  });

  describe('processChoiceAndGenerateSegment', () => {
    const mockChoiceContext = {
      choice: { text: 'Cast a spell', reasoning: 'Magic solution' },
      character: 'Harry Potter',
      scene: { title: 'Test Scene', context: 'Test context' },
      previousSegments: [],
      turnCount: 1
    };

    it('should process choice and generate story segment', async () => {
      const mockResponse = {
        response: {
          text: () => 'Harry Potter cast the spell with determination. The magical energy crackled through the air as the spell took effect, illuminating the chamber with a brilliant light. The consequences of his choice rippled through the magical world around them.'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await processChoiceAndGenerateSegment(mockChoiceContext);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('character', 'Harry Potter');
      expect(result).toHaveProperty('choice', 'Cast a spell');
      expect(result).toHaveProperty('turnCount', 1);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('wordCount');
      expect(result.content.length).toBeGreaterThan(150);
    });

    it('should return fallback content when API fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      const result = await processChoiceAndGenerateSegment(mockChoiceContext);

      expect(result).toHaveProperty('fallback', true);
      expect(result).toHaveProperty('content');
      expect(result.content).toContain('Cast a spell');
    });
  });

  describe('manageStoryCycle', () => {
    it('should manage story cycle progression', () => {
      const storyState = { turnCount: 2 };
      
      const result = manageStoryCycle(storyState);

      expect(result).toHaveProperty('shouldContinue', true);
      expect(result).toHaveProperty('nextPhase');
      expect(result).toHaveProperty('turnsRemaining', 3);
      expect(result).toHaveProperty('progressPercentage', 40);
    });

    it('should detect story completion', () => {
      const storyState = { turnCount: 5 };
      
      const result = manageStoryCycle(storyState);

      expect(result).toHaveProperty('shouldContinue', false);
      expect(result).toHaveProperty('nextPhase', 'story-completion');
      expect(result).toHaveProperty('turnsRemaining', 0);
      expect(result).toHaveProperty('progressPercentage', 100);
    });
  });

  describe('detectAndCompleteStory', () => {
    it('should detect incomplete story', async () => {
      const storyState = { turnCount: 2, segments: [] };
      
      const result = await detectAndCompleteStory(storyState);

      expect(result).toHaveProperty('isComplete', false);
      expect(result).toHaveProperty('storyState');
    });

    it('should complete story when conditions are met', async () => {
      const mockResponse = {
        response: {
          text: () => 'The adventure comes to a satisfying conclusion as all the threads come together...'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const storyState = { 
        turnCount: 5, 
        segments: [{ content: 'Test segment' }],
        scene: { title: 'Test Scene' },
        characters: ['Harry Potter']
      };
      
      const result = await detectAndCompleteStory(storyState);

      expect(result).toHaveProperty('isComplete', true);
      expect(result).toHaveProperty('conclusion');
      expect(result.storyState).toHaveProperty('isComplete', true);
      expect(result.storyState).toHaveProperty('completedAt');
    });
  });

  describe('validateContent', () => {
    it('should validate good content', () => {
      const content = 'This is a well-written story segment with sufficient detail and appropriate length for the storytelling game.';
      
      const result = validateContent(content);

      expect(result).toHaveProperty('isValid', true);
      expect(result).toHaveProperty('issues');
      expect(result.issues).toHaveLength(0);
    });

    it('should detect content that is too short', () => {
      const content = 'Too short';
      
      const result = validateContent(content);

      expect(result).toHaveProperty('isValid', false);
      expect(result.issues).toContain('Content too short');
    });

    it('should detect content that is too long', () => {
      const content = 'A'.repeat(2001);
      
      const result = validateContent(content);

      expect(result).toHaveProperty('isValid', false);
      expect(result.issues).toContain('Content too long');
    });
  });

  describe('validateCharacterChoices', () => {
    it('should validate good choices', () => {
      const choices = [
        { text: 'Cast a specific spell', reasoning: 'Magic solution', impact: 'Magical effect' },
        { text: 'Sneak through passage', reasoning: 'Stealth approach', impact: 'Avoid detection' },
        { text: 'Rally the friends', reasoning: 'Team approach', impact: 'Group action' }
      ];
      
      const result = validateCharacterChoices(choices, 'Harry Potter');

      expect(result).toHaveProperty('isValid', true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect wrong number of choices', () => {
      const choices = [
        { text: 'Only choice', reasoning: 'Reason', impact: 'Impact' }
      ];
      
      const result = validateCharacterChoices(choices, 'Harry Potter');

      expect(result).toHaveProperty('isValid', false);
      expect(result.issues).toContain('Must have exactly 3 choices');
    });

    it('should detect generic choices', () => {
      const choices = [
        { text: 'Act bravely', reasoning: 'Be brave', impact: 'Brave outcome' },
        { text: 'Think clearly', reasoning: 'Be smart', impact: 'Smart outcome' },
        { text: 'Do the right thing', reasoning: 'Be good', impact: 'Good outcome' }
      ];
      
      const result = validateCharacterChoices(choices, 'Harry Potter');

      expect(result).toHaveProperty('isValid', false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const mockApiCall = jest.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockApiCall);

      expect(result).toBe('success');
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockApiCall = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockApiCall, 3, 10);

      expect(result).toBe('success');
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const mockApiCall = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(retryWithBackoff(mockApiCall, 2, 10)).rejects.toThrow('Persistent failure');
      expect(mockApiCall).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});