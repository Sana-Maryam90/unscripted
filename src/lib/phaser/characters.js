// Character key mapping and constants for the wizarding world
export const CHAR_ID_TO_KEY = {
    // Direct character keys (primary mapping)
    'female_wizard_1': 'female_wizard_1',
    'female_wizard_2': 'female_wizard_2',
    'male_wizard_1': 'male_wizard_1',
    'male_wizard_2': 'male_wizard_2'
};

export const ACTIONS = [
    'walk', 'backslash', 'climb', 'combat_idle', 'emote', 'halfslash', 'hurt', 'idle',
    'jump', 'run', 'shoot', 'sit', 'slash', 'spellcast', 'thrust'
];

export const DIRS = ['up', 'left', 'down', 'right'];

export const getCharacterKey = (charId) => {
    return CHAR_ID_TO_KEY[charId] || 'male_wizard_1';
};