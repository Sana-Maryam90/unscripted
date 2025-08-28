// Utility functions for the application

/**
 * Combine class names conditionally
 * @param {...(string|undefined|null|false)} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a random room code
 * @param {number} length - Length of the room code
 * @returns {string} Random room code
 */
export function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique player ID
 * @returns {string} Unique player ID
 */
export function generatePlayerId() {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique room ID
 * @returns {string} Unique room ID
 */
export function generateRoomId() {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate room code format
 * @param {string} code - Room code to validate
 * @returns {boolean} True if valid
 */
export function isValidRoomCode(code) {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Format player name for display
 * @param {string} name - Player name
 * @returns {string} Formatted name
 */
export function formatPlayerName(name) {
  return name.trim().slice(0, 20);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if user is on mobile device
 * @returns {boolean} True if mobile
 */
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Format timestamp for display
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted time
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Shuffle array in place
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}