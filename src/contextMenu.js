define(function (require, exports, module) {
    const Menus = brackets.getModule("command/Menus");
    const CommandManager = brackets.getModule("command/CommandManager");

    const Strings = require("./strings");
    const Commands = require("./commands");
    const IgnoreWords = require("./ignoreWords");
    const DictionaryWords = require("./dictionaryWords");

    let subMenu;

    function _addSubMenuToEditorMenu() {
        subMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addSubMenu(
            Strings.SPELL_CHECKER_SUBMENU_NAME,
            Commands.SPELL_CHECKER_SUBMENU_ID
        );
    }

    function _addMenuItemsToSubMenu() {
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
        const ignoreCommand = CommandManager.get(Commands.IGNORE_WORD);
        const dictionaryCommand = CommandManager.get(Commands.ADD_WORD_TO_DICTIONARY);

        if (ignoreCommand && dictionaryCommand) {
            const isMisspelled = IgnoreWords.isCurrentWordMisspelled();
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
