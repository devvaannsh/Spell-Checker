define(function (require, exports, module) {
    const AppInit = brackets.getModule("utils/AppInit"),
        NodeConnector = brackets.getModule("NodeConnector");

    const Driver = require("./src/spell-checker-driver");

    let nodeConnector;

    function init() {
        setTimeout(() => {
            Driver.driver();
        }, 5000);
    }

    async function initializeSpellChecker() {
        try {
            const cspell = await nodeConnector.execPeer("initCSpell");
            return cspell;
        } catch (error) {
            console.error("Failed to initialize CSpell:", error);
            return;
        }
    }

    AppInit.appReady(function () {
        if (Phoenix.isNativeApp) {
            nodeConnector = NodeConnector.createNodeConnector("cspell-extension", exports);
            const cspell = initializeSpellChecker();
            if (cspell) {
                init();
            }
        } else {
            console.error("CSpell doesn't work in browser apps!");
        }
    });
});
