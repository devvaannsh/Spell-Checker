define(function (require, exports, module) {
    const Menus = brackets.getModule("command/Menus");
    const CommandManager = brackets.getModule("command/CommandManager");

    const Strings = require("./strings");
    const Commands = require("./commands");
    const IgnoreWords = require("./ignoreWords");
    const DictionaryWords = require("./dictionaryWords");
    const FixTypo = require("./fixTypo");

    let subMenu;

    function _addSubMenuToEditorMenu() {
        subMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addSubMenu(
            Strings.SPELL_CHECKER_SUBMENU_NAME,
            Commands.SPELL_CHECKER_SUBMENU_ID
        );
    }

    function _addMenuItemsToSubMenu() {
        // Fix typo
        CommandManager.register(Strings.FIX_TYPO, Commands.FIX_TYPO, FixTypo.fixCurrentTypo);
        subMenu.addMenuItem(Commands.FIX_TYPO);

        subMenu.addMenuDivider();

        // Ignore Word
        CommandManager.register(Strings.IGNORE_WORD, Commands.IGNORE_WORD, IgnoreWords.addCurrentWordToIgnored);
        subMenu.addMenuItem(Commands.IGNORE_WORD);

        // Add Word to Dictionary
        CommandManager.register(Strings.ADD_WORD_TO_DICTIONARY, Commands.ADD_WORD_TO_DICTIONARY, DictionaryWords.addCurrentWordToDictionary);
        subMenu.addMenuItem(Commands.ADD_WORD_TO_DICTIONARY);
    }

    /**
     * This function is called before the context menu is shown
     * Currently, it enables/disables options based on cursor position
     */
    function _beforeContextMenuOpen() {
        const fixTypoCommand = CommandManager.get(Commands.FIX_TYPO);
        const ignoreCommand = CommandManager.get(Commands.IGNORE_WORD);
        const dictionaryCommand = CommandManager.get(Commands.ADD_WORD_TO_DICTIONARY);

        if (fixTypoCommand && ignoreCommand && dictionaryCommand) {
            const isMisspelled = FixTypo.isCurrentWordMisspelled();
            const typoInfo = FixTypo.getCurrentTypoInfo();

            // update the fix typo command text dynamically
            if (typoInfo) {
                const fixText = `Fix typo: ${typoInfo.word} → ${typoInfo.suggestion}`;
                fixTypoCommand.setName(fixText);
            } else {
                fixTypoCommand.setName(Strings.FIX_TYPO);
            }

            fixTypoCommand.setEnabled(isMisspelled && typoInfo !== null);
            ignoreCommand.setEnabled(isMisspelled);
            dictionaryCommand.setEnabled(isMisspelled);
        }
    }

    function init() {
        _addSubMenuToEditorMenu();
        _addMenuItemsToSubMenu();

        // register the before open handler to enable/disable menu items
        const editorContextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
        editorContextMenu.on("beforeContextMenuOpen", _beforeContextMenuOpen);
    }

    exports.init = init;
});
