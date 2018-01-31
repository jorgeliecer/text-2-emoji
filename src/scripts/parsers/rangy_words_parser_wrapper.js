var RangyWordsParserWrapper = function(wp) {
  this.wp = wp
}

RangyWordsParserWrapper.prototype.get_char_at_with_sel = function(sel, offset) {
  var node = sel.anchorNode; return this.wp.get_char_at(sel.anchorOffset - offset, node.nodeValue)
}

// Based on position and text get all chars from <left to right>
// it will stoped with (space, tab or car-return)
// TODO: This functions need to be able to navigate over nodes to find
RangyWordsParserWrapper.prototype._find_words_with_sel = function(sel, offset, number_of_words) {
  var node = sel.anchorNode
  if (node == null) return null
  if(node.nodeType != 3) return null
  return this.wp.get_words_at(sel.anchorOffset - offset, node.nodeValue, number_of_words, node)
}

RangyWordsParserWrapper.prototype.get_words_at_with_sel = function(sel, offset, number_of_words) {
  var words = this._find_words_with_sel(sel, offset, number_of_words)
  if (words == null) return null
  if (words.length < number_of_words) {
    var node = sel.anchorNode
    for (;;) {
      node = node.previousSibling;
      if (words.length == number_of_words || node == undefined) { break }
      if (node.nodeName.toLowerCase() === 'img') {
        var word =  $(node).attr("word")
        words.unshift(new Word(word, "img", null, node))
      } else {
        var value = node.nodeValue
        var _e_words = this.wp.get_words_at(value.length - 1, value, number_of_words - words.length, node)
        if (null != _e_words && _e_words.length > 0) {
          words = _e_words.concat(words)
        }
      }
    }
  }
  return words
}
