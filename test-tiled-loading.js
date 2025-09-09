// Simple test script to verify Tiled map loading
// This can be run in the browser console on the test-phaser page

console.log('🧪 Starting Tiled Map Loading Test...');

// Function to test the lobby scene
function testLobbyScene() {
    // Get the Phaser game instance from the global window
    const gameContainer = document.querySelector('#phaser-container');
    if (!gameContainer) {
        console.error('❌ Phaser container not found');
        return;
    }

    // Try to access the game instance
    const game = window.phaserGame || gameContainer.game;
    if (!game) {
        console.error('❌ Phaser game instance not found');
        return;
    }

    // Get the lobby scene
    const lobbyScene = game.scene.getScene('LobbyScene');
    if (!lobbyScene) {
        console.error('❌ LobbyScene not found');
        return;
    }

    console.log('✅ Found LobbyScene, running tests...');

    // Test the scene status
    const status = lobbyScene.getSceneStatus();
    console.log('📊 Scene Status:', status);

    // Test map loading
    const testResults = lobbyScene.testMapLoadingAndRendering();
    console.log('🧪 Test Results:', testResults);

    return {
        status,
        testResults
    };
}

// Export for browser console use
window.testLobbyScene = testLobbyScene;

console.log('🎯 Test functions loaded. Run testLobbyScene() in console to test.');