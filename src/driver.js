define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");
    const _ = brackets.getModule("thirdparty/lodash");

    const Helper = require("./helper");
    const UI = require("./UI");
    const IgnoreWords = require("./ignoreWords");
    const DictionaryWords = require("./dictionaryWords");
    const Preferences = require("./preferences");

    let nodeConnector;

    let fullFileCheckTimeout;
    const FULL_FILE_CHECK_INTERVAL = 15000; // Check full file after every 15 seconds
    const DEBOUNCE_DELAY = 400; // Debounce delay for spell checking

    /**
     * This is just for setting up the node connector
     * it is called inside the main.js file
     */
    function setNodeConnector(connector) {
        nodeConnector = connector;
    }

    /**
     * This function gets the file data from the editor
     * @param {Editor} editor - the editor instance
     * @returns {Object|null} - object with filePath and content or null
     */
    function getFileData(editor) {
        return Helper.getFileData(editor);
    }

    /**
     * Performs spell check on specific lines of text
     * @param {Editor} editor - the editor instance
     * @param {number} fromLine - start line number
     * @param {number} toLine - end line number
     */
    async function checkLines(editor, fromLine, toLine) {
        const fileData = getFileData(editor);
        if (!fileData) {
            return;
        }

        // Check if spell checker is disabled globally or for this file
        if (Preferences.isSpellCheckerDisabled() || Preferences.isSpellCheckerDisabledForFile(fileData.filePath)) {
            UI.clearErrors();
            return;
        }

        try {
            // Get the content of the specified lines
            const lines = [];
            for (let i = fromLine; i <= toLine; i++) {
                lines.push(editor.getLine(i));
            }
            const content = lines.join("\n");

            // Calculate the offset where the extracted content starts in the full document
            let documentOffsetAdjustment = 0;
            for (let i = 0; i < fromLine; i++) {
                documentOffsetAdjustment += editor.getLine(i).length + 1; // +1 for newline character
            }

            // get ignored words and dictionary words
            const ignoreWords = IgnoreWords.getIgnoredWords();
            const dictionaryWords = DictionaryWords.getDictionaryWords();

            // call the API with the line content
            const resultIssues = await nodeConnector.execPeer("checkSpelling", {
                content: content,
                filePath: fileData.filePath,
                ignoreWords: ignoreWords,
                dictionaryWords: dictionaryWords
            });

            // Get existing errors and filter out errors from the lines we're updating
            const existingErrors = UI.getErrors().filter(
                (error) => error.lineNumber < fromLine || error.lineNumber > toLine
            );

            // Process new errors and adjust all position-related fields
            const newErrors = Helper.getRequiredDataFromErrors(resultIssues).map((error) => ({
                ...error,
                lineNumber: error.lineNumber + fromLine,
                documentOffset: error.documentOffset + documentOffsetAdjustment,
                lineOffset: error.lineOffset + documentOffsetAdjustment
            }));

            // Combine and display errors
            UI.setErrors([...existingErrors, ...newErrors]);
        } catch (error) {
            console.error("Line spell check failed:", error);
        }
    }

    /**
     * Performs a full file spell check
     */
    async function driver() {
        const editor = EditorManager.getActiveEditor();
        const fileData = getFileData(editor);
        if (!fileData) {
            return;
        }

        // Check if spell checker is disabled globally or for this file
        if (Preferences.isSpellCheckerDisabled() || Preferences.isSpellCheckerDisabledForFile(fileData.filePath)) {
            UI.clearErrors();
            return;
        }

        try {
            // get ignored words and dictionary words and include them in the API call
            const ignoreWords = IgnoreWords.getIgnoredWords();
            const dictionaryWords = DictionaryWords.getDictionaryWords();

            // call the API
            const resultIssues = await nodeConnector.execPeer("checkSpelling", {
                content: fileData.content,
                filePath: fileData.filePath,
                ignoreWords: ignoreWords,
                dictionaryWords: dictionaryWords
            });

            // resultIssues has lot of data that we don't need also some data needs to be calculated as per Phoenix requirements
            const errors = Helper.getRequiredDataFromErrors(resultIssues);
            // Display errors visually in the editor
            UI.setErrors(errors);
        } catch (error) {
            console.error("Spell check failed:", error);
            // Clear any existing errors if the spell check fails
            UI.clearErrors();
        }
    }

    /**
     * for a full file check
     */
    function scheduleFullFileCheck() {
        if (fullFileCheckTimeout) {
            clearTimeout(fullFileCheckTimeout);
        }
        fullFileCheckTimeout = setTimeout(driver, FULL_FILE_CHECK_INTERVAL);
    }

    /**
     * This function is called when any change is made in the editor
     * @private
     */
    function _onChanged(_evt, instance, changeList) {
        if (!changeList || !changeList.length) {
            return;
        }

        const changeObj = changeList[0];

        // Handle simple edits (single character insertions/deletions)
        if (changeList.length === 1 && (changeObj.origin === "+input" || changeObj.origin === "+delete")) {
            // For simple edits, only check the affected lines
            if (changeObj.from.line === changeObj.to.line) {
                debouncedCheckLines(instance, changeObj.from.line, changeObj.to.line);
                scheduleFullFileCheck();
                return;
            }
        }

        // For more complex changes (paste, cut, multiple lines, etc.), check the whole file
        debouncedDriver();
    }

    const debouncedCheckLines = _.debounce(checkLines, DEBOUNCE_DELAY);
    const debouncedDriver = _.debounce(driver, DEBOUNCE_DELAY);

    /**
     * This function is called when the active editor is changed
     * @private
     */
    function _onActiveEditorChanged() {
        // Clear any existing timeouts
        if (fullFileCheckTimeout) {
            clearTimeout(fullFileCheckTimeout);
        }

        // Run a full file check immediately when switching files
        driver();

        // register the change handler for the new editor
        const activeEditor = EditorManager.getActiveEditor();
        if (activeEditor) {
            activeEditor.off("change", _onChanged);
            activeEditor.on("change", _onChanged);
        }
    }

    /**
     * This function is responsible to register all the required handlers
     * it is called inside the main.js init function
     */
    function registerHandlers() {
        EditorManager.off("activeEditorChange", _onActiveEditorChanged);
        EditorManager.on("activeEditorChange", _onActiveEditorChanged);

        const activeEditor = EditorManager.getActiveEditor();
        if (activeEditor) {
            activeEditor.off("change", _onChanged);
            activeEditor.on("change", _onChanged);
        }
    }

    exports.setNodeConnector = setNodeConnector;
    exports.driver = driver;
    exports.registerHandlers = registerHandlers;
});
