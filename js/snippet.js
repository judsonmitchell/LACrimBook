//Array.prototype.firstOccurence = function(term) {
//    for (var i=0; i<this.length; i++) { 
//        if (this[i].indexOf(term) != -1 ) {  // still can use idnexOf on a string, right? :)
//            return parseInt(i,10);  // we need an integer, not a string as i is
//        }
//    }
//}
//
//function getExcerpt(text, searchTerm, precision) {
//    var words = text.split(" "),
//        index = words.firstOccurence(searchTerm),
//        result = [], // resulting array that we will join back
//        startIndex, stopIndex;
//    // now we need first <precision> words before and after searchTerm
//    // we can use slice for this matter
//    // but we need to know what is our startIndex and stopIndex
//    // since simple substitution from index could lead us to 
//    // a negative value
//    // and adding to an index could get us to exceeding words array length
//
//    startIndex = index - precision;
//    if (startIndex < 0) {
//        startIndex = 0;
//    }
//
//    stopIndex = index + precision + 1;
//    if (stopIndex > words.length) {
//        stopIndex = words.length;
//    }
//
//
//    result = result.concat( words.slice(startIndex, index) );
//    result = result.concat( words.slice(index, stopIndex) );
//    return result.join(' '); // join back
//}

function substr_replace (str, replace, start, length) {
  // http://kevin.vanzonneveld.net
  if (start < 0) { // start position in str
    start = start + str.length;
  }
  length = length !== undefined ? length : str.length;
  if (length < 0) {
    length = length + str.length - start;
  }
  return str.slice(0, start) + replace.substr(0, length) + replace.slice(length) + str.slice(start + length);
}

//function highlight(needle, haystack){ 
//    var ind = haystack.indexOf(needle);
//    var len = needle.length; 
//    if(ind !== -1){ 
//        return substr($haystack, 0, $ind) . "<span class='highlight'>" . substr($haystack, $ind, $len) . "</span>" . 
//            $this->highlight($needle, substr($haystack, $ind + $len)); 
//    } else return $haystack; 
//} 

function excerpt(text, phrase,radius) {
    var ending = '...';
    var phraseLen = phrase.length;
    if (radius < phraseLen) {
        radius = phraseLen;
    }

    //$pos = strpos(strtolower($text), strtolower($phrase));
    var pos = text.indexOf(phrase);

    var startPos = 0;
    if (pos > radius) {
        startPos = pos - radius;
    }

    textLen = text.length;

    var endPos = pos + phraseLen + radius;
    if (endPos >= textLen) {
        endPos = textLen;
    }

    //$excerpt = substr($text, $startPos, $endPos - $startPos);
    var endr = endPos - startPos;
    var excerpt = text.substring(startPos,endr);
    if (startPos != 0) {
        excerpt = substr_replace(excerpt, ending, 0, phraseLen);
    }

    if (endPos != textLen) {
        excerpt = substr_replace(excerpt, ending, -phraseLen);
    }

    //return $this->highlight($phrase, $excerpt);
    return excerpt;
}

