Array.prototype.firstOccurence = function(term) {
    var regex = new RegExp('\\b' + term + '\\b');
    for (var i=0; i<this.length; i++) {
        if (this[i].toLowerCase().search(regex) !== -1 ) {  // still can use idnexOf on a string, right? :)
            return parseInt(i,10);  // we need an integer, not a string as i is
        }
    }
};

function getExcerpt(text, searchTerm, precision) {
    // strip off HTML entities such as &nbsp;
    var strip_entities = text.replace(/&(?!hellip)[a-z]+;/gim, '');

    // strip off line breaks and carriage returns and extra potential spaces/tabs
    var strip_breaks = strip_entities.replace(/\r+\s+\t+\r+/gim, '');

    // strip html
    var strip_html = strip_breaks.replace(/<[^<>]+>/g, ' ').replace(/\s{2,}/g, ' ');

    var words = strip_html.split(' '),
    index = words.firstOccurence(searchTerm),
    result = [], // resulting array that we will join back
    startIndex, stopIndex;

    //In case something goes wrong with finding first occurence, please don't
    //give us the whole statute
    if (typeof index === 'undefined'){
        return;
    }

    startIndex = index - precision;
    if (startIndex < 0) {
        startIndex = 0;
    }

    stopIndex = index + precision + 1;
    if (stopIndex > words.length) {
        stopIndex = words.length;
    }

    result = result.concat(words.slice(startIndex, index) );
    result = result.concat(words.slice(index, stopIndex) );
    var resultStr = result.join(' '); // join back

    //Highlight search term
    var targetWord = words[index];
    return resultStr.replace(targetWord, '<span class="highlight">' + targetWord + '</span>');

}

