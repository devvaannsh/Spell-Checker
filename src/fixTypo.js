define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");

    const Helper = require("./helper");
    const UI = require("./UI");
    const Driver = require("./driver");

    /**
     * This function fixes the current misspelled word at cursor position
     */
    function fixCurrentTypo() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        const errors = UI.getErrors();
        const success = Helper.fixCurrentMisspelledWord(editor, errors);

        if (success) {
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
     * Get the current misspelled word and its suggestion for display in menu
     * @returns {Object|null} - object with word and suggestion, or null if no misspelled word
     */
    function getCurrentTypoInfo() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return null;
        }

        const errors = UI.getErrors();
        const currentMisspelledWord = Helper.getCurrentMisspelledWord(editor, errors);

        if (currentMisspelledWord && currentMisspelledWord.error.suggestion) {
            return {
                word: currentMisspelledWord.word,
                suggestion: currentMisspelledWord.error.suggestion
            };
        }

        return null;
    }

    exports.fixCurrentTypo = fixCurrentTypo;
    exports.isCurrentWordMisspelled = isCurrentWordMisspelled;
    exports.getCurrentTypoInfo = getCurrentTypoInfo;
});
