Array.prototype.firstOccurance = function(term) {
    for (i in this) { 
        if (this[i].indexOf(term) != -1 ) {  // still can use idnexOf on a string, right? :)
            return parseInt(i,10);  // we need an integer, not a string as i is
        }
    }
}

function getExcerpt(text, searchTerm, precision) {
    var words = text.split(" "),
        index = words.firstOccurance(searchTerm),
        result = [], // resulting array that we will join back
        startIndex, stopIndex;
    // now we need first <precision> words before and after searchTerm
    // we can use slice for this matter
    // but we need to know what is our startIndex and stopIndex
    // since simple substitution from index could lead us to 
    // a negative value
    // and adding to an index could get us to exceeding words array length

    startIndex = index - precision;
    if (startIndex < 0) {
        startIndex = 0;
    }

    stopIndex = index + precision + 1;
    if (stopIndex > words.length) {
        stopIndex = words.length;
    }


    result = result.concat( words.slice(startIndex, index) );
    result = result.concat( words.slice(index, stopIndex) );
    return result.join(' '); // join back
}
