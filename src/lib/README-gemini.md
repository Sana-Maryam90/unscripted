# Gemini API Integration

This module provides comprehensive integration with Google's Gemini API for the Multiplayer Cinema Storytelling Game. It handles story generation, character-specific choices, and narrative progression.

## Features

- **Scene Selection**: Randomly selects and enhances scenes from movie data
- **Base Content Generation**: Creates authentic story descriptions from source material
- **Character-Specific Choices**: Generates contextual choices based on character personalities
- **Story Progression**: Processes choices and generates narrative segments
- **Story Completion**: Detects completion conditions and generates conclusions
- **Error Handling**: Comprehensive fallback mechanisms and retry logic
- **Content Validation**: Ensures generated content meets quality standards

## API Functions

### Scene Management

#### `selectRandomScene(movieData)`
Randomly selects a scene from the movie data and enhances it with Gemini API.

```javascript
const scene = await selectRandomScene(harryPotterData);
// Returns: { id, title, context, enhancedDescription, originalContext }
```

#### `generateBaseContent(scene, characters)`
Creates the opening content that describes the scene exactly as in the source material.

```javascript
const baseContent = await generateBaseContent(scene, ['Harry Potter', 'Hermione']);
// Returns: String with 2-3 paragraphs of scene description
```

### Choice Generation

#### `generateCharacterChoices(context, character)`
Generates 3 character-specific choices for the current story context.

```javascript
const choices = await generateCharacterChoices(context, 'Harry Potter');
// Returns: Array of { id, text, reasoning, impact, character }
```

### Story Progression

#### `processChoiceAndGenerateSegment(choiceContext)`
Processes a player's choice and generates the next narrative segment.

```javascript
const segment = await processChoiceAndGenerateSegment({
  choice,
  character,
  scene,
  previousSegments,
  turnCount
});
// Returns: { content, character, choice, turnCount, timestamp, wordCount }
```

#### `manageStoryCycle(storyState)`
Manages the story cycle for 4-5 choice iterations.

```javascript
const cycleInfo = manageStoryCycle(storyState);
// Returns: { shouldContinue, nextPhase, turnsRemaining, progressPercentage }
```

#### `detectAndCompleteStory(storyState)`
Detects completion conditions and generates natural conclusions.

```javascript
const completion = await detectAndCompleteStory(storyState);
// Returns: { isComplete, conclusion?, storyState }
```

### Validation

#### `validateContent(content, context)`
Validates generated content for appropriateness and coherence.

```javascript
const validation = validateContent(content);
// Returns: { isValid, issues, content }
```

#### `validateCharacterChoices(choices, character, context)`
Validates character choices for coherence and appropriateness.

```javascript
const validation = validateCharacterChoices(choices, 'Harry Potter');
// Returns: { isValid, issues, choices }
```

### Utility

#### `retryWithBackoff(apiCall, maxRetries, baseDelay)`
Retry mechanism for API calls with exponential backoff.

```javascript
const result = await retryWithBackoff(() => apiCall(), 3, 1000);
```

## Error Handling

The module includes comprehensive error handling:

- **API Failures**: Automatic fallback to pre-written content
- **Network Issues**: Retry with exponential backoff
- **Invalid Responses**: JSON parsing error handling
- **Content Validation**: Quality checks with fallback options

## Environment Setup

Ensure you have the Gemini API key configured:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage Example

```javascript
import {
  selectRandomScene,
  generateBaseContent,
  generateCharacterChoices,
  processChoiceAndGenerateSegment
} from './gemini.js';

// Initialize story
const scene = await selectRandomScene(movieData);
const baseContent = await generateBaseContent(scene, characters);

// Generate choices for player
const context = { scene, previousChoices: [], sceneDescription: baseContent };
const choices = await generateCharacterChoices(context, 'Harry Potter');

// Process player choice
const choiceContext = {
  choice: choices[0],
  character: 'Harry Potter',
  scene,
  previousSegments: [],
  turnCount: 1
};
const segment = await processChoiceAndGenerateSegment(choiceContext);
```

## Testing

The module includes comprehensive unit tests and integration tests:

- **Unit Tests**: `src/lib/__tests__/gemini.test.js`
- **Integration Tests**: `src/lib/__tests__/gemini.integration.test.js`
- **Manual Testing**: `test-gemini.js`

Run tests with:
```bash
npm test
```

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **10.1**: Uses Gemini API to select random scenes from harryPotter.json
- **10.2**: Describes scenes exactly as written in source material
- **10.3**: Generates character-relative choices specific to context
- **10.4**: Processes choices and generates next narrative segments
- **10.5**: Repeats choice-generation cycle for 4-5 iterations
- **10.6**: Each segment contains at least one full paragraph of professional text
- **10.7**: Provides fallback content and retry mechanisms for API failures

## Performance Considerations

- **Caching**: Consider implementing response caching for repeated requests
- **Rate Limiting**: Built-in retry mechanisms respect API rate limits
- **Memory Management**: Automatic cleanup of inactive stories
- **Timeout Handling**: 30-second timeout for AI generation operations

## Future Enhancements

- **Content Caching**: Cache frequently used content to reduce API calls
- **Advanced Validation**: More sophisticated content quality checks
- **Multi-language Support**: Generate content in different languages
- **Custom Prompts**: Allow customization of generation prompts
- **Analytics**: Track generation quality and user preferences