let cspell;

const extnNodeConnector = global.createNodeConnector("cspell-extension", exports);

/**
 * This function is responsible to initialize the cspell library
 * @returns {Promise} - the cspell library
 */
async function initCSpell() {
    if (!cspell) {
        cspell = await import("cspell-lib");
    }
    return cspell;
}


/**
 * This is the main function which calls the cspell library to check for misspelled words
 * @param {Object} - the fileData object containing the filePath, content of the file
 * and ignoreWords (optional) and dictionaryWords (optional)
 * @returns {Array} - an array of all the issues found or an empty array if api call fails or no misspellings were found
 */
async function checkSpelling(fileData) {
    try {
        if (!cspell) {
            await initCSpell();
        }

        // the main API
        const results = await cspell.spellCheckDocument(
            { uri: fileData.filePath, text: fileData.content },
            { generateSuggestions: true },
            { ignoreWords: fileData.ignoreWords, words: fileData.dictionaryWords }
        );

        // an array of the issues found in the file, or maybe empty if no issues were found
        return results.issues;

    } catch (error) {
        console.error("Spell check error:", error);
        return [];
    }
}

exports.initCSpell = initCSpell;
exports.checkSpelling = checkSpelling;
