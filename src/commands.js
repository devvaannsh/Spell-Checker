define(function (require, exports, module) {
    const SPELL_CHECKER_EDIT_MENU = "spell_checker";
    const SPELL_CHECKER_SUBMENU_ID = "spell-checker-submenu";
    const FIX_TYPO = "spellchecker.fixTypo";
    const FIX_ALL_TYPOS_IN_FILE = "spellchecker.fixAllTyposInFile";
    const IGNORE_WORD = "spellchecker.ignoreWord";
    const ADD_WORD_TO_DICTIONARY = "spellchecker.addWordToDictionary";
    const IGNORE_ALL_WORDS_IN_FILE = "spellchecker.ignoreAllWordsInFile";
    const UNIGNORE_ALL_WORDS_IN_FILE = "spellchecker.unignoreAllWordsInFile";
    const ADD_ALL_WORDS_TO_DICTIONARY = "spellchecker.addAllWordsToDictionary";
    const REMOVE_ALL_WORDS_FROM_DICTIONARY = "spellchecker.removeAllWordsFromDictionary";
    const TOGGLE_SPELL_CHECKER = "spellchecker.toggleSpellChecker";
    const TOGGLE_SPELL_CHECKER_FILE = "spellchecker.toggleSpellCheckerFile";

    exports.SPELL_CHECKER_EDIT_MENU = SPELL_CHECKER_EDIT_MENU;
    exports.SPELL_CHECKER_SUBMENU_ID = SPELL_CHECKER_SUBMENU_ID;
    exports.FIX_TYPO = FIX_TYPO;
    exports.FIX_ALL_TYPOS_IN_FILE = FIX_ALL_TYPOS_IN_FILE;
    exports.IGNORE_WORD = IGNORE_WORD;
    exports.ADD_WORD_TO_DICTIONARY = ADD_WORD_TO_DICTIONARY;
    exports.IGNORE_ALL_WORDS_IN_FILE = IGNORE_ALL_WORDS_IN_FILE;
    exports.UNIGNORE_ALL_WORDS_IN_FILE = UNIGNORE_ALL_WORDS_IN_FILE;
    exports.ADD_ALL_WORDS_TO_DICTIONARY = ADD_ALL_WORDS_TO_DICTIONARY;
    exports.REMOVE_ALL_WORDS_FROM_DICTIONARY = REMOVE_ALL_WORDS_FROM_DICTIONARY;
    exports.TOGGLE_SPELL_CHECKER = TOGGLE_SPELL_CHECKER;
    exports.TOGGLE_SPELL_CHECKER_FILE = TOGGLE_SPELL_CHECKER_FILE;
});
