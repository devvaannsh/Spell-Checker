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

    /**
     * This function removes all words in the current file that are in the dictionary words list
     * from the dictionary words list
     */
    function removeAllWordsFromDictionary() {
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

        // Find words that are both in the file and in the dictionary list (case-insensitive)
        const wordsToRemove = [];
        allWordsInFile.forEach(function(word) {
            // Check if this word is in dictionary (case-insensitive)
            if (Preferences.isWordInDictionary(word)) {
                // Find the exact case match in dictionary words to remove
                const exactMatch = Preferences.findDictionaryWordExactCase(word);
                if (exactMatch && wordsToRemove.indexOf(exactMatch) === -1) {
                    wordsToRemove.push(exactMatch);
                }
            }
        });

        // Remove each word from the dictionary list
        wordsToRemove.forEach(function(word) {
            removeFromDictionaryWords(word);
        });

        // trigger spell check immediately to reflect changes if any words were removed
        if (wordsToRemove.length > 0) {
            Driver.driver();
        }
    }

    /**
     * This function checks if there are any dictionary words in the current file
     * @returns {boolean} - true if there are dictionary words in the file, false otherwise
     */
    function hasDictionaryWordsInFile() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return false;
        }

        const allWordsInFile = Helper.getAllWordsInFile(editor);

        // Check if any word in the file is in the dictionary list (case-insensitive)
        for (let i = 0; i < allWordsInFile.length; i++) {
            if (Preferences.isWordInDictionary(allWordsInFile[i])) {
                return true;
            }
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
    exports.removeAllWordsFromDictionary = removeAllWordsFromDictionary;
    exports.hasDictionaryWordsInFile = hasDictionaryWordsInFile;
    exports.getDictionaryWords = getDictionaryWords;
});
