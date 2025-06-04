define(function (require, exports, module) {

    const Helper = require('./spell-check-helper');

    function driver() {
        const editor = Helper.getCurrActiveEditor();
        if(!editor) return;

        const fileData = Helper.getFileData(editor);
        if (fileData) {
            console.log("------------------------------------");
            console.log("fileData: ", fileData);
            console.log("------------------------------------");
        }
    }

    exports.driver = driver;
});
