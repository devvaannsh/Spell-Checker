define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");

    const Helper = require("./helper");
    const UI = require("./UI");
    const Driver = require("./driver");
    const Preferences = require("./preferences");

    function addToIgnoredWords(word) {
        Preferences.addToIgnoredWords(word);
    }

    function removeFromIgnoredWords(word) {
        Preferences.removeFromIgnoredWords(word);
    }

    /**
     * This function gets the current misspelled word at cursor position and adds it to ignored words
     */
    function addCurrentWordToIgnored() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        const errors = UI.getErrors();
        const currentMisspelledWord = Helper.getCurrentMisspelledWord(editor, errors);

        if (currentMisspelledWord) {
            addToIgnoredWords(currentMisspelledWord.word);

            // trigger spell check immediately to reflect changes
            Driver.driver();
        }
    }

    /**
     * This function gets the current word at cursor position and removes it from ignored words
     */
    function removeCurrentWordFromIgnored() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        // Use getCurrentWord to get the word regardless of misspelling status
        const currentWord = Helper.getCurrentWord(editor);

        if (currentWord && Preferences.isWordIgnored(currentWord)) {
            removeFromIgnoredWords(currentWord);

            // trigger spell check immediately to reflect changes
            Driver.driver();
        }
    }

    /**
     * This function checks if there's a misspelled word at the current cursor position
     * @returns {boolean} - true if there's a misspelled word at cursor, false otherwise
     */
    function isCurrentWordMisspelled() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return false;
        }

        const errors = UI.getErrors();
        const currentMisspelledWord = Helper.getCurrentMisspelledWord(editor, errors);

        return currentMisspelledWord !== null;
    }

    /**
     * This function checks if the current word is in the ignored words list
     * @returns {boolean} - true if current word is ignored, false otherwise
     */
    function isCurrentWordIgnored() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return false;
        }

        const currentWord = Helper.getCurrentWord(editor);

        if (currentWord) {
            return Preferences.isWordIgnored(currentWord);
        }

        return false;
    }

    /**
     * This function removes all words in the current file that are in the ignored words list
     * from the ignored words list
     */
    function unignoreAllWordsInFile() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        const fileData = Helper.getFileData(editor);
        if (!fileData) {
            return;
        }

        // Get all words in the file
        const allWordsInFile = Helper.getAllWordsInFile(editor);
        const ignoredWords = Preferences.getIgnoredWords();

        // Find words that are both in the file and in the ignored list
        const wordsToUnignore = [];
        allWordsInFile.forEach(function(word) {
            if (ignoredWords.indexOf(word) !== -1 && wordsToUnignore.indexOf(word) === -1) {
                wordsToUnignore.push(word);
            }
        });

        // Remove each word from the ignored list
        wordsToUnignore.forEach(function(word) {
            removeFromIgnoredWords(word);
        });

        // trigger spell check immediately to reflect changes if any words were unignored
        if (wordsToUnignore.length > 0) {
            Driver.driver();
        }
    }

    /**
     * This function checks if there are any ignored words in the current file
     * @returns {boolean} - true if there are ignored words in the file, false otherwise
     */
    function hasIgnoredWordsInFile() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return false;
        }

        const allWordsInFile = Helper.getAllWordsInFile(editor);
        const ignoredWords = Preferences.getIgnoredWords();

        // Check if any word in the file is in the ignored list
        for (let i = 0; i < allWordsInFile.length; i++) {
            if (ignoredWords.indexOf(allWordsInFile[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    function getIgnoredWords() {
        return Preferences.getIgnoredWords();
    }

    exports.addToIgnoredWords = addToIgnoredWords;
    exports.removeFromIgnoredWords = removeFromIgnoredWords;
    exports.addCurrentWordToIgnored = addCurrentWordToIgnored;
    exports.removeCurrentWordFromIgnored = removeCurrentWordFromIgnored;
    exports.isCurrentWordMisspelled = isCurrentWordMisspelled;
    exports.isCurrentWordIgnored = isCurrentWordIgnored;
    exports.unignoreAllWordsInFile = unignoreAllWordsInFile;
    exports.hasIgnoredWordsInFile = hasIgnoredWordsInFile;
    exports.getIgnoredWords = getIgnoredWords;
});
