// Story Engine Service - Orchestrates the complete story generation workflow
import {
  selectRandomScene,
  generateBaseContent,
  generateCharacterChoices,
  processChoiceAndGenerateSegment,
  manageStoryCycle,
  detectAndCompleteStory,
  generateAlternateScript,
  retryWithBackoff
} from '../lib/gemini.js';

/**
 * Story Engine class that manages the complete storytelling workflow
 */
export class StoryEngine {
  constructor() {
    this.activeStories = new Map();
  }

  /**
   * Initializes a new story session
   * @param {string} roomId - Unique room identifier
   * @param {Object} movieData - Movie data from JSON file
   * @param {Array} characters - Selected characters
   * @returns {Promise<Object>} Initial story state
   */
  async initializeStory(roomId, movieData, characters) {
    try {
      console.log(`🎬 Initializing story for room ${roomId}`);

      // Select random scene using Gemini API
      const selectedScene = await retryWithBackoff(
        () => selectRandomScene(movieData),
        3,
        1000
      );

      // Generate base content
      const baseContent = await retryWithBackoff(
        () => generateBaseContent(selectedScene, characters),
        3,
        1000
      );

      // Initialize story state
      const storyState = {
        roomId,
        scene: selectedScene,
        characters,
        baseContent,
        segments: [],
        turnCount: 0,
        currentPlayerIndex: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Store in active stories
      this.activeStories.set(roomId, storyState);

      console.log(`✅ Story initialized for room ${roomId}: ${selectedScene.title}`);
      return storyState;
    } catch (error) {
      console.error(`❌ Error initializing story for room ${roomId}:`, error);
      throw new Error('Failed to initialize story');
    }
  }

  /**
   * Generates choices for the current player
   * @param {string} roomId - Room identifier
   * @param {string} character - Character making the choice
   * @returns {Promise<Array>} Array of choice objects
   */
  async generateChoicesForPlayer(roomId, character) {
    try {
      const storyState = this.activeStories.get(roomId);
      if (!storyState) {
        throw new Error('Story not found');
      }

      console.log(`🎯 Generating choices for ${character} in room ${roomId}`);

      const context = {
        scene: storyState.scene,
        previousChoices: storyState.segments.map(seg => ({
          character: seg.character,
          choice: seg.choice
        })),
        sceneDescription: storyState.baseContent,
        turnCount: storyState.turnCount
      };

      const choices = await retryWithBackoff(
        () => generateCharacterChoices(context, character),
        3,
        1000
      );

      console.log(`✅ Generated ${choices.length} choices for ${character}`);
      return choices;
    } catch (error) {
      console.error(`❌ Error generating choices for ${character}:`, error);
      throw new Error('Failed to generate choices');
    }
  }

  /**
   * Processes a player's choice and advances the story
   * @param {string} roomId - Room identifier
   * @param {string} character - Character who made the choice
   * @param {Object} choice - Selected choice object
   * @returns {Promise<Object>} Updated story state with new segment
   */
  async processPlayerChoice(roomId, character, choice) {
    try {
      const storyState = this.activeStories.get(roomId);
      if (!storyState) {
        throw new Error('Story not found');
      }

      console.log(`⚡ Processing choice for ${character} in room ${roomId}: ${choice.text}`);

      // Increment turn count
      storyState.turnCount += 1;

      // Generate story segment based on choice
      const choiceContext = {
        choice,
        character,
        scene: storyState.scene,
        previousSegments: storyState.segments,
        turnCount: storyState.turnCount
      };

      const newSegment = await retryWithBackoff(
        () => processChoiceAndGenerateSegment(choiceContext),
        3,
        1000
      );

      // Add segment to story
      storyState.segments.push(newSegment);
      storyState.lastUpdated = new Date().toISOString();

      // Manage story cycle
      const cycleInfo = manageStoryCycle(storyState);
      Object.assign(storyState, cycleInfo);

      // Update active stories
      this.activeStories.set(roomId, storyState);

      console.log(`✅ Processed choice for ${character}. Turn ${storyState.turnCount}/5`);
      return {
        storyState,
        newSegment,
        cycleInfo
      };
    } catch (error) {
      console.error(`❌ Error processing choice for ${character}:`, error);
      throw new Error('Failed to process choice');
    }
  }

  /**
   * Checks if story should be completed and generates conclusion
   * @param {string} roomId - Room identifier
   * @returns {Promise<Object>} Completion result
   */
  async checkAndCompleteStory(roomId) {
    try {
      const storyState = this.activeStories.get(roomId);
      if (!storyState) {
        throw new Error('Story not found');
      }

      console.log(`🏁 Checking story completion for room ${roomId}`);

      const completionResult = await retryWithBackoff(
        () => detectAndCompleteStory(storyState),
        3,
        1000
      );

      if (completionResult.isComplete) {
        // Generate alternate script
        const alternateScript = await retryWithBackoff(
          () => generateAlternateScript(completionResult.storyState),
          3,
          1000
        );

        completionResult.storyState.alternateScript = alternateScript;
        
        // Update stored state
        this.activeStories.set(roomId, completionResult.storyState);

        console.log(`🎉 Story completed for room ${roomId}`);
      }

      return completionResult;
    } catch (error) {
      console.error(`❌ Error checking story completion for room ${roomId}:`, error);
      throw new Error('Failed to check story completion');
    }
  }

  /**
   * Gets the current story state
   * @param {string} roomId - Room identifier
   * @returns {Object} Current story state
   */
  getStoryState(roomId) {
    return this.activeStories.get(roomId);
  }

  /**
   * Removes a story from active stories (cleanup)
   * @param {string} roomId - Room identifier
   */
  removeStory(roomId) {
    console.log(`🧹 Removing story for room ${roomId}`);
    this.activeStories.delete(roomId);
  }

  /**
   * Gets all active story room IDs
   * @returns {Array} Array of active room IDs
   */
  getActiveStoryRooms() {
    return Array.from(this.activeStories.keys());
  }

  /**
   * Cleans up inactive stories (older than 24 hours)
   */
  cleanupInactiveStories() {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [roomId, storyState] of this.activeStories.entries()) {
      const lastUpdated = new Date(storyState.lastUpdated);
      if (lastUpdated < cutoffTime) {
        console.log(`🧹 Cleaning up inactive story for room ${roomId}`);
        this.activeStories.delete(roomId);
      }
    }
  }
}

// Create singleton instance
export const storyEngine = new StoryEngine();

// Cleanup inactive stories every hour
setInterval(() => {
  storyEngine.cleanupInactiveStories();
}, 60 * 60 * 1000);

export default storyEngine;