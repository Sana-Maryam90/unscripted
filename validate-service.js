/**
 * Validation script for CharacterAssetDiscovery service
 * Tests the service against actual asset files
 */

import CharacterAssetDiscovery from './src/services/CharacterAssetDiscovery.js';

async function validateService() {
    console.log('🧙 Validating CharacterAssetDiscovery Service...\n');

    try {
        // Test 1: Get all available characters
        console.log('📋 Test 1: Getting available characters...');
        const characters = await CharacterAssetDiscovery.getAvailableCharacters('wizarding');
        console.log(`✅ Found ${characters.length} characters:`, characters.map(c => c.id));

        // Test 2: Validate each character has required data
        console.log('\n📋 Test 2: Validating character data...');
        for (const character of characters) {
            console.log(`\n🧙 Character: ${character.name} (${character.id})`);
            console.log(`   Actions: ${character.availableActions.join(', ')}`);
            console.log(`   Frame counts:`, Object.entries(character.spriteFrames).map(([action, data]) => `${action}:${data.frameCount}`).join(', '));

            // Validate required actions
            const hasRequired = CharacterAssetDiscovery.validateCharacterAssets(character.availableActions);
            console.log(`   Has required actions: ${hasRequired ? '✅' : '❌'}`);
        }

        // Test 3: Test character actions detection
        console.log('\n📋 Test 3: Testing action detection for female_wizard_1...');
        const actions = await CharacterAssetDiscovery.getCharacterActions('wizarding', 'female_wizard_1');
        console.log(`✅ Detected actions: ${actions.join(', ')}`);

        // Test 4: Test frame count calculation
        console.log('\n📋 Test 4: Testing frame count calculation...');
        try {
            const frameCount = await CharacterAssetDiscovery.calculateFrameCount('/assets/wizarding/player_characters/female_wizard_1/walk.png');
            console.log(`✅ Walk animation frames: ${frameCount}`);
        } catch (error) {
            console.log(`❌ Frame count calculation failed: ${error.message}`);
        }

        // Test 5: Test character preview
        console.log('\n📋 Test 5: Testing character preview...');
        const preview = await CharacterAssetDiscovery.getCharacterPreview('wizarding', 'female_wizard_1');
        if (preview) {
            console.log(`✅ Preview: ${preview.name} using ${preview.previewAction} action`);
            console.log(`   Preview path: ${preview.previewPath}`);
        } else {
            console.log('❌ Failed to get character preview');
        }

        // Test 6: Test character existence check
        console.log('\n📋 Test 6: Testing character existence...');
        const exists = await CharacterAssetDiscovery.characterExists('wizarding', 'female_wizard_1');
        const notExists = await CharacterAssetDiscovery.characterExists('wizarding', 'nonexistent_character');
        console.log(`✅ female_wizard_1 exists: ${exists}`);
        console.log(`✅ nonexistent_character exists: ${notExists}`);

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    validateService();
}

export { validateService };