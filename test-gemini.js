// Simple test script to verify Gemini API integration
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  selectRandomScene,
  generateBaseContent,
  generateCharacterChoices,
  validateContent,
  validateCharacterChoices
} from './src/lib/gemini.js';

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini API Integration...\n');

  try {
    // Load Harry Potter data
    const dataPath = join(process.cwd(), 'data', 'movies', 'harryPotter.json');
    const rawData = readFileSync(dataPath, 'utf8');
    const harryPotterData = JSON.parse(rawData);

    console.log('📚 Loaded Harry Potter data with', harryPotterData.scenes.length, 'scenes');

    // Test 1: Scene Selection
    console.log('\n1️⃣ Testing scene selection...');
    const selectedScene = await selectRandomScene(harryPotterData);
    console.log('✅ Selected scene:', selectedScene.title);
    console.log('📝 Enhanced description length:', selectedScene.enhancedDescription.length);

    // Test 2: Base Content Generation
    console.log('\n2️⃣ Testing base content generation...');
    const baseContent = await generateBaseContent(selectedScene, harryPotterData.characters);
    console.log('✅ Generated base content length:', baseContent.length);
    console.log('📝 Content preview:', baseContent.substring(0, 100) + '...');

    // Test 3: Character Choices
    console.log('\n3️⃣ Testing character choice generation...');
    const context = {
      scene: selectedScene,
      previousChoices: [],
      sceneDescription: baseContent
    };
    const choices = await generateCharacterChoices(context, 'Harry Potter');
    console.log('✅ Generated', choices.length, 'choices for Harry Potter');
    choices.forEach((choice, i) => {
      console.log(`   ${i + 1}. ${choice.text}`);
    });

    // Test 4: Content Validation
    console.log('\n4️⃣ Testing content validation...');
    const contentValidation = validateContent(baseContent);
    console.log('✅ Content validation:', contentValidation.isValid ? 'PASSED' : 'FAILED');
    if (!contentValidation.isValid) {
      console.log('❌ Issues:', contentValidation.issues);
    }

    // Test 5: Choice Validation
    console.log('\n5️⃣ Testing choice validation...');
    const choiceValidation = validateCharacterChoices(choices, 'Harry Potter');
    console.log('✅ Choice validation:', choiceValidation.isValid ? 'PASSED' : 'FAILED');
    if (!choiceValidation.isValid) {
      console.log('❌ Issues:', choiceValidation.issues);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Scene: ${selectedScene.title}`);
    console.log(`   - Base content: ${baseContent.length} characters`);
    console.log(`   - Choices generated: ${choices.length}`);
    console.log(`   - Content valid: ${contentValidation.isValid}`);
    console.log(`   - Choices valid: ${choiceValidation.isValid}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGeminiIntegration();
}

export default testGeminiIntegration;