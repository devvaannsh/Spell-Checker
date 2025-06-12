define(function (require, exports, module) {
    const CodeInspection = brackets.getModule("language/CodeInspection");

    /**
     * This function is responsible to get the file data from the active editor
     * @param {Editor} editor - the editor instance
     * @returns {Object | null} - an object containing the content and the filePath
     */
    function getFileData(editor) {
        try {
            // get the document from the editor
            const document = editor.document;
            if (!document) {
                return;
            }

            // retrieve all the required data from the document
            const content = document.getText();
            const filePath = document.file.fullPath;
            const language = document.getLanguage();

            return {
                content: content,
                filePath: filePath
            };
        } catch (error) {
            console.error("Something went wrong in the getFileData function", error);
            return;
        }
    }

    /**
     * This function is responsible to get the required data from the result issues.
     * this is needed because the API provides lots of unnecessary data that we might not need,
     * and also some data is not in the format as how we expect it to be
     * So this function actually gets the required data and in the format that Phoenix expects it to be.
     * @param {Array} resultIssues - the issues in the document found by the API
     * @param {Array<Object>} errors - an array of objects containing all the data that we need
     */
    function getRequiredDataFromErrors(resultIssues) {
        const errors = [];
        for (let i = 0; i < resultIssues.length; i++) {
            errors.push({
                text: resultIssues[i].text, // the spelling error word {String} ex: hallo
                textLength: resultIssues[i].length, // the length of the word which has the spelling error {Number} ex: 5
                documentOffset: resultIssues[i].offset, // the char pos as per the document {Number} ex: 92
                lineText: resultIssues[i].line.text, // the whole line text {String} ex: <p>hallo world</p>
                lineOffset: resultIssues[i].line.offset, // the char pos excluding the line in which the spell error is {Number} ex: 89
                lineNumber: resultIssues[i].line.position.line, // the line number in which the error is {Number} ex: 5 0-indexed
                lineCharStart: resultIssues[i].offset - resultIssues[i].line.offset, // the starting char position of the misspelled word {Number} ex: 5 0-indexed, calculated by subtracting the documentOffset - lineOffset
                lineCharEnd: resultIssues[i].offset - resultIssues[i].line.offset + resultIssues[i].length, // the ending char position of the misspelled word {Number} ex: 10 0-indexed, calculated by subtracting the documentOffset - lineOffset + textLength
                suggestion: resultIssues[i].suggestions[0] // suggestion for the correct spelling. only get the first suggestion from the list of suggestions {String} ex: hello
            });
        }

        return errors;
    }

    /**
     * This function is responsible for converting spell check errors to CodeInspection format
     * @param {Array} errors - array of the error objects. refer to the function above (getRequiredDataFromErrors)
     * @returns {Array} - array of error objects which is compatible to codeInspection
     */
    function convertErrorsToCodeInspectionFormat(errors) {
        return errors.map(function (error) {
            const errorObj = {
                pos: {
                    line: error.lineNumber,
                    ch: error.lineCharStart
                },
                endPos: {
                    line: error.lineNumber,
                    ch: error.lineCharEnd
                },
                message: `"${error.text}" may be misspelled.${error.suggestion ? ` Did you mean "${error.suggestion}"?` : ""}`,
                type: CodeInspection.Type.WARNING
            };

            // add fix if there's a valid suggestion
            if (error.suggestion && error.suggestion.trim() !== "") {
                errorObj.fix = {
                    replaceText: error.suggestion,
                    rangeOffset: {
                        start: error.documentOffset,
                        end: error.documentOffset + error.textLength
                    }
                };
            }

            return errorObj;
        });
    }

    /**
     * This function gets the word at the current cursor position and checks if it's misspelled
     * @param {Editor} editor - the editor instance
     * @param {Array} errors - array of current spell check errors
     * @returns {Object|null} - object with word and error info if misspelled, null otherwise
     */
    function getCurrentMisspelledWord(editor, errors) {
        if (!editor || !errors || errors.length === 0) {
            return null;
        }

        const cursor = editor.getCursorPos();
        const line = cursor.line;
        const ch = cursor.ch;

        // find if cursor is within any misspelled word
        for (let i = 0; i < errors.length; i++) {
            const error = errors[i];
            if (error.lineNumber === line && ch >= error.lineCharStart && ch <= error.lineCharEnd) {
                return {
                    word: error.text,
                    error: error
                };
            }
        }

        return null;
    }

    /**
     * This function gets the word at the current cursor position regardless of whether it's misspelled
     * @param {Editor} editor - the editor instance
     * @returns {string|null} - the word at cursor position, null if no word found
     */
    function getCurrentWord(editor) {
        if (!editor) {
            return null;
        }

        const cursor = editor.getCursorPos();
        const document = editor.document;
        const line = document.getLine(cursor.line);

        if (!line) {
            return null;
        }

        // Find word boundaries around cursor
        let start = cursor.ch;
        let end = cursor.ch;

        // Move start position backwards to find word start
        while (start > 0 && /\w/.test(line.charAt(start - 1))) {
            start--;
        }

        // Move end position forwards to find word end
        while (end < line.length && /\w/.test(line.charAt(end))) {
            end++;
        }

        // Extract the word
        const word = line.substring(start, end);

        // Return word only if it's valid (contains letters and is not empty)
        if (word && /[a-zA-Z]/.test(word)) {
            return word;
        }

        return null;
    }

    /**
     * This function fixes the current misspelled word by replacing it with the suggestion
     * @param {Editor} editor - the editor instance
     * @param {Array} errors - array of current spell check errors
     * @returns {boolean} - true if word was fixed, false otherwise
     */
    function fixCurrentMisspelledWord(editor, errors) {
        if (!editor || !errors || errors.length === 0) {
            return false;
        }

        const currentMisspelledWord = getCurrentMisspelledWord(editor, errors);
        if (!currentMisspelledWord || !currentMisspelledWord.error.suggestion) {
            return false;
        }

        const error = currentMisspelledWord.error;
        const document = editor.document;

        try {
            // Replace the misspelled word with the suggestion
            document.replaceRange(
                error.suggestion,
                { line: error.lineNumber, ch: error.lineCharStart },
                { line: error.lineNumber, ch: error.lineCharEnd }
            );
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * This function gets all words in the current file
     * @param {Editor} editor - the editor instance
     * @returns {Array} - array of unique words found in the file
     */
    function getAllWordsInFile(editor) {
        if (!editor) {
            return [];
        }

        const document = editor.document;
        const content = document.getText();

        // Use regex to find all words (sequences of word characters)
        const wordRegex = /\b[a-zA-Z]+\b/g;
        const matches = content.match(wordRegex) || [];

        // Return unique words only
        const uniqueWords = [];
        matches.forEach(function(word) {
            if (uniqueWords.indexOf(word) === -1) {
                uniqueWords.push(word);
            }
        });

        return uniqueWords;
    }

    exports.getFileData = getFileData;
    exports.getRequiredDataFromErrors = getRequiredDataFromErrors;
    exports.convertErrorsToCodeInspectionFormat = convertErrorsToCodeInspectionFormat;
    exports.getCurrentMisspelledWord = getCurrentMisspelledWord;
    exports.getCurrentWord = getCurrentWord;
    exports.fixCurrentMisspelledWord = fixCurrentMisspelledWord;
    exports.getAllWordsInFile = getAllWordsInFile;
});
