define(function (require, exports, module) {
	const EditorManager = brackets.getModule("editor/EditorManager");

	const Helper = require("./helper");
	const UI = require("./UI");
    const Driver = require("./driver");
    const Preferences = require("./preferences");

    function addToIgnoredWords(word) {
        Preferences.addToIgnoredWords(word);
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

    function getIgnoredWords() {
    	return Preferences.getIgnoredWords();
    }

    exports.addToIgnoredWords = addToIgnoredWords;
    exports.addCurrentWordToIgnored = addCurrentWordToIgnored;
    exports.isCurrentWordMisspelled = isCurrentWordMisspelled;
    exports.getIgnoredWords = getIgnoredWords;
});
