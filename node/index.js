let cspell;

const extnNodeConnector = global.createNodeConnector(
    "cspell-extension",
    exports
);

async function initCSpell() {
    if (!cspell) {
        cspell = await import("cspell-lib");
    }
    return cspell;
}

exports.initCSpell = initCSpell;
