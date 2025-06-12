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
    const UI = require("./UI");

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

    /**
     * Toggle ignore/unignore all misspelled words for the current file
     */
    function toggleIgnoreAllWordsInFile() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) return;

        const fileData = Helper.getFileData(editor);
        if (!fileData) return;

        const hasIgnoredWords = Preferences.hasFileIgnoredWords(fileData.filePath);

        if (hasIgnoredWords) {
            // Remove all ignored words for this file
            Preferences.removeAllFileIgnoredWords(fileData.filePath);
        } else {
            // Get all current misspelled words in the file and ignore them
            const currentErrors = UI.getErrors();

            if (currentErrors && currentErrors.length > 0) {
                // Extract unique misspelled words from current errors
                const misspelledWords = [];
                currentErrors.forEach(function (error) {
                    if (error.text && misspelledWords.indexOf(error.text) === -1) {
                        misspelledWords.push(error.text);
                    }
                });

                if (misspelledWords.length > 0) {
                    Preferences.addWordsToFileIgnored(fileData.filePath, misspelledWords);
                }
            }
        }

        // Re-run driver to apply changes immediately
        Driver.driver();
    }

    /**
     * Toggle add/remove all misspelled words to/from dictionary for the current file
     */
    function toggleAddAllWordsToDictionary() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) return;

        const fileData = Helper.getFileData(editor);
        if (!fileData) return;

        const hasDictionaryWords = Preferences.hasFileDictionaryWords(fileData.filePath);

        if (hasDictionaryWords) {
            // Remove all dictionary words for this file
            Preferences.removeAllFileDictionaryWords(fileData.filePath);
        } else {
            // Get all current misspelled words in the file and add them to dictionary
            const currentErrors = UI.getErrors();

            if (currentErrors && currentErrors.length > 0) {
                // Extract unique misspelled words from current errors
                const misspelledWords = [];
                currentErrors.forEach(function (error) {
                    if (error.text && misspelledWords.indexOf(error.text) === -1) {
                        misspelledWords.push(error.text);
                    }
                });

                if (misspelledWords.length > 0) {
                    Preferences.addWordsToFileDictionary(fileData.filePath, misspelledWords);
                }
            }
        }

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
        CommandManager.register(
            Strings.FIX_ALL_TYPOS_IN_FILE,
            Commands.FIX_ALL_TYPOS_IN_FILE,
            FixTypo.fixAllTyposInFile
        );
        subMenu.addMenuItem(Commands.FIX_ALL_TYPOS_IN_FILE);

        subMenu.addMenuDivider();

        // Ignore Word (will dynamically change to Unignore Word)
        CommandManager.register(Strings.IGNORE_WORD, Commands.IGNORE_WORD, function () {
            const isWordIgnored = IgnoreWords.isCurrentWordIgnored();
            if (isWordIgnored) {
                IgnoreWords.removeCurrentWordFromIgnored();
            } else {
                IgnoreWords.addCurrentWordToIgnored();
            }
        });
        subMenu.addMenuItem(Commands.IGNORE_WORD);

        // Ignore/Unignore All Words in File
        CommandManager.register(
            Strings.IGNORE_ALL_WORDS_IN_FILE,
            Commands.IGNORE_ALL_WORDS_IN_FILE,
            toggleIgnoreAllWordsInFile
        );
        subMenu.addMenuItem(Commands.IGNORE_ALL_WORDS_IN_FILE);

        subMenu.addMenuDivider();

        // Add Word to Dictionary (will dynamically change to Remove Word from Dictionary)
        CommandManager.register(Strings.ADD_WORD_TO_DICTIONARY, Commands.ADD_WORD_TO_DICTIONARY, function () {
            const isWordInDictionary = DictionaryWords.isCurrentWordInDictionary();
            if (isWordInDictionary) {
                DictionaryWords.removeCurrentWordFromDictionary();
            } else {
                DictionaryWords.addCurrentWordToDictionary();
            }
        });
        subMenu.addMenuItem(Commands.ADD_WORD_TO_DICTIONARY);

        // Add/Remove All Words to/from Dictionary for File
        CommandManager.register(
            Strings.ADD_ALL_WORDS_TO_DICTIONARY,
            Commands.ADD_ALL_WORDS_TO_DICTIONARY,
            toggleAddAllWordsToDictionary
        );
        subMenu.addMenuItem(Commands.ADD_ALL_WORDS_TO_DICTIONARY);

        subMenu.addMenuDivider();

        // Toggle Spell Checker for File
        CommandManager.register(
            Strings.TOGGLE_SPELL_CHECKER_FILE,
            Commands.TOGGLE_SPELL_CHECKER_FILE,
            toggleSpellCheckerForFile
        );
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
        const ignoreAllCommand = CommandManager.get(Commands.IGNORE_ALL_WORDS_IN_FILE);
        const addAllToDictionaryCommand = CommandManager.get(Commands.ADD_ALL_WORDS_TO_DICTIONARY);
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

            const toggleFileText = isFileDisabled
                ? Strings.ENABLE_SPELL_CHECKER_FILE
                : Strings.DISABLE_SPELL_CHECKER_FILE;
            toggleFileCommand.setName(toggleFileText);
        }

        if (fixTypoCommand && fixAllTyposCommand && ignoreCommand && dictionaryCommand && ignoreAllCommand && addAllToDictionaryCommand) {
            const isMisspelled = FixTypo.isCurrentWordMisspelled();
            const typoInfo = FixTypo.getCurrentTypoInfo();
            const hasFixableTypos = FixTypo.hasFixableTyposInFile();
            const isSpellCheckerEnabled = !Preferences.isSpellCheckerDisabled();

            // Check if current word is already ignored or in dictionary
            const isWordIgnored = IgnoreWords.isCurrentWordIgnored();
            const isWordInDictionary = DictionaryWords.isCurrentWordInDictionary();

            // Check if we have a valid word at cursor
            const editor = EditorManager.getActiveEditor();
            const hasCurrentWord = editor && Helper.getCurrentWord(editor) !== null;

            // Check if spell checker is enabled for the current file
            let isFileSpellCheckerEnabled = true;
            if (editor) {
                const fileData = Helper.getFileData(editor);
                if (fileData) {
                    isFileSpellCheckerEnabled = !Preferences.isSpellCheckerDisabledForFile(fileData.filePath);
                }
            }

            // Determine if spell check is enabled globally and for this file
            const spellCheckEnabled = isSpellCheckerEnabled && isFileSpellCheckerEnabled;

            // Update ignore command text based on current word status
            if (ignoreCommand) {
                const ignoreText = isWordIgnored ? Strings.UNIGNORE_WORD : Strings.IGNORE_WORD;
                ignoreCommand.setName(ignoreText);
            }

            // Update dictionary command text based on current word status
            if (dictionaryCommand) {
                const dictionaryText = isWordInDictionary
                    ? Strings.REMOVE_WORD_FROM_DICTIONARY
                    : Strings.ADD_WORD_TO_DICTIONARY;
                dictionaryCommand.setName(dictionaryText);
            }

            // Update ignore all command text based on file's ignored words status
            if (ignoreAllCommand) {
                const editor = EditorManager.getActiveEditor();
                let hasFileIgnoredWords = false;
                let hasCurrentErrors = false;

                if (editor) {
                    const fileData = Helper.getFileData(editor);
                    if (fileData) {
                        hasFileIgnoredWords = Preferences.hasFileIgnoredWords(fileData.filePath);
                    }
                }

                // Check if there are current spelling errors to ignore
                const currentErrors = UI.getErrors();
                hasCurrentErrors = currentErrors && currentErrors.length > 0;

                const ignoreAllText = hasFileIgnoredWords
                    ? Strings.UNIGNORE_ALL_WORDS_IN_FILE
                    : Strings.IGNORE_ALL_WORDS_IN_FILE;
                ignoreAllCommand.setName(ignoreAllText);

                // Enable the command if spell checker is enabled for this file and either:
                // 1. There are current errors to ignore, OR
                // 2. There are already ignored words for this file to unignore
                const enableIgnoreAllCommand = spellCheckEnabled && (hasCurrentErrors || hasFileIgnoredWords);
                ignoreAllCommand.setEnabled(enableIgnoreAllCommand);
            }

            // Update add all to dictionary command text based on file's dictionary words status
            if (addAllToDictionaryCommand) {
                const editor = EditorManager.getActiveEditor();
                let hasFileDictionaryWords = false;
                let hasCurrentErrors = false;

                if (editor) {
                    const fileData = Helper.getFileData(editor);
                    if (fileData) {
                        hasFileDictionaryWords = Preferences.hasFileDictionaryWords(fileData.filePath);
                    }
                }

                // Check if there are current spelling errors to add to dictionary
                const currentErrors = UI.getErrors();
                hasCurrentErrors = currentErrors && currentErrors.length > 0;

                const addAllToDictionaryText = hasFileDictionaryWords
                    ? Strings.REMOVE_ALL_WORDS_FROM_DICTIONARY
                    : Strings.ADD_ALL_WORDS_TO_DICTIONARY;
                addAllToDictionaryCommand.setName(addAllToDictionaryText);

                // Enable the command if spell checker is enabled for this file and either:
                // 1. There are current errors to add to dictionary, OR
                // 2. There are already dictionary words for this file to remove
                const enableAddAllToDictionaryCommand = spellCheckEnabled && (hasCurrentErrors || hasFileDictionaryWords);
                addAllToDictionaryCommand.setEnabled(enableAddAllToDictionaryCommand);
            }

            // update the fix typo command text dynamically
            if (typoInfo) {
                const fixText = `Fix typo: ${typoInfo.word} → ${typoInfo.suggestion}`;
                fixTypoCommand.setName(fixText);
            } else {
                fixTypoCommand.setName(Strings.FIX_TYPO);
            }

            // Fix typo commands - only enabled for misspelled words
            fixTypoCommand.setEnabled(isMisspelled && typoInfo !== null && spellCheckEnabled);
            fixAllTyposCommand.setEnabled(hasFixableTypos && spellCheckEnabled);

            // Ignore/Unignore and Dictionary Add/Remove commands - enabled when we have a valid word at cursor
            // For misspelled words, enable if not already in the respective list
            // For ignored/dictionary words, enable to allow removal
            const enableIgnoreCommand = hasCurrentWord && spellCheckEnabled && (isMisspelled || isWordIgnored);
            const enableDictionaryCommand = hasCurrentWord && spellCheckEnabled && (isMisspelled || isWordInDictionary);

            ignoreCommand.setEnabled(enableIgnoreCommand);
            dictionaryCommand.setEnabled(enableDictionaryCommand);
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
