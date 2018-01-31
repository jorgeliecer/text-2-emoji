var VALID_CHARS = "abcdefghijklmnñopqrstuvwxyzáéíóúäëïöü"

var Word = function(word, type, range, node) { this.word = word; this.range = range; this.type = type; this.node = node; }
// Mark: Range structure
function WordRange(start, end) { this.start = start; this.end = end; this.length = (end - start) + 1 }
var WordsParser = function() {}

// This functions evaluate a text string to match all words and return a number of those
// matched words
WordsParser.prototype._find_words = function(i, str, length, node) {
  if(i<=0||i>str.length||length<0||str.length<0)return null
  var _callback=function(_r){return new Word(_r[0],'text',new WordRange(_r.index,(_r.index+_r[0].length)-1), node)}
  for(var _s=str.substring(0,i).toLowerCase(),fw=[],_rexp=new RegExp("(["+VALID_CHARS+"]+)","gmi"),_r;(_r=_rexp.exec(_s))!==null;_r.index===_rexp.lastIndex?_rexp.lastIndex++:null,fw.push(_callback(_r))){}
  return fw.slice(0-length)
}

// This is an alias function
WordsParser.prototype.get_words_at = WordsParser.prototype._find_words
