define(function (require, exports, module) {
	const EditorManager = brackets.getModule("editor/EditorManager");

	const Helper = require("./helper");
	const UI = require("./UI");

	const IGNORED_WORDS = [];

    function addToIgnoredWords(word) {
        IGNORED_WORDS.push(word);
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
    	return IGNORED_WORDS;
    }

    exports.addToIgnoredWords = addToIgnoredWords;
    exports.addCurrentWordToIgnored = addCurrentWordToIgnored;
    exports.isCurrentWordMisspelled = isCurrentWordMisspelled;
    exports.getIgnoredWords = getIgnoredWords;
});
