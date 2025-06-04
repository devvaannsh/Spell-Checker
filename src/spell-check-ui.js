define(function (require, exports, module) {
    const CodeInspection = brackets.getModule("language/CodeInspection");
    const LanguageManager = brackets.getModule("language/LanguageManager");

    const Helper = require("./spell-check-helper");

    // TODO: this should be moved to Strings.js once we integrate this to core
    const SPELL_CHECKER_NAME = "SpellChecker";

    /**
     * All the spell check errors will be stored here
     * in a format which is compatible to codeInspection
     */
    let cachedErrors = [];


    /**
     * This function is called by the CodeInspection to scan the file for all the spelling errors
     *
     * @param {string} text - the text content to check
     * @param {string} fullPath - the full path to the file
     * @returns {Object|null} - results object with errors array or null
     */
    function lintOneFile(text, fullPath) {
        if (cachedErrors.length > 0) {
            const codeInspectionErrors = Helper.convertErrorsToCodeInspectionFormat(cachedErrors);
            return { errors: codeInspectionErrors };
        }

        return null;
    }

    /**
     * This function is responsible to set errors to be displayed in the editor
     * @param {Array} errors - array of error objects
     */
    function setErrors(errors) {
        cachedErrors = errors || [];
        // trigger a re-scan of the current file
        CodeInspection.requestRun(SPELL_CHECKER_NAME);
    }

    /**
     * This function is responsible to clear all the cached errors
     * it is normally called when the spell check API fails
     */
    function clearErrors() {
        cachedErrors = [];
        CodeInspection.requestRun(SPELL_CHECKER_NAME);
    }

    /**
     * This function is responsible to register the spell checker
     * it registers the spell checker for all those language types that Phoenix supports
     */
    function registerSpellChecker() {
        const supportedLanguages = LanguageManager.getLanguages();
        Object.keys(supportedLanguages).forEach(function (languageId) {
            try {
                CodeInspection.register(languageId, {
                    name: SPELL_CHECKER_NAME,
                    scanFile: lintOneFile
                });
            } catch (error) {
                console.log("Failed to register SpellChecker for language:", languageId, error.message);
            }
        });
    }

    exports.registerSpellChecker = registerSpellChecker;
    exports.setErrors = setErrors;
    exports.clearErrors = clearErrors;
});
