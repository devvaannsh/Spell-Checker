define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");

    const Helper = require("./helper");
    const UI = require("./UI");
    const IgnoreWords = require("./ignoreWords");
    const DictionaryWords = require("./dictionaryWords");
    const Preferences = require("./preferences");

    let nodeConnector;

    /**
     * This is just for setting up the node connector
     * it is called inside the main.js file
     */
    function setNodeConnector(connector) {
        nodeConnector = connector;
    }

    /**
     * This is the main driver function that handles everything, right from getting file content from the active document
     * to calling the API to fetch all the errors, show spell error markers in the editor, show suggestions and everything
     * This is just called inside the main.js init function
     */
    async function driver() {
        // Check if spell checker is disabled globally
        if (Preferences.isSpellCheckerDisabled()) {
            UI.clearErrors();
            return;
        }

        const editor = EditorManager.getActiveEditor();
        if (!editor) return;

        const fileData = Helper.getFileData(editor);
        if (!fileData || !nodeConnector) return;

        // Check if spell checker is disabled for this specific file
        if (Preferences.isSpellCheckerDisabledForFile(fileData.filePath)) {
            UI.clearErrors();
            return;
        }

        try {
            // get ignored words and dictionary words and include them in the API call
            const ignoreWords = IgnoreWords.getIgnoredWords();
            const dictionaryWords = DictionaryWords.getDictionaryWords();

            // Get file-specific ignored words and combine with global ignored words
            const fileIgnoredWords = Preferences.getFileIgnoredWords(fileData.filePath);
            const combinedIgnoreWords = ignoreWords.concat(fileIgnoredWords);

            // Get file-specific dictionary words and combine with global dictionary words
            const fileDictionaryWords = Preferences.getFileDictionaryWords(fileData.filePath);
            const combinedDictionaryWords = dictionaryWords.concat(fileDictionaryWords);

            // call the API
            const resultIssues = await nodeConnector.execPeer("checkSpelling", {
                content: fileData.content,
                filePath: fileData.filePath,
                ignoreWords: combinedIgnoreWords,
                dictionaryWords: combinedDictionaryWords
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
     * This function is called when any change is made in the editor
     * TODO: we need to make it efficient like it was done for color preview
     * @private
     */
    function _onChanged() {
        driver();
    }

    /**
     * This function is called when the active editor is changed
     * @private
     */
    function _onActiveEditorChanged() {
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

    exports.driver = driver;
    exports.registerHandlers = registerHandlers;
    exports.setNodeConnector = setNodeConnector;
});
