// Mark: Array utils

Array.prototype.contains = function(v) {
  return this.indexOf(v) > -1;
}

// Mark: Range structure

Array.prototype.last = function(v) { return this[this.length-1] }
Array.prototype.first = function(v) { return this[0] }

// Mark: String utils

String.prototype.reverse = function() { return this.split('').reverse().join('') }
String.prototype.replace_in_range = function(range, word) { return this.replace(new RegExp("^(.{"+range.start+"}).{"+range.length+"}"), "$1" + word) }
String.prototype.shift = function() { return this.slice(1) }
String.prototype.pop = function() { return this.substring(0, this.length - 1) }
