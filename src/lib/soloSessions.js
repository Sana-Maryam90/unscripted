// Solo Session Manager - Simple session management without room logic
// This replaces room management for single-player games

class SoloSessionManager {
  constructor() {
    this.activeSessions = new Map();
  }

  /**
   * Creates a new solo session
   * @param {string} sessionId - Unique session identifier
   * @param {Object} sessionData - Session data
   * @returns {Object} Created session
   */
  createSession(sessionId, sessionData) {
    const session = {
      id: sessionId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isActive: true
    };

    this.activeSessions.set(sessionId, session);
    console.log(`🎮 Solo session created: ${sessionId}`);
    return session;
  }

  /**
   * Gets a solo session by ID
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session data or null if not found
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Updates a solo session
   * @param {string} sessionId - Session identifier
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated session or null if not found
   */
  updateSession(sessionId, updates) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return null;
    }

    const updatedSession = {
      ...session,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.activeSessions.set(sessionId, updatedSession);
    console.log(`🔄 Solo session updated: ${sessionId}`);
    return updatedSession;
  }

  /**
   * Removes a solo session
   * @param {string} sessionId - Session identifier
   * @returns {boolean} True if session was removed
   */
  removeSession(sessionId) {
    const removed = this.activeSessions.delete(sessionId);
    if (removed) {
      console.log(`🗑️ Solo session removed: ${sessionId}`);
    }
    return removed;
  }

  /**
   * Checks if a session exists
   * @param {string} sessionId - Session identifier
   * @returns {boolean} True if session exists
   */
  hasSession(sessionId) {
    return this.activeSessions.has(sessionId);
  }

  /**
   * Gets all active session IDs
   * @returns {Array} Array of active session IDs
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.keys());
  }

  /**
   * Cleans up inactive sessions (older than 24 hours)
   */
  cleanupInactiveSessions() {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const lastUpdated = new Date(session.lastUpdated);
      if (lastUpdated < cutoffTime) {
        console.log(`🧹 Cleaning up inactive solo session: ${sessionId}`);
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Gets session statistics
   * @returns {Object} Session statistics
   */
  getStats() {
    return {
      totalActiveSessions: this.activeSessions.size,
      sessionIds: Array.from(this.activeSessions.keys())
    };
  }
}

// Create singleton instance
export const soloSessionManager = new SoloSessionManager();

// Cleanup inactive sessions every hour
setInterval(() => {
  soloSessionManager.cleanupInactiveSessions();
}, 60 * 60 * 1000);

export default soloSessionManager;