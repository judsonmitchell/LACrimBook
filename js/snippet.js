function getExcerpt(text, searchTerm, precision) {
    // strip off HTML entities such as &nbsp;
    var stripEntities = text.replace(/&(?!hellip)[a-z]+;/gim, '');

    // strip off line breaks and carriage returns and extra potential spaces/tabs
    var stripBreaks = stripEntities.replace(/\r+\s+\t+\r+/gim, '');

    // strip html
    var stripHtml = stripBreaks.replace(/<[^<>]+>/g, ' ').replace(/\s{2,}/g, ' ');

    var result = [], // resulting array that we will join back
    startIndex, stopIndex;

    //Find first index of our search term
    var regex; 

    if (typeof(searchTerm) === 'number'){
        regex = new RegExp('\\b' + searchTerm + '\\b')
    } else {
        regex = new RegExp('\\b' + searchTerm.toLowerCase() + '\\b')
    }
    var index = stripHtml.toLowerCase().search(regex),
    charsArr = stripHtml.split(''),
    counter = 0,
    v;

    //Find [precision] words backward
    for (var i = index, l = 0; i > l; i-- ) {
        v = charsArr[i];
        if (v === ' '){ //we find a space
            counter++;
        }
        if (counter === precision){
            startIndex = i;
            break;
        }
    }

    counter = 0;

    //Find [precision] words forward
    for (i = index, l = charsArr.length; i < l; i++ ) {
        v = charsArr[i];
        if (v === ' '){ //we find a space
            counter++;
        }
        if (counter === precision){
            stopIndex = i;
            break;
        }
    }

    //In case something goes wrong with finding first occurence, please don't
    //give us the whole statute
    if (typeof index === 'undefined'){
        return;
    }

    if (startIndex === null){
        startIndex = 0;
    }
    if (stopIndex === null){
        stopIndex = charsArr.length;
    }

    result = result.concat(charsArr.slice(startIndex, stopIndex) );

    var resultStr = result.join(''); // join back

    //Highlight search term
    //var targetWord = words[index];
    var caseInsens = new RegExp( '(' + searchTerm + ')', 'gi' );
        // return line.replace( regex, "<b>$1</b>" );
    return resultStr.replace(caseInsens, '<span class="highlight">$1</span>');

}

