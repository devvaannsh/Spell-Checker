define(function (require, exports, module) {
    const AppInit = brackets.getModule("utils/AppInit");
    const NodeConnector = brackets.getModule("NodeConnector");

    const Driver = require("./src/driver");
    const UI = require("./src/UI");
    const ContextMenu = require("./src/contextMenu");

    let nodeConnector;

    /**
     * This function will be called when the app is ready and after the node connector is created
     * this initializes the cspell library and call the required functions for the execution of the spell checking
     */
    async function init() {
        try {
            await nodeConnector.execPeer("initCSpell");
            Driver.setNodeConnector(nodeConnector);

            UI.registerSpellChecker();
            Driver.registerHandlers();
            Driver.driver();
            ContextMenu.init();
        } catch (error) {
            console.error("Failed to initialize spell checker:", error);
        }
    }

    AppInit.appReady(function () {
        // as cspell currently is expected to work only in the desktop app
        if (Phoenix.isNativeApp) {
            nodeConnector = NodeConnector.createNodeConnector("cspell-extension", exports);
            init();
        } else {
            console.error("CSpell doesn't work in browser apps!");
        }
    });
});
