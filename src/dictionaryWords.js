define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");

    const Helper = require("./helper");
    const UI = require("./UI");
    const Driver = require("./driver");
    const Preferences = require("./preferences");

    function addToDictionaryWords(word) {
        Preferences.addToDictionaryWords(word);
    }

    function removeFromDictionaryWords(word) {
        Preferences.removeFromDictionaryWords(word);
    }

    /**
     * This function gets the current misspelled word at cursor position and adds it to dictionary words
     */
    function addCurrentWordToDictionary() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        const errors = UI.getErrors();
        const currentMisspelledWord = Helper.getCurrentMisspelledWord(editor, errors);

        if (currentMisspelledWord) {
            addToDictionaryWords(currentMisspelledWord.word);

            // trigger spell check immediately to reflect changes
            Driver.driver();
        }
    }

    /**
     * This function gets the current word at cursor position and removes it from dictionary words
     */
    function removeCurrentWordFromDictionary() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        // Use getCurrentWord to get the word regardless of misspelling status
        const currentWord = Helper.getCurrentWord(editor);

        if (currentWord && Preferences.isWordInDictionary(currentWord)) {
            removeFromDictionaryWords(currentWord);

            // trigger spell check immediately to reflect changes
            Driver.driver();
        }
    }

    /**
     * This function checks if the current word is in the dictionary words list
     * @returns {boolean} - true if current word is in dictionary, false otherwise
     */
    function isCurrentWordInDictionary() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return false;
        }

        const currentWord = Helper.getCurrentWord(editor);

        if (currentWord) {
            return Preferences.isWordInDictionary(currentWord);
        }

        return false;
    }

    function getDictionaryWords() {
        return Preferences.getDictionaryWords();
    }

    exports.addToDictionaryWords = addToDictionaryWords;
    exports.removeFromDictionaryWords = removeFromDictionaryWords;
    exports.addCurrentWordToDictionary = addCurrentWordToDictionary;
    exports.removeCurrentWordFromDictionary = removeCurrentWordFromDictionary;
    exports.isCurrentWordInDictionary = isCurrentWordInDictionary;
    exports.getDictionaryWords = getDictionaryWords;
});
