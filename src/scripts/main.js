"use strict"

// Mark: Variables

var TRIGGERS_KEYS = [13,32,190,16,186,191,188]

var wp = new WordsParser()
var rwpw = new RangyWordsParserWrapper(wp)

// Lang dictionary
var dictionary = []
var multi_dictionary = [
  // [["papi papaleta"], "270b,1f385"],
  [["papá noel"], "1f385"],
]

// Mark: Editor functions

// Initialize the editor events to catch words
function _editor_events(_editorRef) {
  // This method is only required to show a detailed
  // debug information about the word functions to show
  // realtime words that are matching
  _editorRef.on("keyup mouseup", function(e) {
    // _debug()
  })

  // _editorRef.on("mouseup", function(e) {
  //   var number_of_words = 4
  //   var sel = rangy.getSelection(_editorRef[0])
  //   var _words = rwpw.get_words_at_with_sel(sel, 0, number_of_words)
  //   console.log(_words)
  // })

  // Fired when detect a new word on keydown function
  _editorRef.on("keydown", function(e) {
    if(TRIGGERS_KEYS.contains(e.keyCode)) {
      var sel = rangy.getSelection(_editorRef[0])
      var _words = rwpw.get_words_at_with_sel(sel, 0, 4)
      if (_words != null) _new_words_found(sel, _words, _editorRef)
    }
  })
}

function proccess_words(words) {
  var result = [], all_are_text = true, same_node = true
  var _node = null
  $.each(words, function(i, word) {
    if (i == 0) _node = word.node
    same_node &= (_node == word.node ? true : false)
    all_are_text &= (word.type == 'text' ? true : false)
    result.push(word.word)
  })
  // console.log(words);
  return {
    "glue": result.join(" "),
    "sameNode": same_node,
    "allAreText": all_are_text,
    "start": same_node && all_are_text ? words.first().range.start : -1,
    "end": same_node && all_are_text ? words.last().range.end : -1,
    "node": same_node && all_are_text ? _node : null
  }
}

// This will be a dispatch event when a new word was found
function _new_words_found(sel, _words, _editorRef) {
  do {
    var processed_words = proccess_words(_words)
    $.each(dictionary, function(i, _dic) {
      if(_dic[0].contains(processed_words.glue)) {
        var        unicodes = _dic[1].toLowerCase()
        var emojies_unicode = unicodes.split(",")
        var       htmlEmoji = ""
        $.each(emojies_unicode, function(i, emoji) {
          var emojiDOM = $("<img/>", {"class":"animated tada emoji", "word": processed_words.glue, "unicodes": unicodes, "src": "images/emojione/" + emoji + ".png"})
          htmlEmoji += emojiDOM[0].outerHTML
        })
        var _replace_in_range = function(html, node, start, end) {
          var range = rangy.createRange()
          range.setStart(node, start)
          range.setEnd(node, end + 1)
          range.pasteHtml(html)
          sel.setSingleRange(range)
        }
        if (processed_words.sameNode && processed_words.allAreText) {
          return _replace_in_range(htmlEmoji, processed_words.node, processed_words.start, processed_words.end)
        } else {
          var parent = _words.pop()
          // Only replace text not images
          if (parent.type == 'text') {
            $.each(_words, function(i, word) {
              if (word.type == 'text') word.node.nodeValue = word.node.nodeValue.replace_in_range(word.range, "")
              if (word.type == 'img') word.node.remove()
            })
            return _replace_in_range(htmlEmoji, parent.node, parent.range.start, parent.range.end)
          }
        }
      }
    })
    _words.shift()
  } while (_words.length > 0)
  // $.each(dictionary, function(__z, dictionary_word) {
  //   // If any word match
  //   $.each(_words, function(__y, word) {
  //     if(dictionary_word[0].contains(word.word)) {
  //       var unicodes = dictionary_word[1].toLowerCase()
  //       var emojies_unicode = unicodes.split(",")
  //       var htmlEmoji = ""
  //       $.each(emojies_unicode, function(__x, _e) {
  //         var emoji = $("<img/>", {"class":"animated tada emoji", "word": word.word, "unicodes": unicodes, "src": "images/emojione/" + _e + ".png"})
  //         htmlEmoji += emoji.get(0).outerHTML
  //       })
  //       var node = sel.getRangeAt(0).startContainer
  //       var range = rangy.createRange()
  //       range.setStart(node, word.range.start)
  //       range.setEnd(node, word.range.end + 1)
  //       range.pasteHtml(htmlEmoji)
  //       sel.setSingleRange(range)
  //       return
  //     }
  //   })
  // })
}

// Mark: Debug functions

function _debug(_editorRef) {
  var sel = rangy.getSelection()
  var word = rwpw.get_word_at_with_sel(sel, 1)
  if (word != null) {
    $("#caret_word").html(word.word)
  } else {
    $("#caret_word").html("")
  }
}

// Mark: Main
// #################### MAIN ####################
Zepto(function($) {
  rangy.init()

  var _editorRef = $("#editorRef")

  // Load dictionary
  $.getJSON('text2emoji-lang/es.json', function(data) {
    dictionary = data.concat(multi_dictionary) // Set words dictionary
    _editor_events(_editorRef)
  })

  // Focus caret
  _editorRef.focus()

  // Menu effect
  var menu_is_open = false, anim = false
  $(".menu").click(function(e) {
    if (!menu_is_open && !anim) {
      $("#menu-icon").addClass("ion-ios-close")
      $("#menu-icon").removeClass("ion-ios-help")
      anim = true
      $(".layer-menu").css("display","block").animate({
        "-webkit-clip-path": "circle(100% at 50% 50%)",
        "clip-path": "circle(100% at 50% 50%)",
        "background-color": "#fdfdfd"
      }, 800, 'ease', function() {
        anim = false
        menu_is_open = true
      })
    } else if (menu_is_open && !anim) {
      $("#menu-icon").removeClass("ion-ios-close")
      $("#menu-icon").addClass("ion-ios-help")
      anim = true
      $(".layer-menu").animate({
        "-webkit-clip-path": "circle(0% at 50% 90%)",
        "clip-path": "circle(0% at 50% 90%)",
        "background-color": "#83EEC4"
      }, 500, 'ease', function() {
        anim = false
        menu_is_open = false
      })
    }
  })
})
