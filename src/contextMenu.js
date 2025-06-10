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
        CommandManager.register(Strings.IGNORE_WORD, Commands.IGNORE_WORD, IgnoreWords.addToIgnoredWords);
        subMenu.addMenuItem(Commands.IGNORE_WORD);
    }

    function init() {
        _addSubMenuToEditorMenu();
        _addMenuItemsToSubMenu();
    }

    exports.init = init;
});
