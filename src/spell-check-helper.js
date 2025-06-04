define(function (require, exports, module) {

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
                console.error("No document was found in the editor");
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
        for(let i = 0; i < resultIssues.length; i++) {
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

    exports.getFileData = getFileData;
    exports.getRequiredDataFromErrors = getRequiredDataFromErrors;
});
