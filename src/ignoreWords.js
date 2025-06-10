define(function (require, exports, module) {
	const IGNORED_WORDS = [];

    function addToIgnoredWords(word) {
        IGNORED_WORDS.push(word);

        getIgnoredWords();
    }

    function getIgnoredWords() {

        console.log("-------------------------");
        console.log("Ignored Words: ", IGNORED_WORDS);
        console.log("-------------------------");

    	return IGNORED_WORDS;
    }

    exports.addToIgnoredWords = addToIgnoredWords;
    exports.getIgnoredWords = getIgnoredWords;
});
