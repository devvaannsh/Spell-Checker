define(function (require, exports, module) {
    const CommandManager = brackets.getModule("command/CommandManager");
    const Menus = brackets.getModule("command/Menus");
    const Commands = brackets.getModule("command/Commands");

    const LocalCommands = require("./commands");
    const LocalStrings = require("./strings");
    const Preferences = require("./preferences");
    const Driver = require("./driver");
    const UI = require("./UI");

    let toggleCommand;

    function toggleSpellChecker() {
        // get the current state
        const isCurrentlyDisabled = Preferences.isSpellCheckerDisabled();
        
        // toggle the state
        Preferences.setSpellCheckerDisabled(!isCurrentlyDisabled);
        updateMenuCheckmark();
        
        if (isCurrentlyDisabled) {
            // run the spell check
            Driver.driver();
        } else {
            // clear all the errors
            UI.clearErrors();
        }
    }

    function updateMenuCheckmark() {
        if (toggleCommand) {
            const isEnabled = !Preferences.isSpellCheckerDisabled();
            toggleCommand.setChecked(isEnabled);
        }
    }

    function init() {
        const MY_COMMAND_ID = LocalCommands.SPELL_CHECKER_EDIT_MENU;
        toggleCommand = CommandManager.register(LocalStrings.SPELL_CHECKER_SUBMENU_NAME, MY_COMMAND_ID, toggleSpellChecker);

        const menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
        menu.addMenuItem(MY_COMMAND_ID, "", Menus.AFTER, Commands.EDIT_BEAUTIFY_CODE_ON_SAVE);
        
        // set initial checkmark state
        updateMenuCheckmark();
    }
    
    exports.init = init;
    exports.updateMenuCheckmark = updateMenuCheckmark;
});
