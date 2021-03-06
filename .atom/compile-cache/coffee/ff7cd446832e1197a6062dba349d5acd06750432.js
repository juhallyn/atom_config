(function() {
  var BracketMatchingMotion, Find, Motions, MoveToMark, RepeatSearch, Search, SearchCurrentWord, Till, ref, ref1;

  Motions = require('./general-motions');

  ref = require('./search-motion'), Search = ref.Search, SearchCurrentWord = ref.SearchCurrentWord, BracketMatchingMotion = ref.BracketMatchingMotion, RepeatSearch = ref.RepeatSearch;

  MoveToMark = require('./move-to-mark-motion');

  ref1 = require('./find-motion'), Find = ref1.Find, Till = ref1.Till;

  Motions.Search = Search;

  Motions.SearchCurrentWord = SearchCurrentWord;

  Motions.BracketMatchingMotion = BracketMatchingMotion;

  Motions.RepeatSearch = RepeatSearch;

  Motions.MoveToMark = MoveToMark;

  Motions.Find = Find;

  Motions.Till = Till;

  module.exports = Motions;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlL2xpYi9tb3Rpb25zL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxtQkFBUjs7RUFDVixNQUFtRSxPQUFBLENBQVEsaUJBQVIsQ0FBbkUsRUFBQyxtQkFBRCxFQUFTLHlDQUFULEVBQTRCLGlEQUE1QixFQUFtRDs7RUFDbkQsVUFBQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUjs7RUFDYixPQUFlLE9BQUEsQ0FBUSxlQUFSLENBQWYsRUFBQyxnQkFBRCxFQUFPOztFQUVQLE9BQU8sQ0FBQyxNQUFSLEdBQWlCOztFQUNqQixPQUFPLENBQUMsaUJBQVIsR0FBNEI7O0VBQzVCLE9BQU8sQ0FBQyxxQkFBUixHQUFnQzs7RUFDaEMsT0FBTyxDQUFDLFlBQVIsR0FBdUI7O0VBQ3ZCLE9BQU8sQ0FBQyxVQUFSLEdBQXFCOztFQUNyQixPQUFPLENBQUMsSUFBUixHQUFlOztFQUNmLE9BQU8sQ0FBQyxJQUFSLEdBQWU7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFiakIiLCJzb3VyY2VzQ29udGVudCI6WyJNb3Rpb25zID0gcmVxdWlyZSAnLi9nZW5lcmFsLW1vdGlvbnMnXG57U2VhcmNoLCBTZWFyY2hDdXJyZW50V29yZCwgQnJhY2tldE1hdGNoaW5nTW90aW9uLCBSZXBlYXRTZWFyY2h9ID0gcmVxdWlyZSAnLi9zZWFyY2gtbW90aW9uJ1xuTW92ZVRvTWFyayA9IHJlcXVpcmUgJy4vbW92ZS10by1tYXJrLW1vdGlvbidcbntGaW5kLCBUaWxsfSA9IHJlcXVpcmUgJy4vZmluZC1tb3Rpb24nXG5cbk1vdGlvbnMuU2VhcmNoID0gU2VhcmNoXG5Nb3Rpb25zLlNlYXJjaEN1cnJlbnRXb3JkID0gU2VhcmNoQ3VycmVudFdvcmRcbk1vdGlvbnMuQnJhY2tldE1hdGNoaW5nTW90aW9uID0gQnJhY2tldE1hdGNoaW5nTW90aW9uXG5Nb3Rpb25zLlJlcGVhdFNlYXJjaCA9IFJlcGVhdFNlYXJjaFxuTW90aW9ucy5Nb3ZlVG9NYXJrID0gTW92ZVRvTWFya1xuTW90aW9ucy5GaW5kID0gRmluZFxuTW90aW9ucy5UaWxsID0gVGlsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdGlvbnNcbiJdfQ==
