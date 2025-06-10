define(function (require, exports, module) {
    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    const PREFS_KEY = "spell-checker";

    const prefs = PreferencesManager.getExtensionPrefs(PREFS_KEY);

    // all spell checker settings will come inside this
    const PREF_SPELL_CHECKER = "spellChecker";

    // default spell checker settings object
    const DEFAULT_SPELL_CHECKER_SETTINGS = {
        ignoredWords: [],
        dictionaryWords: []
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

    exports.getIgnoredWords = getIgnoredWords;
    exports.getDictionaryWords = getDictionaryWords;
    exports.addToIgnoredWords = addToIgnoredWords;
    exports.addToDictionaryWords = addToDictionaryWords;
});
