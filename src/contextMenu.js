define(function (require, exports, module) {
    const Menus = brackets.getModule("command/Menus");
    const CommandManager = brackets.getModule("command/CommandManager");

    const Strings = require("./strings");
    const Commands = require("./commands");
    const IgnoreWords = require("./ignoreWords");

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
    }

    /**
     * This function is called before the context menu is shown
     * Currently, it enables/disables (only) the ignore word option based on cursor position
     */
    function _beforeContextMenuOpen() {
        const command = CommandManager.get(Commands.IGNORE_WORD);
        if (command) {
            const isMisspelled = IgnoreWords.isCurrentWordMisspelled();
            command.setEnabled(isMisspelled);
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
