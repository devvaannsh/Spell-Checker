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
     * This function fixes all misspelled words in the current file
     */
    function fixAllTyposInFile() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) {
            return;
        }

        const errors = UI.getErrors();
        if (!errors || errors.length === 0) {
            return;
        }

        const document = editor.document;
        let fixedCount = 0;

        try {
            // Sort errors by document offset in descending order
            // This ensures we fix from end to beginning, so offsets remain valid
            const sortedErrors = errors.slice().sort((a, b) => b.documentOffset - a.documentOffset);

            // Filter errors that have suggestions
            const fixableErrors = sortedErrors.filter(error => error.suggestion && error.suggestion.trim() !== "");

            if (fixableErrors.length === 0) {
                return;
            }

            // Batch all changes into a single undo operation
            document.batchOperation(function () {
                // Fix each error that has a suggestion
                for (let i = 0; i < fixableErrors.length; i++) {
                    const error = fixableErrors[i];
                    try {
                        // Replace the misspelled word with the suggestion
                        document.replaceRange(
                            error.suggestion,
                            { line: error.lineNumber, ch: error.lineCharStart },
                            { line: error.lineNumber, ch: error.lineCharEnd }
                        );
                        fixedCount++;
                    } catch (err) {
                        console.warn("Failed to fix typo:", error.text, err);
                    }
                }
            });

            if (fixedCount > 0) {
                // trigger spell check immediately to reflect changes
                Driver.driver();
            }
        } catch (error) {
            console.error("Failed to fix all typos:", error);
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

    /**
     * Check if there are any typos in the file that can be fixed
     * @returns {boolean} - true if there are fixable typos in the file
     */
    function hasFixableTyposInFile() {
        const errors = UI.getErrors();
        if (!errors || errors.length === 0) {
            return false;
        }

        // Check if any error has a suggestion
        for (let i = 0; i < errors.length; i++) {
            if (errors[i].suggestion && errors[i].suggestion.trim() !== "") {
                return true;
            }
        }

        return false;
    }

    exports.fixCurrentTypo = fixCurrentTypo;
    exports.fixAllTyposInFile = fixAllTyposInFile;
    exports.isCurrentWordMisspelled = isCurrentWordMisspelled;
    exports.getCurrentTypoInfo = getCurrentTypoInfo;
    exports.hasFixableTyposInFile = hasFixableTyposInFile;
});
