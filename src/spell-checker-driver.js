define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");

    const Helper = require("./spell-check-helper");

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
        const editor = EditorManager.getActiveEditor();
        if (!editor) return;

        const fileData = Helper.getFileData(editor);
        if (!fileData || !nodeConnector) return;

        try {
            // call the API
            const resultIssues = await nodeConnector.execPeer("checkSpelling", {
                content: fileData.content,
                filePath: fileData.filePath
            });

            // resultIssues has lot of data that we don't need also some data needs to be calculated as per Phoenix requirements
            const errors = Helper.getRequiredDataFromErrors(resultIssues);

            console.log("-------------------------");
            console.log("errors: ", errors);
            console.log("-------------------------");
        } catch (error) {
            console.error("Spell check failed:", error);
        }
    }

    exports.driver = driver;
    exports.setNodeConnector = setNodeConnector;
});
