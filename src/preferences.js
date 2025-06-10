define(function (require, exports, module) {
    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    const PREFS_KEY = "spell-checker";
    const DEFAULT_IGNORED_WORDS = [];
    const DEFAULT_DICTIONARY_WORDS = [];

    const prefs = PreferencesManager.getExtensionPrefs(PREFS_KEY);

    // preference keys
    const PREF_IGNORED_WORDS = "ignoredWords";
    const PREF_DICTIONARY_WORDS = "dictionaryWords";

    // default values
    prefs.definePreference(PREF_IGNORED_WORDS, "array", DEFAULT_IGNORED_WORDS);
    prefs.definePreference(PREF_DICTIONARY_WORDS, "array", DEFAULT_DICTIONARY_WORDS);

    /**
     * Get ignored words from preferences
     * @returns {Array} - array of ignored words
     */
    function getIgnoredWords() {
        return prefs.get(PREF_IGNORED_WORDS) || [];
    }

    /**
     * Get dictionary words from preferences
     * @returns {Array} - array of dictionary words
     */
    function getDictionaryWords() {
        return prefs.get(PREF_DICTIONARY_WORDS) || [];
    }

    /**
     * Add a word to ignored words list
     * @param {string} word - the word to ignore
     */
    function addToIgnoredWords(word) {
        if (!word || typeof word !== "string") {
            return;
        }

        const ignoredWords = getIgnoredWords();
        if (ignoredWords.indexOf(word) === -1) {
            ignoredWords.push(word);
            prefs.set(PREF_IGNORED_WORDS, ignoredWords);
            prefs.save();
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

        const dictionaryWords = getDictionaryWords();
        if (dictionaryWords.indexOf(word) === -1) {
            dictionaryWords.push(word);
            prefs.set(PREF_DICTIONARY_WORDS, dictionaryWords);
            prefs.save();
        }
    }

    exports.getIgnoredWords = getIgnoredWords;
    exports.getDictionaryWords = getDictionaryWords;
    exports.addToIgnoredWords = addToIgnoredWords;
    exports.addToDictionaryWords = addToDictionaryWords;
});
