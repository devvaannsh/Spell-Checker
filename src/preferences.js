define(function (require, exports, module) {
    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    const PREFS_KEY = "spell-checker";

    const prefs = PreferencesManager.getExtensionPrefs(PREFS_KEY);

    // all spell checker settings will come inside this
    const PREF_SPELL_CHECKER = "spellChecker";

    // default spell checker settings object
    const DEFAULT_SPELL_CHECKER_SETTINGS = {
        ignoredWords: [],
        dictionaryWords: [],
        disabled: false,
        disabledFiles: []
    };

    // the single spellChecker preference object
    prefs.definePreference(PREF_SPELL_CHECKER, "object", DEFAULT_SPELL_CHECKER_SETTINGS);

    /**
     * Get the current spell checker settings object
     * @returns {Object} - spell checker settings object
     */
    function getSpellCheckerSettings() {
        return prefs.get(PREF_SPELL_CHECKER) || DEFAULT_SPELL_CHECKER_SETTINGS;
    }

    /**
     * Save the spell checker settings object
     * @param {Object} settings - the settings object to save
     */
    function saveSpellCheckerSettings(settings) {
        prefs.set(PREF_SPELL_CHECKER, settings);
        prefs.save();
    }

    /**
     * Get ignored words from preferences
     * @returns {Array} - array of ignored words
     */
    function getIgnoredWords() {
        const settings = getSpellCheckerSettings();
        return settings.ignoredWords || [];
    }

    /**
     * Get dictionary words from preferences
     * @returns {Array} - array of dictionary words
     */
    function getDictionaryWords() {
        const settings = getSpellCheckerSettings();
        return settings.dictionaryWords || [];
    }

    /**
     * Add a word to ignored words list
     * @param {string} word - the word to ignore
     */
    function addToIgnoredWords(word) {
        if (!word || typeof word !== "string") {
            return;
        }

        const settings = getSpellCheckerSettings();
        if (settings.ignoredWords.indexOf(word) === -1) {
            settings.ignoredWords.push(word);
            saveSpellCheckerSettings(settings);
        }
    }

    /**
     * Add a word to dictionary words list
     * @param {string} word - the word to add to dictionary
     */
    function addToDictionaryWords(word) {
        if (!word || typeof word !== "string") {
            return;
        }

        const settings = getSpellCheckerSettings();
        if (settings.dictionaryWords.indexOf(word) === -1) {
            settings.dictionaryWords.push(word);
            saveSpellCheckerSettings(settings);
        }
    }

    /**
     * Check if a word is in the ignored words list (case-insensitive)
     * @param {string} word - the word to check
     * @returns {boolean} - true if word is in ignored words list
     */
    function isWordIgnored(word) {
        if (!word || typeof word !== "string") {
            return false;
        }

        const settings = getSpellCheckerSettings();
        const ignoredWords = settings.ignoredWords || [];

        // Case-insensitive comparison
        const lowerWord = word.toLowerCase();
        return ignoredWords.some(ignoredWord => ignoredWord.toLowerCase() === lowerWord);
    }

    /**
     * Check if a word is in the dictionary words list (case-insensitive)
     * @param {string} word - the word to check
     * @returns {boolean} - true if word is in dictionary words list
     */
    function isWordInDictionary(word) {
        if (!word || typeof word !== "string") {
            return false;
        }

        const settings = getSpellCheckerSettings();
        const dictionaryWords = settings.dictionaryWords || [];

        // Case-insensitive comparison
        const lowerWord = word.toLowerCase();
        return dictionaryWords.some(dictWord => dictWord.toLowerCase() === lowerWord);
    }

    /**
     * Helper function to find the exact case match in ignored words list
     * @param {string} word - the word to find
     * @returns {string|null} - the exact match from the list or null if not found
     */
    function findIgnoredWordExactCase(word) {
        if (!word || typeof word !== "string") {
            return null;
        }

        const settings = getSpellCheckerSettings();
        const ignoredWords = settings.ignoredWords || [];
        const lowerWord = word.toLowerCase();

        return ignoredWords.find(ignoredWord => ignoredWord.toLowerCase() === lowerWord) || null;
    }

    /**
     * Helper function to find the exact case match in dictionary words list
     * @param {string} word - the word to find
     * @returns {string|null} - the exact match from the list or null if not found
     */
    function findDictionaryWordExactCase(word) {
        if (!word || typeof word !== "string") {
            return null;
        }

        const settings = getSpellCheckerSettings();
        const dictionaryWords = settings.dictionaryWords || [];
        const lowerWord = word.toLowerCase();

        return dictionaryWords.find(dictWord => dictWord.toLowerCase() === lowerWord) || null;
    }

    /**
     * Remove a word from ignored words list (case-insensitive)
     * @param {string} word - the word to remove from ignored words
     */
    function removeFromIgnoredWords(word) {
        if (!word || typeof word !== "string") {
            return;
        }

        const settings = getSpellCheckerSettings();
        const exactMatch = findIgnoredWordExactCase(word);

        if (exactMatch) {
            const wordIndex = settings.ignoredWords.indexOf(exactMatch);
            if (wordIndex !== -1) {
                settings.ignoredWords.splice(wordIndex, 1);
                saveSpellCheckerSettings(settings);
            }
        }
    }

    /**
     * Remove a word from dictionary words list (case-insensitive)
     * @param {string} word - the word to remove from dictionary
     */
    function removeFromDictionaryWords(word) {
        if (!word || typeof word !== "string") {
            return;
        }

        const settings = getSpellCheckerSettings();
        const exactMatch = findDictionaryWordExactCase(word);

        if (exactMatch) {
            const wordIndex = settings.dictionaryWords.indexOf(exactMatch);
            if (wordIndex !== -1) {
                settings.dictionaryWords.splice(wordIndex, 1);
                saveSpellCheckerSettings(settings);
            }
        }
    }

    /**
     * Check if spell checker is disabled
     * @returns {boolean} - true if spell checker is disabled
     */
    function isSpellCheckerDisabled() {
        const settings = getSpellCheckerSettings();
        return settings.disabled === true;
    }

    /**
     * Set spell checker disabled state
     * @param {boolean} disabled - true to disable spell checker, false to enable
     */
    function setSpellCheckerDisabled(disabled) {
        const settings = getSpellCheckerSettings();
        settings.disabled = disabled === true;
        saveSpellCheckerSettings(settings);
    }

    /**
     * Check if spell checker is disabled for a specific file
     * @param {string} filePath - the file path to check
     * @returns {boolean} - true if spell checker is disabled for this file
     */
    function isSpellCheckerDisabledForFile(filePath) {
        if (!filePath) return false;

        const settings = getSpellCheckerSettings();
        const disabledFiles = settings.disabledFiles || [];
        return disabledFiles.indexOf(filePath) !== -1;
    }

    /**
     * Set spell checker disabled state for a specific file
     * @param {string} filePath - the file path
     * @param {boolean} disabled - true to disable spell checker for this file, false to enable
     */
    function setSpellCheckerDisabledForFile(filePath, disabled) {
        if (!filePath) return;

        const settings = getSpellCheckerSettings();
        if (!settings.disabledFiles) {
            settings.disabledFiles = [];
        }

        const fileIndex = settings.disabledFiles.indexOf(filePath);

        if (disabled && fileIndex === -1) {
            // Add file to disabled list
            settings.disabledFiles.push(filePath);
            saveSpellCheckerSettings(settings);
        } else if (!disabled && fileIndex !== -1) {
            // Remove file from disabled list
            settings.disabledFiles.splice(fileIndex, 1);
            saveSpellCheckerSettings(settings);
        }
    }

    exports.getIgnoredWords = getIgnoredWords;
    exports.getDictionaryWords = getDictionaryWords;
    exports.addToIgnoredWords = addToIgnoredWords;
    exports.addToDictionaryWords = addToDictionaryWords;
    exports.removeFromIgnoredWords = removeFromIgnoredWords;
    exports.removeFromDictionaryWords = removeFromDictionaryWords;
    exports.isWordIgnored = isWordIgnored;
    exports.isWordInDictionary = isWordInDictionary;
    exports.findIgnoredWordExactCase = findIgnoredWordExactCase;
    exports.findDictionaryWordExactCase = findDictionaryWordExactCase;
    exports.isSpellCheckerDisabled = isSpellCheckerDisabled;
    exports.setSpellCheckerDisabled = setSpellCheckerDisabled;
    exports.isSpellCheckerDisabledForFile = isSpellCheckerDisabledForFile;
    exports.setSpellCheckerDisabledForFile = setSpellCheckerDisabledForFile;
});
