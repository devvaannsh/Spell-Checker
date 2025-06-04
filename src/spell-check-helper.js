define(function (require, exports, module) {
    const EditorManager = brackets.getModule("editor/EditorManager");

    function getCurrActiveEditor() {
        const editor = EditorManager.getActiveEditor();
        return editor;
    }

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
                document: document,
                content: content,
                filePath: filePath,
                displayFilePath: Phoenix.app.getDisplayPath(filePath),
                language: language ? language.getName() : null
            };
        } catch (error) {
            console.error("Something went wrong in the getFileData", error);
            return;
        }
    }

    exports.getFileData = getFileData;
    exports.getCurrActiveEditor = getCurrActiveEditor;
});
