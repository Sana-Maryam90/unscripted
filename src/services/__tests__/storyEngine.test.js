// Unit tests for Story Engine Service
import { jest } from '@jest/globals';

// Mock the Gemini service
const mockSelectRandomScene = jest.fn();
const mockGenerateBaseContent = jest.fn();
const mockGenerateCharacterChoices = jest.fn();
const mockProcessChoiceAndGenerateSegment = jest.fn();
const mockDetectAndCompleteStory = jest.fn();
const mockGenerateAlternateScript = jest.fn();
const mockRetryWithBackoff = jest.fn();

jest.mock('../lib/gemini.js', () => ({
  selectRandomScene: mockSelectRandomScene,
  generateBaseContent: mockGenerateBaseContent,
  generateCharacterChoices: mockGenerateCharacterChoices,
  processChoiceAndGenerateSegment: mockProcessChoiceAndGenerateSegment,
  manageStoryCycle: jest.fn((state) => ({ ...state, shouldContinue: true, nextPhase: 'choice-generation' })),
  detectAndCompleteStory: mockDetectAndCompleteStory,
  generateAlternateScript: mockGenerateAlternateScript,
  retryWithBackoff: mockRetryWithBackoff
}));

import { StoryEngine } from '../storyEngine.js';

describe('StoryEngine', () => {
  let storyEngine;

  beforeEach(() => {
    storyEngine = new StoryEngine();
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockRetryWithBackoff.mockImplementation((fn) => fn());
  });

  describe('initializeStory', () => {
    const mockMovieData = {
      scenes: [{ id: 1, title: 'Test Scene', context: 'Test context' }]
    };
    const mockCharacters = ['Harry Potter', 'Hermione Granger'];

    it('should initialize a new story successfully', async () => {
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins in a magical setting...';

      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);

      const result = await storyEngine.initializeStory('room123', mockMovieData, mockCharacters);

      expect(result).toHaveProperty('roomId', 'room123');
      expect(result).toHaveProperty('scene', mockScene);
      expect(result).toHaveProperty('characters', mockCharacters);
      expect(result).toHaveProperty('baseContent', mockBaseContent);
      expect(result).toHaveProperty('segments', []);
      expect(result).toHaveProperty('turnCount', 0);
      expect(result).toHaveProperty('isActive', true);

      expect(mockSelectRandomScene).toHaveBeenCalledWith(mockMovieData);
      expect(mockGenerateBaseContent).toHaveBeenCalledWith(mockScene, mockCharacters);
    });

    it('should handle initialization errors', async () => {
      mockSelectRandomScene.mockRejectedValue(new Error('API Error'));

      await expect(storyEngine.initializeStory('room123', mockMovieData, mockCharacters))
        .rejects.toThrow('Failed to initialize story');
    });
  });

  describe('generateChoicesForPlayer', () => {
    beforeEach(async () => {
      // Initialize a story first
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins...';
      
      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);
      
      await storyEngine.initializeStory('room123', { scenes: [mockScene] }, ['Harry Potter']);
    });

    it('should generate choices for a player', async () => {
      const mockChoices = [
        { id: 'choice-1', text: 'Cast a spell', character: 'Harry Potter' },
        { id: 'choice-2', text: 'Sneak around', character: 'Harry Potter' },
        { id: 'choice-3', text: 'Rally friends', character: 'Harry Potter' }
      ];

      mockGenerateCharacterChoices.mockResolvedValue(mockChoices);

      const result = await storyEngine.generateChoicesForPlayer('room123', 'Harry Potter');

      expect(result).toEqual(mockChoices);
      expect(mockGenerateCharacterChoices).toHaveBeenCalledWith(
        expect.objectContaining({
          scene: expect.any(Object),
          previousChoices: [],
          sceneDescription: 'The story begins...',
          turnCount: 0
        }),
        'Harry Potter'
      );
    });

    it('should handle missing story', async () => {
      await expect(storyEngine.generateChoicesForPlayer('nonexistent', 'Harry Potter'))
        .rejects.toThrow('Story not found');
    });
  });

  describe('processPlayerChoice', () => {
    beforeEach(async () => {
      // Initialize a story first
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins...';
      
      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);
      
      await storyEngine.initializeStory('room123', { scenes: [mockScene] }, ['Harry Potter']);
    });

    it('should process a player choice and advance the story', async () => {
      const mockChoice = { id: 'choice-1', text: 'Cast a spell', reasoning: 'Magic solution' };
      const mockSegment = {
        content: 'Harry cast the spell with determination...',
        character: 'Harry Potter',
        choice: 'Cast a spell',
        turnCount: 1
      };

      mockProcessChoiceAndGenerateSegment.mockResolvedValue(mockSegment);

      const result = await storyEngine.processPlayerChoice('room123', 'Harry Potter', mockChoice);

      expect(result).toHaveProperty('storyState');
      expect(result).toHaveProperty('newSegment', mockSegment);
      expect(result.storyState.turnCount).toBe(1);
      expect(result.storyState.segments).toHaveLength(1);
      expect(result.storyState.segments[0]).toEqual(mockSegment);
    });

    it('should handle missing story', async () => {
      const mockChoice = { id: 'choice-1', text: 'Cast a spell' };

      await expect(storyEngine.processPlayerChoice('nonexistent', 'Harry Potter', mockChoice))
        .rejects.toThrow('Story not found');
    });
  });

  describe('checkAndCompleteStory', () => {
    beforeEach(async () => {
      // Initialize a story first
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins...';
      
      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);
      
      await storyEngine.initializeStory('room123', { scenes: [mockScene] }, ['Harry Potter']);
    });

    it('should complete a story when conditions are met', async () => {
      const mockCompletion = {
        isComplete: true,
        conclusion: 'The adventure comes to an end...',
        storyState: { isComplete: true, completedAt: new Date().toISOString() }
      };
      const mockScript = 'ALTERNATE SCRIPT: Test Scene - Alternate Version';

      mockDetectAndCompleteStory.mockResolvedValue(mockCompletion);
      mockGenerateAlternateScript.mockResolvedValue(mockScript);

      const result = await storyEngine.checkAndCompleteStory('room123');

      expect(result.isComplete).toBe(true);
      expect(result.conclusion).toBe('The adventure comes to an end...');
      expect(result.storyState.alternateScript).toBe(mockScript);
    });

    it('should handle incomplete story', async () => {
      const mockCompletion = {
        isComplete: false,
        storyState: { isComplete: false }
      };

      mockDetectAndCompleteStory.mockResolvedValue(mockCompletion);

      const result = await storyEngine.checkAndCompleteStory('room123');

      expect(result.isComplete).toBe(false);
      expect(mockGenerateAlternateScript).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should get story state', async () => {
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins...';
      
      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);
      
      await storyEngine.initializeStory('room123', { scenes: [mockScene] }, ['Harry Potter']);

      const storyState = storyEngine.getStoryState('room123');
      expect(storyState).toHaveProperty('roomId', 'room123');
    });

    it('should remove story', async () => {
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins...';
      
      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);
      
      await storyEngine.initializeStory('room123', { scenes: [mockScene] }, ['Harry Potter']);

      storyEngine.removeStory('room123');
      const storyState = storyEngine.getStoryState('room123');
      expect(storyState).toBeUndefined();
    });

    it('should get active story rooms', async () => {
      const mockScene = { id: 1, title: 'Test Scene', context: 'Test context' };
      const mockBaseContent = 'The story begins...';
      
      mockSelectRandomScene.mockResolvedValue(mockScene);
      mockGenerateBaseContent.mockResolvedValue(mockBaseContent);
      
      await storyEngine.initializeStory('room123', { scenes: [mockScene] }, ['Harry Potter']);
      await storyEngine.initializeStory('room456', { scenes: [mockScene] }, ['Hermione Granger']);

      const activeRooms = storyEngine.getActiveStoryRooms();
      expect(activeRooms).toContain('room123');
      expect(activeRooms).toContain('room456');
      expect(activeRooms).toHaveLength(2);
    });
  });
});