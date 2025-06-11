define(function (require, exports, module) {
    const Menus = brackets.getModule("command/Menus");
    const CommandManager = brackets.getModule("command/CommandManager");
    const EditorManager = brackets.getModule("editor/EditorManager");

    const Strings = require("./strings");
    const Commands = require("./commands");
    const IgnoreWords = require("./ignoreWords");
    const DictionaryWords = require("./dictionaryWords");
    const FixTypo = require("./fixTypo");
    const Preferences = require("./preferences");
    const Driver = require("./driver");
    const Helper = require("./helper");

    let subMenu;

    /**
     * Toggle spell checker enabled/disabled state
     */
    function toggleSpellChecker() {
        const currentlyDisabled = Preferences.isSpellCheckerDisabled();
        Preferences.setSpellCheckerDisabled(!currentlyDisabled);

        // Re-run driver to apply changes immediately
        Driver.driver();
    }

    /**
     * Toggle spell checker enabled/disabled state for the current file
     */
    function toggleSpellCheckerForFile() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) return;

        const fileData = Helper.getFileData(editor);
        if (!fileData) return;

        const currentlyDisabled = Preferences.isSpellCheckerDisabledForFile(fileData.filePath);
        Preferences.setSpellCheckerDisabledForFile(fileData.filePath, !currentlyDisabled);

        // Re-run driver to apply changes immediately
        Driver.driver();
    }

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

        // Fix all typos in file
        CommandManager.register(Strings.FIX_ALL_TYPOS_IN_FILE, Commands.FIX_ALL_TYPOS_IN_FILE, FixTypo.fixAllTyposInFile);
        subMenu.addMenuItem(Commands.FIX_ALL_TYPOS_IN_FILE);

        subMenu.addMenuDivider();

        // Ignore Word
        CommandManager.register(Strings.IGNORE_WORD, Commands.IGNORE_WORD, IgnoreWords.addCurrentWordToIgnored);
        subMenu.addMenuItem(Commands.IGNORE_WORD);

        // Add Word to Dictionary
        CommandManager.register(
            Strings.ADD_WORD_TO_DICTIONARY,
            Commands.ADD_WORD_TO_DICTIONARY,
            DictionaryWords.addCurrentWordToDictionary
        );
        subMenu.addMenuItem(Commands.ADD_WORD_TO_DICTIONARY);

        subMenu.addMenuDivider();

        // Toggle Spell Checker for File
        CommandManager.register(Strings.TOGGLE_SPELL_CHECKER_FILE, Commands.TOGGLE_SPELL_CHECKER_FILE, toggleSpellCheckerForFile);
        subMenu.addMenuItem(Commands.TOGGLE_SPELL_CHECKER_FILE);

        // Toggle Spell Checker (Global)
        CommandManager.register(Strings.TOGGLE_SPELL_CHECKER, Commands.TOGGLE_SPELL_CHECKER, toggleSpellChecker);
        subMenu.addMenuItem(Commands.TOGGLE_SPELL_CHECKER);
    }

    /**
     * This function is called before the context menu is shown
     * Currently, it enables/disables options based on cursor position
     */
    function _beforeContextMenuOpen() {
        const fixTypoCommand = CommandManager.get(Commands.FIX_TYPO);
        const fixAllTyposCommand = CommandManager.get(Commands.FIX_ALL_TYPOS_IN_FILE);
        const ignoreCommand = CommandManager.get(Commands.IGNORE_WORD);
        const dictionaryCommand = CommandManager.get(Commands.ADD_WORD_TO_DICTIONARY);
        const toggleCommand = CommandManager.get(Commands.TOGGLE_SPELL_CHECKER);
        const toggleFileCommand = CommandManager.get(Commands.TOGGLE_SPELL_CHECKER_FILE);

        // Update toggle command text based on current state
        if (toggleCommand) {
            const isDisabled = Preferences.isSpellCheckerDisabled();
            const toggleText = isDisabled ? Strings.ENABLE_SPELL_CHECKER : Strings.DISABLE_SPELL_CHECKER;
            toggleCommand.setName(toggleText);
        }

        // Update file-specific toggle command text based on current file state
        if (toggleFileCommand) {
            const editor = EditorManager.getActiveEditor();
            let isFileDisabled = false;

            if (editor) {
                const fileData = Helper.getFileData(editor);
                if (fileData) {
                    isFileDisabled = Preferences.isSpellCheckerDisabledForFile(fileData.filePath);
                }
            }

            const toggleFileText = isFileDisabled ? Strings.ENABLE_SPELL_CHECKER_FILE : Strings.DISABLE_SPELL_CHECKER_FILE;
            toggleFileCommand.setName(toggleFileText);
        }

        if (fixTypoCommand && fixAllTyposCommand && ignoreCommand && dictionaryCommand) {
            const isMisspelled = FixTypo.isCurrentWordMisspelled();
            const typoInfo = FixTypo.getCurrentTypoInfo();
            const hasFixableTypos = FixTypo.hasFixableTyposInFile();
            const isSpellCheckerEnabled = !Preferences.isSpellCheckerDisabled();

            // Check if spell checker is enabled for the current file
            let isFileSpellCheckerEnabled = true;
            const editor = EditorManager.getActiveEditor();
            if (editor) {
                const fileData = Helper.getFileData(editor);
                if (fileData) {
                    isFileSpellCheckerEnabled = !Preferences.isSpellCheckerDisabledForFile(fileData.filePath);
                }
            }

            // update the fix typo command text dynamically
            if (typoInfo) {
                const fixText = `Fix typo: ${typoInfo.word} → ${typoInfo.suggestion}`;
                fixTypoCommand.setName(fixText);
            } else {
                fixTypoCommand.setName(Strings.FIX_TYPO);
            }

            // Disable spell check related commands if spell checker is disabled globally or for this file
            const spellCheckEnabled = isSpellCheckerEnabled && isFileSpellCheckerEnabled;
            fixTypoCommand.setEnabled(isMisspelled && typoInfo !== null && spellCheckEnabled);
            fixAllTyposCommand.setEnabled(hasFixableTypos && spellCheckEnabled);
            ignoreCommand.setEnabled(isMisspelled && spellCheckEnabled);
            dictionaryCommand.setEnabled(isMisspelled && spellCheckEnabled);
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
