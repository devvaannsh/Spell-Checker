define(function (require, exports, module) {
    const AppInit = brackets.getModule("utils/AppInit"),
        NodeConnector = brackets.getModule("NodeConnector");

    let nodeConnector;

    AppInit.appReady(function () {
        if (Phoenix.isNativeApp) {
            nodeConnector = NodeConnector.createNodeConnector("cspell-extension", exports);
        } else {
            console.error("CSpell doesn't work in browser apps!");
        }
    });
});
