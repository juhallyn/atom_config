'use babel';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;
var Point = _require.Point;

// [TODO] Need overhaul
//  - [ ] Make expandable by selection.getBufferRange().union(this.getRange(selection))
//  - [ ] Count support(priority low)?
var Base = require('./base');
var PairFinder = require('./pair-finder');

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), 'constructor', this).apply(this, arguments);

    this.operator = null;
    this.wise = 'characterwise';
    this.supportCount = false;
    this.selectOnce = false;
    this.selectSucceeded = false;
  }

  // Section: Word
  // =========================

  _createClass(TextObject, [{
    key: 'isInner',
    value: function isInner() {
      return this.inner;
    }
  }, {
    key: 'isA',
    value: function isA() {
      return !this.inner;
    }
  }, {
    key: 'isLinewise',
    value: function isLinewise() {
      return this.wise === 'linewise';
    }
  }, {
    key: 'isBlockwise',
    value: function isBlockwise() {
      return this.wise === 'blockwise';
    }
  }, {
    key: 'forceWise',
    value: function forceWise(wise) {
      return this.wise = wise; // FIXME currently not well supported
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      this.selectSucceeded = false;
    }

    // execute: Called from Operator::selectTarget()
    //  - `v i p`, is `VisualModeSelect` operator with @target = `InnerParagraph`.
    //  - `d i p`, is `Delete` operator with @target = `InnerParagraph`.
  }, {
    key: 'execute',
    value: function execute() {
      // Whennever TextObject is executed, it has @operator
      if (!this.operator) throw new Error('in TextObject: Must not happen');
      this.select();
    }
  }, {
    key: 'select',
    value: function select() {
      var _this = this;

      if (this.isMode('visual', 'blockwise')) {
        this.swrap.normalize(this.editor);
      }

      this.countTimes(this.getCount(), function (_ref2) {
        var stop = _ref2.stop;

        if (!_this.supportCount) stop(); // quick-fix for #560

        for (var selection of _this.editor.getSelections()) {
          var oldRange = selection.getBufferRange();
          if (_this.selectTextObject(selection)) _this.selectSucceeded = true;
          if (selection.getBufferRange().isEqual(oldRange)) stop();
          if (_this.selectOnce) break;
        }
      });

      this.editor.mergeIntersectingSelections();
      // Some TextObject's wise is NOT deterministic. It has to be detected from selected range.
      if (this.wise == null) this.wise = this.swrap.detectWise(this.editor);

      if (this.operator['instanceof']('SelectBase')) {
        if (this.selectSucceeded) {
          if (this.wise === 'characterwise') {
            this.swrap.saveProperties(this.editor, { force: true });
          } else if (this.wise === 'linewise') {
            // When target is persistent-selection, new selection is added after selectTextObject.
            // So we have to assure all selection have selction property.
            // Maybe this logic can be moved to operation stack.
            for (var $selection of this.swrap.getSelections(this.editor)) {
              if (this.getConfig('stayOnSelectTextObject')) {
                if (!$selection.hasProperties()) {
                  $selection.saveProperties();
                }
              } else {
                $selection.saveProperties();
              }
              $selection.fixPropertyRowToRowRange();
            }
          }
        }

        if (this.submode === 'blockwise') {
          for (var $selection of this.swrap.getSelections(this.editor)) {
            $selection.normalize();
            $selection.applyWise('blockwise');
          }
        }
      }
    }

    // Return true or false
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range);
        return true;
      } else {
        return false;
      }
    }

    // to override
  }, {
    key: 'getRange',
    value: function getRange(selection) {}
  }], [{
    key: 'deriveClass',
    value: function deriveClass(innerAndA, innerAndAForAllowForwarding) {
      this.command = false; // HACK: klass to derive child class is not command
      var store = {};
      if (innerAndA) {
        var klassA = this.generateClass(false);
        var klassI = this.generateClass(true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      if (innerAndAForAllowForwarding) {
        var klassA = this.generateClass(false, true);
        var klassI = this.generateClass(true, true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      return store;
    }
  }, {
    key: 'generateClass',
    value: function generateClass(inner, allowForwarding) {
      var name = (inner ? 'Inner' : 'A') + this.name;
      if (allowForwarding) {
        name += 'AllowForwarding';
      }

      return (function (_ref) {
        _inherits(_class, _ref);

        _createClass(_class, null, [{
          key: 'name',
          value: name,
          enumerable: true
        }]);

        function _class(vimState) {
          _classCallCheck(this, _class);

          _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) {
            this.allowForwarding = allowForwarding;
          }
        }

        return _class;
      })(this);
    }
  }, {
    key: 'operationKind',
    value: 'text-object',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return TextObject;
})(Base);

var Word = (function (_TextObject) {
  _inherits(Word, _TextObject);

  function Word() {
    _classCallCheck(this, Word);

    _get(Object.getPrototypeOf(Word.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Word, [{
    key: 'getRange',
    value: function getRange(selection) {
      var point = this.getCursorPositionForSelection(selection);

      var _getWordBufferRangeAndKindAtBufferPosition = this.getWordBufferRangeAndKindAtBufferPosition(point, { wordRegex: this.wordRegex });

      var range = _getWordBufferRangeAndKindAtBufferPosition.range;

      return this.isA() ? this.utils.expandRangeToWhiteSpaces(this.editor, range) : range;
    }
  }]);

  return Word;
})(TextObject);

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  // Just include _, -
  return WholeWord;
})(Word);

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // Just include _, -
  return SmartWord;
})(Word);

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Pair
  // =========================

  _createClass(Subword, [{
    key: 'getRange',
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), 'getRange', this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

var Pair = (function (_TextObject2) {
  _inherits(Pair, _TextObject2);

  function Pair() {
    _classCallCheck(this, Pair);

    _get(Object.getPrototypeOf(Pair.prototype), 'constructor', this).apply(this, arguments);

    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
  }

  // Used by DeleteSurround

  _createClass(Pair, [{
    key: 'isAllowNextLine',
    value: function isAllowNextLine() {
      if (this.allowNextLine != null) {
        return this.allowNextLine;
      } else {
        return this.pair && this.pair[0] !== this.pair[1];
      }
    }
  }, {
    key: 'adjustRange',
    value: function adjustRange(_ref3) {
      var start = _ref3.start;
      var end = _ref3.end;

      // Dirty work to feel natural for human, to behave compatible with pure Vim.
      // Where this adjustment appear is in following situation.
      // op-1: `ci{` replace only 2nd line
      // op-2: `di{` delete only 2nd line.
      // text:
      //  {
      //    aaa
      //  }
      if (this.utils.pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (this.utils.getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === 'visual') {
          // This is slightly innconsistent with regular Vim
          // - regular Vim: select new line after EOL
          // - vim-mode-plus: select to EOL(before new line)
          // This is intentional since to make submode `characterwise` when auto-detect submode
          // innerEnd = new Point(innerEnd.row - 1, Infinity)
          end = new Point(end.row - 1, Infinity);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      var finderName = this.pair[0] === this.pair[1] ? 'QuoteFinder' : 'BracketFinder';
      return new PairFinder[finderName](this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      var pairInfo = this.getFinder().find(from);
      if (pairInfo) {
        if (this.adjustInnerRange) {
          pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
        }
        pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
        return pairInfo;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      // When range was same, try to expand range
      if (pairInfo && pairInfo.targetRange.isEqual(originalRange)) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      if (pairInfo) {
        return pairInfo.targetRange;
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Pair;
})(TextObject);

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(APair, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return APair;
})(Pair);

var AnyPair = (function (_Pair2) {
  _inherits(AnyPair, _Pair2);

  function AnyPair() {
    _classCallCheck(this, AnyPair);

    _get(Object.getPrototypeOf(AnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = false;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];
  }

  _createClass(AnyPair, [{
    key: 'getRanges',
    value: function getRanges(selection) {
      var _this2 = this;

      var options = {
        inner: this.inner,
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      };
      var getRangeByMember = function getRangeByMember(member) {
        return _this2.getInstance(member, options).getRange(selection);
      };
      return this.member.map(getRangeByMember).filter(function (v) {
        return v;
      });
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      return this.utils.sortRanges(this.getRanges(selection)).pop();
    }
  }]);

  return AnyPair;
})(Pair);

var AnyPairAllowForwarding = (function (_AnyPair) {
  _inherits(AnyPairAllowForwarding, _AnyPair);

  function AnyPairAllowForwarding() {
    _classCallCheck(this, AnyPairAllowForwarding);

    _get(Object.getPrototypeOf(AnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(AnyPairAllowForwarding, [{
    key: 'getRange',
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      var from = selection.cursor.getBufferPosition();

      var _$partition = this._.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = this.utils.sortRanges(enclosingRanges).pop();
      forwardingRanges = this.utils.sortRanges(forwardingRanges);

      // When enclosingRange is exists,
      // We don't go across enclosingRange.end.
      // So choose from ranges contained in enclosingRange.
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function (range) {
          return enclosingRange.containsRange(range);
        });
      }

      return forwardingRanges[0] || enclosingRange;
    }
  }]);

  return AnyPairAllowForwarding;
})(AnyPair);

var AnyQuote = (function (_AnyPair2) {
  _inherits(AnyQuote, _AnyPair2);

  function AnyQuote() {
    _classCallCheck(this, AnyQuote);

    _get(Object.getPrototypeOf(AnyQuote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];
  }

  _createClass(AnyQuote, [{
    key: 'getRange',
    value: function getRange(selection) {
      // Pick range which end.colum is leftmost(mean, closed first)
      return this.getRanges(selection).sort(function (a, b) {
        return a.end.column - b.end.column;
      })[0];
    }
  }]);

  return AnyQuote;
})(AnyPair);

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(Quote, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Quote;
})(Pair);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['`', '`'];
  }

  return BackTick;
})(Quote);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['{', '}'];
  }

  return CurlyBracket;
})(Pair);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['[', ']'];
  }

  return SquareBracket;
})(Pair);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['(', ')'];
  }

  return Parenthesis;
})(Pair);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['<', '>'];
  }

  return AngleBracket;
})(Pair);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  // Section: Paragraph
  // =========================
  // Paragraph is defined as consecutive (non-)blank-line.

  _createClass(Tag, [{
    key: 'getTagStartPoint',
    value: function getTagStartPoint(from) {
      var regex = PairFinder.TagFinder.pattern;
      var options = { from: [from.row, 0] };
      return this.findInEditor('forward', regex, options, function (_ref4) {
        var range = _ref4.range;
        return range.containsPoint(from, true) && range.start;
      });
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      return _get(Object.getPrototypeOf(Tag.prototype), 'getPairInfo', this).call(this, this.getTagStartPoint(from) || from);
    }
  }]);

  return Tag;
})(Pair);

var Paragraph = (function (_TextObject3) {
  _inherits(Paragraph, _TextObject3);

  function Paragraph() {
    _classCallCheck(this, Paragraph);

    _get(Object.getPrototypeOf(Paragraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.supportCount = true;
  }

  _createClass(Paragraph, [{
    key: 'findRow',
    value: function findRow(fromRow, direction, fn) {
      if (fn.reset) fn.reset();
      var foundRow = fromRow;
      for (var row of this.getBufferRows({ startRow: fromRow, direction: direction })) {
        if (!fn(row, direction)) break;
        foundRow = row;
      }
      return foundRow;
    }
  }, {
    key: 'findRowRangeBy',
    value: function findRowRangeBy(fromRow, fn) {
      var startRow = this.findRow(fromRow, 'previous', fn);
      var endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    }
  }, {
    key: 'getPredictFunction',
    value: function getPredictFunction(fromRow, selection) {
      var _this3 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this3.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? 'previous' : 'next';

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this3.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if (!result && direction === directionToExtend) {
                return flip = true;
              }
              return result;
            }
          };
          predict.reset = function () {
            return flip = false;
          };
          return {
            v: predict
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) fromRow--;else fromRow++;
        fromRow = this.getValidVimBufferRow(fromRow);
      }
      var rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    }
  }]);

  return Paragraph;
})(TextObject);

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Comment
  // =========================

  _createClass(Indentation, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this4 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        if (_this4.editor.isBufferRowBlank(row)) {
          return _this4.isA();
        } else {
          return _this4.editor.indentationForBufferRow(row) >= baseIndentLevel;
        }
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

var Comment = (function (_TextObject4) {
  _inherits(Comment, _TextObject4);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Comment, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection.row;

      var rowRange = this.utils.getRowRangeForCommentAtBufferRow(this.editor, row);
      if (rowRange) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    }
  }]);

  return Comment;
})(TextObject);

var CommentOrParagraph = (function (_TextObject5) {
  _inherits(CommentOrParagraph, _TextObject5);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  // Section: Fold
  // =========================

  _createClass(CommentOrParagraph, [{
    key: 'getRange',
    value: function getRange(selection) {
      var inner = this.inner;

      for (var klass of ['Comment', 'Paragraph']) {
        var range = this.getInstance(klass, { inner: inner }).getRange(selection);
        if (range) {
          return range;
        }
      }
    }
  }]);

  return CommentOrParagraph;
})(TextObject);

var Fold = (function (_TextObject6) {
  _inherits(Fold, _TextObject6);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Fold, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this5 = this;

      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();

      var foldRanges = this.utils.getCodeFoldRanges(this.editor);
      var foldRangesContainsCursorRow = foldRanges.filter(function (range) {
        return range.start.row <= row && row <= range.end.row;
      });

      var _loop = function (_foldRange) {
        if (_this5.isA()) {
          var conjoined = undefined;
          while (conjoined = foldRanges.find(function (range) {
            return range.end.row === _foldRange.start.row;
          })) {
            _foldRange = _foldRange.union(conjoined);
          }
          while (conjoined = foldRanges.find(function (range) {
            return range.start.row === _foldRange.end.row;
          })) {
            _foldRange = _foldRange.union(conjoined);
          }
        } else {
          if (_this5.utils.doesRangeStartAndEndWithSameIndentLevel(_this5.editor, _foldRange)) {
            _foldRange.end.row -= 1;
          }
          _foldRange.start.row += 1;
        }
        _foldRange = _this5.getBufferRangeForRowRange([_foldRange.start.row, _foldRange.end.row]);
        if (!selectedRange.containsRange(_foldRange)) {
          return {
            v: _foldRange
          };
        }
        foldRange = _foldRange;
      };

      for (var foldRange of foldRangesContainsCursorRow.reverse()) {
        var _ret2 = _loop(foldRange);

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }
  }]);

  return Fold;
})(TextObject);

var Function = (function (_TextObject7) {
  _inherits(Function, _TextObject7);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.scopeNamesOmittingClosingBrace = ['source.go', 'source.elixir'];
  }

  // Section: Other
  // =========================

  _createClass(Function, [{
    key: 'getFunctionBodyStartRegex',
    // language doesn't include closing `}` into fold.

    value: function getFunctionBodyStartRegex(_ref5) {
      var scopeName = _ref5.scopeName;

      if (scopeName === 'source.python') {
        return (/:$/
        );
      } else if (scopeName === 'source.coffee') {
        return (/-|=>$/
        );
      } else {
        return (/{$/
        );
      }
    }
  }, {
    key: 'isMultiLineParameterFunctionRange',
    value: function isMultiLineParameterFunctionRange(parameterRange, bodyRange, bodyStartRegex) {
      var _this6 = this;

      var isBodyStartRow = function isBodyStartRow(row) {
        return bodyStartRegex.test(_this6.editor.lineTextForBufferRow(row));
      };
      if (isBodyStartRow(parameterRange.start.row)) return false;
      if (isBodyStartRow(parameterRange.end.row)) return parameterRange.end.row === bodyRange.start.row;
      if (isBodyStartRow(parameterRange.end.row + 1)) return parameterRange.end.row + 1 === bodyRange.start.row;
      return false;
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _this7 = this;

      var editor = this.editor;
      var cursorRow = this.getCursorPositionForSelection(selection).row;
      var bodyStartRegex = this.getFunctionBodyStartRegex(editor.getGrammar());
      var isIncludeFunctionScopeForRow = function isIncludeFunctionScopeForRow(row) {
        return _this7.utils.isIncludeFunctionScopeForRow(editor, row);
      };

      var functionRanges = [];
      var saveFunctionRange = function saveFunctionRange(_ref6) {
        var aRange = _ref6.aRange;
        var innerRange = _ref6.innerRange;

        functionRanges.push({
          aRange: _this7.buildARange(aRange),
          innerRange: _this7.buildInnerRange(innerRange)
        });
      };

      var foldRanges = this.utils.getCodeFoldRanges(editor);
      while (foldRanges.length) {
        var range = foldRanges.shift();
        if (isIncludeFunctionScopeForRow(range.start.row)) {
          var nextRange = foldRanges[0];
          var nextFoldIsConnected = nextRange && nextRange.start.row <= range.end.row + 1;
          var maybeAFunctionRange = nextFoldIsConnected ? range.union(nextRange) : range;
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation
          if (nextFoldIsConnected && this.isMultiLineParameterFunctionRange(range, nextRange, bodyStartRegex)) {
            var bodyRange = foldRanges.shift();
            saveFunctionRange({ aRange: range.union(bodyRange), innerRange: bodyRange });
          } else {
            saveFunctionRange({ aRange: range, innerRange: range });
          }
        } else {
          var previousRow = range.start.row - 1;
          if (previousRow < 0) continue;
          if (editor.isFoldableAtBufferRow(previousRow)) continue;
          var maybeAFunctionRange = range.union(editor.bufferRangeForBufferRow(previousRow));
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation

          var isBodyStartOnlyRow = function isBodyStartOnlyRow(row) {
            return new RegExp('^\\s*' + bodyStartRegex.source).test(editor.lineTextForBufferRow(row));
          };
          if (isBodyStartOnlyRow(range.start.row) && isIncludeFunctionScopeForRow(previousRow)) {
            saveFunctionRange({ aRange: maybeAFunctionRange, innerRange: range });
          }
        }
      }

      for (var functionRange of functionRanges.reverse()) {
        var _ref7 = this.isA() ? functionRange.aRange : functionRange.innerRange;

        var start = _ref7.start;
        var end = _ref7.end;

        var range = this.getBufferRangeForRowRange([start.row, end.row]);
        if (!selection.getBufferRange().containsRange(range)) return range;
      }
    }
  }, {
    key: 'buildInnerRange',
    value: function buildInnerRange(range) {
      var endRowTranslation = this.utils.doesRangeStartAndEndWithSameIndentLevel(this.editor, range) ? -1 : 0;
      return range.translate([1, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'buildARange',
    value: function buildARange(range) {
      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      var endRowTranslation = this.isGrammarDoesNotFoldClosingRow() ? +1 : 0;
      return range.translate([0, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'isGrammarDoesNotFoldClosingRow',
    value: function isGrammarDoesNotFoldClosingRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingClosingBrace.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === 'source.rust' && packageName === 'language-rust';
      }
    }
  }]);

  return Function;
})(TextObject);

var Arguments = (function (_TextObject8) {
  _inherits(Arguments, _TextObject8);

  function Arguments() {
    _classCallCheck(this, Arguments);

    _get(Object.getPrototypeOf(Arguments.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Arguments, [{
    key: 'newArgInfo',
    value: function newArgInfo(argStart, arg, separator) {
      var argEnd = this.utils.traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = this.utils.traverseTextFromPoint(argEnd, separator != null ? separator : '');
      var separatorRange = new Range(argEnd, separatorEnd);

      var innerRange = argRange;
      var aRange = argRange.union(separatorRange);
      return { argRange: argRange, separatorRange: separatorRange, innerRange: innerRange, aRange: aRange };
    }
  }, {
    key: 'getArgumentsRangeForSelection',
    value: function getArgumentsRangeForSelection(selection) {
      var options = {
        member: ['CurlyBracket', 'SquareBracket', 'Parenthesis'],
        inclusive: false
      };
      return this.getInstance('InnerAnyPair', options).getRange(selection);
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _utils = this.utils;
      var splitArguments = _utils.splitArguments;
      var traverseTextFromPoint = _utils.traverseTextFromPoint;
      var getLast = _utils.getLast;

      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance('InnerCurrentLine').getRange(selection); // fallback
      if (!range) return;

      range = this.trimBufferRange(range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === 'separator') {
        var token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === 'argument') {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(getLast(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error('must not happen');
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref82 of argInfos) {
        var innerRange = _ref82.innerRange;
        var aRange = _ref82.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

var CurrentLine = (function (_TextObject9) {
  _inherits(CurrentLine, _TextObject9);

  function CurrentLine() {
    _classCallCheck(this, CurrentLine);

    _get(Object.getPrototypeOf(CurrentLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CurrentLine, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection3 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection3.row;

      var range = this.editor.bufferRangeForBufferRow(row);
      return this.isA() ? range : this.trimBufferRange(range);
    }
  }]);

  return CurrentLine;
})(TextObject);

var Entire = (function (_TextObject10) {
  _inherits(Entire, _TextObject10);

  function Entire() {
    _classCallCheck(this, Entire);

    _get(Object.getPrototypeOf(Entire.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(Entire, [{
    key: 'getRange',
    value: function getRange(selection) {
      return this.editor.buffer.getRange();
    }
  }]);

  return Entire;
})(TextObject);

var Empty = (function (_TextObject11) {
  _inherits(Empty, _TextObject11);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(Empty, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Empty;
})(TextObject);

var LatestChange = (function (_TextObject12) {
  _inherits(LatestChange, _TextObject12);

  function LatestChange() {
    _classCallCheck(this, LatestChange);

    _get(Object.getPrototypeOf(LatestChange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LatestChange, [{
    key: 'getRange',
    value: function getRange(selection) {
      var start = this.vimState.mark.get('[');
      var end = this.vimState.mark.get(']');
      if (start && end) {
        return new Range(start, end);
      }
    }
  }]);

  return LatestChange;
})(TextObject);

var SearchMatchForward = (function (_TextObject13) {
  _inherits(SearchMatchForward, _TextObject13);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: 'findMatch',
    value: function findMatch(from, regex) {
      if (this.backward) {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'backward');
        }

        var options = { from: [from.row, Infinity] };
        return {
          range: this.findInEditor('backward', regex, options, function (_ref9) {
            var range = _ref9.range;
            return range.start.isLessThan(from) && range;
          }),
          whichIsHead: 'start'
        };
      } else {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'forward');
        }

        var options = { from: [from.row, 0] };
        return {
          range: this.findInEditor('forward', regex, options, function (_ref10) {
            var range = _ref10.range;
            return range.end.isGreaterThan(from) && range;
          }),
          whichIsHead: 'end'
        };
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var pattern = this.globalState.get('lastSearchPattern');
      if (!pattern) return;

      var fromPoint = selection.getHeadBufferPosition();

      var _findMatch = this.findMatch(fromPoint, pattern);

      var range = _findMatch.range;
      var whichIsHead = _findMatch.whichIsHead;

      if (range) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    }
  }, {
    key: 'unionRangeAndDetermineReversedState',
    value: function unionRangeAndDetermineReversedState(selection, range, whichIsHead) {
      if (selection.isEmpty()) return range;

      var head = range[whichIsHead];
      var tail = selection.getTailBufferPosition();

      if (this.backward) {
        if (tail.isLessThan(head)) head = this.utils.translatePointAndClip(this.editor, head, 'forward');
      } else {
        if (head.isLessThan(tail)) head = this.utils.translatePointAndClip(this.editor, head, 'backward');
      }

      this.reversed = head.isLessThan(tail);
      return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
    }
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range, { reversed: this.reversed != null ? this.reversed : this.backward });
        return true;
      }
    }
  }]);

  return SearchMatchForward;
})(TextObject);

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = true;
  }

  // [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
  // So even if original selection was vL or vB, selected range by this text-object
  // is always vC range.
  return SearchMatchBackward;
})(SearchMatchForward);

var PreviousSelection = (function (_TextObject14) {
  _inherits(PreviousSelection, _TextObject14);

  function PreviousSelection() {
    _classCallCheck(this, PreviousSelection);

    _get(Object.getPrototypeOf(PreviousSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PreviousSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var _vimState$previousSelection = this.vimState.previousSelection;
      var properties = _vimState$previousSelection.properties;
      var submode = _vimState$previousSelection.submode;

      if (properties && submode) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    }
  }]);

  return PreviousSelection;
})(TextObject);

var PersistentSelection = (function (_TextObject15) {
  _inherits(PersistentSelection, _TextObject15);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  // Used only by ReplaceWithRegister and PutBefore and its' children.

  _createClass(PersistentSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    }
  }]);

  return PersistentSelection;
})(TextObject);

var LastPastedRange = (function (_TextObject16) {
  _inherits(LastPastedRange, _TextObject16);

  function LastPastedRange() {
    _classCallCheck(this, LastPastedRange);

    _get(Object.getPrototypeOf(LastPastedRange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LastPastedRange, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      for (selection of this.editor.getSelections()) {
        var range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return LastPastedRange;
})(TextObject);

var VisibleArea = (function (_TextObject17) {
  _inherits(VisibleArea, _TextObject17);

  function VisibleArea() {
    _classCallCheck(this, VisibleArea);

    _get(Object.getPrototypeOf(VisibleArea.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(VisibleArea, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _editor$getVisibleRowRange = this.editor.getVisibleRowRange();

      var _editor$getVisibleRowRange2 = _slicedToArray(_editor$getVisibleRowRange, 2);

      var startRow = _editor$getVisibleRowRange2[0];
      var endRow = _editor$getVisibleRowRange2[1];

      return this.editor.bufferRangeForScreenRange([[startRow, 0], [endRow, Infinity]]);
    }
  }]);

  return VisibleArea;
})(TextObject);

var DiffHunk = (function (_TextObject18) {
  _inherits(DiffHunk, _TextObject18);

  function DiffHunk() {
    _classCallCheck(this, DiffHunk);

    _get(Object.getPrototypeOf(DiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(DiffHunk, [{
    key: 'getRange',
    value: function getRange(selection) {
      var row = this.getCursorPositionForSelection(selection).row;
      return this.utils.getHunkRangeAtBufferRow(this.editor, row);
    }
  }]);

  return DiffHunk;
})(TextObject);

module.exports = Object.assign({
  TextObject: TextObject,
  Word: Word,
  WholeWord: WholeWord,
  SmartWord: SmartWord,
  Subword: Subword,
  Pair: Pair,
  APair: APair,
  AnyPair: AnyPair,
  AnyPairAllowForwarding: AnyPairAllowForwarding,
  AnyQuote: AnyQuote,
  Quote: Quote,
  DoubleQuote: DoubleQuote,
  SingleQuote: SingleQuote,
  BackTick: BackTick,
  CurlyBracket: CurlyBracket,
  SquareBracket: SquareBracket,
  Parenthesis: Parenthesis,
  AngleBracket: AngleBracket,
  Tag: Tag,
  Paragraph: Paragraph,
  Indentation: Indentation,
  Comment: Comment,
  CommentOrParagraph: CommentOrParagraph,
  Fold: Fold,
  Function: Function,
  Arguments: Arguments,
  CurrentLine: CurrentLine,
  Entire: Entire,
  Empty: Empty,
  LatestChange: LatestChange,
  SearchMatchForward: SearchMatchForward,
  SearchMatchBackward: SearchMatchBackward,
  PreviousSelection: PreviousSelection,
  PersistentSelection: PersistentSelection,
  LastPastedRange: LastPastedRange,
  VisibleArea: VisibleArea
}, Word.deriveClass(true), WholeWord.deriveClass(true), SmartWord.deriveClass(true), Subword.deriveClass(true), AnyPair.deriveClass(true), AnyPairAllowForwarding.deriveClass(true), AnyQuote.deriveClass(true), DoubleQuote.deriveClass(true), SingleQuote.deriveClass(true), BackTick.deriveClass(true), CurlyBracket.deriveClass(true, true), SquareBracket.deriveClass(true, true), Parenthesis.deriveClass(true, true), AngleBracket.deriveClass(true, true), Tag.deriveClass(true), Paragraph.deriveClass(true), Indentation.deriveClass(true), Comment.deriveClass(true), CommentOrParagraph.deriveClass(true), Fold.deriveClass(true), Function.deriveClass(true), Arguments.deriveClass(true), CurrentLine.deriveClass(true), Entire.deriveClass(true), LatestChange.deriveClass(true), PersistentSelection.deriveClass(true), VisibleArea.deriveClass(true), DiffHunk.deriveClass(true));
// FIXME #472, #66
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hwdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztlQUVZLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7Ozs7O0FBS25CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7O0lBRXJDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FJZCxRQUFRLEdBQUcsSUFBSTtTQUNmLElBQUksR0FBRyxlQUFlO1NBQ3RCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGVBQWUsR0FBRyxLQUFLOzs7Ozs7ZUFSbkIsVUFBVTs7V0E4Q04sbUJBQUc7QUFDVCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7OztXQUVHLGVBQUc7QUFDTCxhQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUNuQjs7O1dBRVUsc0JBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVyx1QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVTLG1CQUFDLElBQUksRUFBRTtBQUNmLGFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDMUI7OztXQUVVLHNCQUFHO0FBQ1osVUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7S0FDN0I7Ozs7Ozs7V0FLTyxtQkFBRzs7QUFFVCxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFD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LENBQUMsRUFDMUIsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDN0IsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDN0IsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDMUIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3BDLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNyQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFDbkMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3BDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ3JCLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzNCLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzdCLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ3pCLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDdEIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDMUIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDM0IsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDN0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDeEIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDOUIsbUJBQW1CLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUNyQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUM3QixRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUMzQixDQUFBIiwiZmlsZSI6Ii9ob21lL2hwdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSgnYXRvbScpXG5cbi8vIFtUT0RPXSBOZWVkIG92ZXJoYXVsXG4vLyAgLSBbIF0gTWFrZSBleHBhbmRhYmxlIGJ5IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSlcbi8vICAtIFsgXSBDb3VudCBzdXBwb3J0KHByaW9yaXR5IGxvdyk/XG5jb25zdCBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJylcbmNvbnN0IFBhaXJGaW5kZXIgPSByZXF1aXJlKCcuL3BhaXItZmluZGVyJylcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9ICd0ZXh0LW9iamVjdCdcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuXG4gIG9wZXJhdG9yID0gbnVsbFxuICB3aXNlID0gJ2NoYXJhY3Rlcndpc2UnXG4gIHN1cHBvcnRDb3VudCA9IGZhbHNlIC8vIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBzdGF0aWMgZGVyaXZlQ2xhc3MgKGlubmVyQW5kQSwgaW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgdGhpcy5jb21tYW5kID0gZmFsc2UgLy8gSEFDSzoga2xhc3MgdG8gZGVyaXZlIGNoaWxkIGNsYXNzIGlzIG5vdCBjb21tYW5kXG4gICAgY29uc3Qgc3RvcmUgPSB7fVxuICAgIGlmIChpbm5lckFuZEEpIHtcbiAgICAgIGNvbnN0IGtsYXNzQSA9IHRoaXMuZ2VuZXJhdGVDbGFzcyhmYWxzZSlcbiAgICAgIGNvbnN0IGtsYXNzSSA9IHRoaXMuZ2VuZXJhdGVDbGFzcyh0cnVlKVxuICAgICAgc3RvcmVba2xhc3NBLm5hbWVdID0ga2xhc3NBXG4gICAgICBzdG9yZVtrbGFzc0kubmFtZV0gPSBrbGFzc0lcbiAgICB9XG4gICAgaWYgKGlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZykge1xuICAgICAgY29uc3Qga2xhc3NBID0gdGhpcy5nZW5lcmF0ZUNsYXNzKGZhbHNlLCB0cnVlKVxuICAgICAgY29uc3Qga2xhc3NJID0gdGhpcy5nZW5lcmF0ZUNsYXNzKHRydWUsIHRydWUpXG4gICAgICBzdG9yZVtrbGFzc0EubmFtZV0gPSBrbGFzc0FcbiAgICAgIHN0b3JlW2tsYXNzSS5uYW1lXSA9IGtsYXNzSVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmVcbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZUNsYXNzIChpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgbGV0IG5hbWUgPSAoaW5uZXIgPyAnSW5uZXInIDogJ0EnKSArIHRoaXMubmFtZVxuICAgIGlmIChhbGxvd0ZvcndhcmRpbmcpIHtcbiAgICAgIG5hbWUgKz0gJ0FsbG93Rm9yd2FyZGluZydcbiAgICB9XG5cbiAgICByZXR1cm4gY2xhc3MgZXh0ZW5kcyB0aGlzIHtcbiAgICAgIHN0YXRpYyBuYW1lID0gbmFtZVxuICAgICAgY29uc3RydWN0b3IgKHZpbVN0YXRlKSB7XG4gICAgICAgIHN1cGVyKHZpbVN0YXRlKVxuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXJcbiAgICAgICAgaWYgKGFsbG93Rm9yd2FyZGluZyAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5hbGxvd0ZvcndhcmRpbmcgPSBhbGxvd0ZvcndhcmRpbmdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzSW5uZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmlubmVyXG4gIH1cblxuICBpc0EgKCkge1xuICAgIHJldHVybiAhdGhpcy5pbm5lclxuICB9XG5cbiAgaXNMaW5ld2lzZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gJ2xpbmV3aXNlJ1xuICB9XG5cbiAgaXNCbG9ja3dpc2UgKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09ICdibG9ja3dpc2UnXG4gIH1cblxuICBmb3JjZVdpc2UgKHdpc2UpIHtcbiAgICByZXR1cm4gKHRoaXMud2lzZSA9IHdpc2UpIC8vIEZJWE1FIGN1cnJlbnRseSBub3Qgd2VsbCBzdXBwb3J0ZWRcbiAgfVxuXG4gIHJlc2V0U3RhdGUgKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vIGV4ZWN1dGU6IENhbGxlZCBmcm9tIE9wZXJhdG9yOjpzZWxlY3RUYXJnZXQoKVxuICAvLyAgLSBgdiBpIHBgLCBpcyBgVmlzdWFsTW9kZVNlbGVjdGAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgLy8gIC0gYGQgaSBwYCwgaXMgYERlbGV0ZWAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgLy8gV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcignaW4gVGV4dE9iamVjdDogTXVzdCBub3QgaGFwcGVuJylcbiAgICB0aGlzLnNlbGVjdCgpXG4gIH1cblxuICBzZWxlY3QgKCkge1xuICAgIGlmICh0aGlzLmlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG5cbiAgICB0aGlzLmNvdW50VGltZXModGhpcy5nZXRDb3VudCgpLCAoe3N0b3B9KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3VwcG9ydENvdW50KSBzdG9wKCkgLy8gcXVpY2stZml4IGZvciAjNTYwXG5cbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSB0cnVlXG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VxdWFsKG9sZFJhbmdlKSkgc3RvcCgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdE9uY2UpIGJyZWFrXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgLy8gU29tZSBUZXh0T2JqZWN0J3Mgd2lzZSBpcyBOT1QgZGV0ZXJtaW5pc3RpYy4gSXQgaGFzIHRvIGJlIGRldGVjdGVkIGZyb20gc2VsZWN0ZWQgcmFuZ2UuXG4gICAgaWYgKHRoaXMud2lzZSA9PSBudWxsKSB0aGlzLndpc2UgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpXG5cbiAgICBpZiAodGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3RCYXNlJykpIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdFN1Y2NlZWRlZCkge1xuICAgICAgICBpZiAodGhpcy53aXNlID09PSAnY2hhcmFjdGVyd2lzZScpIHtcbiAgICAgICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yLCB7Zm9yY2U6IHRydWV9KVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2lzZSA9PT0gJ2xpbmV3aXNlJykge1xuICAgICAgICAgIC8vIFdoZW4gdGFyZ2V0IGlzIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBuZXcgc2VsZWN0aW9uIGlzIGFkZGVkIGFmdGVyIHNlbGVjdFRleHRPYmplY3QuXG4gICAgICAgICAgLy8gU28gd2UgaGF2ZSB0byBhc3N1cmUgYWxsIHNlbGVjdGlvbiBoYXZlIHNlbGN0aW9uIHByb3BlcnR5LlxuICAgICAgICAgIC8vIE1heWJlIHRoaXMgbG9naWMgY2FuIGJlIG1vdmVkIHRvIG9wZXJhdGlvbiBzdGFjay5cbiAgICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdzdGF5T25TZWxlY3RUZXh0T2JqZWN0JykpIHtcbiAgICAgICAgICAgICAgaWYgKCEkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKSkge1xuICAgICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzZWxlY3Rpb24uZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3VibW9kZSA9PT0gJ2Jsb2Nrd2lzZScpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLy8gdG8gb3ZlcnJpZGVcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge31cbn1cblxuLy8gU2VjdGlvbjogV29yZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCB7cmFuZ2V9ID0gdGhpcy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwge3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gdGhpcy51dGlscy5leHBhbmRSYW5nZVRvV2hpdGVTcGFjZXModGhpcy5lZGl0b3IsIHJhbmdlKSA6IHJhbmdlXG4gIH1cbn1cblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL1xufVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmQge1xuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBzZWxlY3Rpb24uY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHJldHVybiBzdXBlci5nZXRSYW5nZShzZWxlY3Rpb24pXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogUGFpclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUGFpciBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcbiAgYWxsb3dOZXh0TGluZSA9IG51bGxcbiAgYWRqdXN0SW5uZXJSYW5nZSA9IHRydWVcbiAgcGFpciA9IG51bGxcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIGlzQWxsb3dOZXh0TGluZSAoKSB7XG4gICAgaWYgKHRoaXMuYWxsb3dOZXh0TGluZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5hbGxvd05leHRMaW5lXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhaXIgJiYgdGhpcy5wYWlyWzBdICE9PSB0aGlzLnBhaXJbMV1cbiAgICB9XG4gIH1cblxuICBhZGp1c3RSYW5nZSAoe3N0YXJ0LCBlbmR9KSB7XG4gICAgLy8gRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgIC8vIFdoZXJlIHRoaXMgYWRqdXN0bWVudCBhcHBlYXIgaXMgaW4gZm9sbG93aW5nIHNpdHVhdGlvbi5cbiAgICAvLyBvcC0xOiBgY2l7YCByZXBsYWNlIG9ubHkgMm5kIGxpbmVcbiAgICAvLyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAvLyB0ZXh0OlxuICAgIC8vICB7XG4gICAgLy8gICAgYWFhXG4gICAgLy8gIH1cbiAgICBpZiAodGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmUodGhpcy5lZGl0b3IsIHN0YXJ0KSkge1xuICAgICAgc3RhcnQgPSBzdGFydC50cmF2ZXJzZShbMSwgMF0pXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXRpbHMuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBlbmQpLm1hdGNoKC9eXFxzKiQvKSkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBzbGlnaHRseSBpbm5jb25zaXN0ZW50IHdpdGggcmVndWxhciBWaW1cbiAgICAgICAgLy8gLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAvLyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsIHNpbmNlIHRvIG1ha2Ugc3VibW9kZSBgY2hhcmFjdGVyd2lzZWAgd2hlbiBhdXRvLWRldGVjdCBzdWJtb2RlXG4gICAgICAgIC8vIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGdldEZpbmRlciAoKSB7XG4gICAgY29uc3QgZmluZGVyTmFtZSA9IHRoaXMucGFpclswXSA9PT0gdGhpcy5wYWlyWzFdID8gJ1F1b3RlRmluZGVyJyA6ICdCcmFja2V0RmluZGVyJ1xuICAgIHJldHVybiBuZXcgUGFpckZpbmRlcltmaW5kZXJOYW1lXSh0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBwYWlyOiB0aGlzLnBhaXIsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlXG4gICAgfSlcbiAgfVxuXG4gIGdldFBhaXJJbmZvIChmcm9tKSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdElubmVyUmFuZ2UpIHtcbiAgICAgICAgcGFpckluZm8uaW5uZXJSYW5nZSA9IHRoaXMuYWRqdXN0UmFuZ2UocGFpckluZm8uaW5uZXJSYW5nZSlcbiAgICAgIH1cbiAgICAgIHBhaXJJbmZvLnRhcmdldFJhbmdlID0gdGhpcy5pc0lubmVyKCkgPyBwYWlySW5mby5pbm5lclJhbmdlIDogcGFpckluZm8uYVJhbmdlXG4gICAgICByZXR1cm4gcGFpckluZm9cbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgLy8gV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIChwYWlySW5mbyAmJiBwYWlySW5mby50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpKSB7XG4gICAgICBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICB9XG4gICAgaWYgKHBhaXJJbmZvKSB7XG4gICAgICByZXR1cm4gcGFpckluZm8udGFyZ2V0UmFuZ2VcbiAgICB9XG4gIH1cbn1cblxuLy8gVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxufVxuXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IGZhbHNlXG4gIG1lbWJlciA9IFsnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snLCAnQ3VybHlCcmFja2V0JywgJ0FuZ2xlQnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ1BhcmVudGhlc2lzJ11cblxuICBnZXRSYW5nZXMgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBpbm5lcjogdGhpcy5pbm5lcixcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlXG4gICAgfVxuICAgIGNvbnN0IGdldFJhbmdlQnlNZW1iZXIgPSBtZW1iZXIgPT4gdGhpcy5nZXRJbnN0YW5jZShtZW1iZXIsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICByZXR1cm4gdGhpcy5tZW1iZXIubWFwKGdldFJhbmdlQnlNZW1iZXIpLmZpbHRlcih2ID0+IHYpXG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc29ydFJhbmdlcyh0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pKS5wb3AoKVxuICB9XG59XG5cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgY29uc3QgZnJvbSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxldCBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IHRoaXMuXy5wYXJ0aXRpb24ocmFuZ2VzLCByYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChmcm9tKSlcbiAgICBjb25zdCBlbmNsb3NpbmdSYW5nZSA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpLnBvcCgpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhmb3J3YXJkaW5nUmFuZ2VzKVxuXG4gICAgLy8gV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgLy8gV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAvLyBTbyBjaG9vc2UgZnJvbSByYW5nZXMgY29udGFpbmVkIGluIGVuY2xvc2luZ1JhbmdlLlxuICAgIGlmIChlbmNsb3NpbmdSYW5nZSkge1xuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyKHJhbmdlID0+IGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKVxuICAgIH1cblxuICAgIHJldHVybiBmb3J3YXJkaW5nUmFuZ2VzWzBdIHx8IGVuY2xvc2luZ1JhbmdlXG4gIH1cbn1cblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBtZW1iZXIgPSBbJ0RvdWJsZVF1b3RlJywgJ1NpbmdsZVF1b3RlJywgJ0JhY2tUaWNrJ11cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgLy8gUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIHJldHVybiB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pLnNvcnQoKGEsIGIpID0+IGEuZW5kLmNvbHVtbiAtIGIuZW5kLmNvbHVtbilbMF1cbiAgfVxufVxuXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbn1cblxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbJ1wiJywgJ1wiJ11cbn1cblxuY2xhc3MgU2luZ2xlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbXCInXCIsIFwiJ1wiXVxufVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnYCcsICdgJ11cbn1cblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbJ3snLCAnfSddXG59XG5cbmNsYXNzIFNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsnWycsICddJ11cbn1cblxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsnKCcsICcpJ11cbn1cblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbJzwnLCAnPiddXG59XG5cbmNsYXNzIFRhZyBleHRlbmRzIFBhaXIge1xuICBhbGxvd05leHRMaW5lID0gdHJ1ZVxuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG4gIGFkanVzdElubmVyUmFuZ2UgPSBmYWxzZVxuXG4gIGdldFRhZ1N0YXJ0UG9pbnQgKGZyb20pIHtcbiAgICBjb25zdCByZWdleCA9IFBhaXJGaW5kZXIuVGFnRmluZGVyLnBhdHRlcm5cbiAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgMF19XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKCdmb3J3YXJkJywgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpICYmIHJhbmdlLnN0YXJ0KVxuICB9XG5cbiAgZ2V0RmluZGVyICgpIHtcbiAgICByZXR1cm4gbmV3IFBhaXJGaW5kZXIuVGFnRmluZGVyKHRoaXMuZWRpdG9yLCB7XG4gICAgICBhbGxvd05leHRMaW5lOiB0aGlzLmlzQWxsb3dOZXh0TGluZSgpLFxuICAgICAgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZyxcbiAgICAgIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmVcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8gKGZyb20pIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0UGFpckluZm8odGhpcy5nZXRUYWdTdGFydFBvaW50KGZyb20pIHx8IGZyb20pXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogUGFyYWdyYXBoXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBQYXJhZ3JhcGggaXMgZGVmaW5lZCBhcyBjb25zZWN1dGl2ZSAobm9uLSlibGFuay1saW5lLlxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcblxuICBmaW5kUm93IChmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSB7XG4gICAgaWYgKGZuLnJlc2V0KSBmbi5yZXNldCgpXG4gICAgbGV0IGZvdW5kUm93ID0gZnJvbVJvd1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0QnVmZmVyUm93cyh7c3RhcnRSb3c6IGZyb21Sb3csIGRpcmVjdGlvbn0pKSB7XG4gICAgICBpZiAoIWZuKHJvdywgZGlyZWN0aW9uKSkgYnJlYWtcbiAgICAgIGZvdW5kUm93ID0gcm93XG4gICAgfVxuICAgIHJldHVybiBmb3VuZFJvd1xuICB9XG5cbiAgZmluZFJvd1JhbmdlQnkgKGZyb21Sb3csIGZuKSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgJ3ByZXZpb3VzJywgZm4pXG4gICAgY29uc3QgZW5kUm93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csICduZXh0JywgZm4pXG4gICAgcmV0dXJuIFtzdGFydFJvdywgZW5kUm93XVxuICB9XG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uIChmcm9tUm93LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93UmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tUm93KVxuXG4gICAgaWYgKHRoaXMuaXNJbm5lcigpKSB7XG4gICAgICByZXR1cm4gKHJvdywgZGlyZWN0aW9uKSA9PiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgPT09IGZyb21Sb3dSZXN1bHRcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGlyZWN0aW9uVG9FeHRlbmQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpID8gJ3ByZXZpb3VzJyA6ICduZXh0J1xuXG4gICAgICBsZXQgZmxpcCA9IGZhbHNlXG4gICAgICBjb25zdCBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSA9PT0gZnJvbVJvd1Jlc3VsdFxuICAgICAgICBpZiAoZmxpcCkge1xuICAgICAgICAgIHJldHVybiAhcmVzdWx0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQgJiYgZGlyZWN0aW9uID09PSBkaXJlY3Rpb25Ub0V4dGVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbGlwID0gdHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcmVkaWN0LnJlc2V0ID0gKCkgPT4gKGZsaXAgPSBmYWxzZSlcbiAgICAgIHJldHVybiBwcmVkaWN0XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGxldCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGlmICh0aGlzLmlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJykpIHtcbiAgICAgIGlmIChzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKSBmcm9tUm93LS1cbiAgICAgIGVsc2UgZnJvbVJvdysrXG4gICAgICBmcm9tUm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIH1cbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgdGhpcy5nZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSlcbiAgICByZXR1cm4gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSlcbiAgfVxufVxuXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGNvbnN0IGJhc2VJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLmZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHJvdyA9PiB7XG4gICAgICBpZiAodGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogQ29tbWVudFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tbWVudCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBDb21tZW50XG4gIHdpc2UgPSAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLnV0aWxzLmdldFJvd1JhbmdlRm9yQ29tbWVudEF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKHJvd1JhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDb21tZW50T3JQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge2lubmVyfSA9IHRoaXNcbiAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIFsnQ29tbWVudCcsICdQYXJhZ3JhcGgnXSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKGtsYXNzLCB7aW5uZXJ9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBpZiAocmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIFNlY3Rpb246IEZvbGRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEZvbGQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCBzZWxlY3RlZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgIGNvbnN0IGZvbGRSYW5nZXMgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUmFuZ2VzKHRoaXMuZWRpdG9yKVxuICAgIGNvbnN0IGZvbGRSYW5nZXNDb250YWluc0N1cnNvclJvdyA9IGZvbGRSYW5nZXMuZmlsdGVyKHJhbmdlID0+IHJhbmdlLnN0YXJ0LnJvdyA8PSByb3cgJiYgcm93IDw9IHJhbmdlLmVuZC5yb3cpXG5cbiAgICBmb3IgKGxldCBmb2xkUmFuZ2Ugb2YgZm9sZFJhbmdlc0NvbnRhaW5zQ3Vyc29yUm93LnJldmVyc2UoKSkge1xuICAgICAgaWYgKHRoaXMuaXNBKCkpIHtcbiAgICAgICAgbGV0IGNvbmpvaW5lZFxuICAgICAgICB3aGlsZSAoKGNvbmpvaW5lZCA9IGZvbGRSYW5nZXMuZmluZChyYW5nZSA9PiByYW5nZS5lbmQucm93ID09PSBmb2xkUmFuZ2Uuc3RhcnQucm93KSkpIHtcbiAgICAgICAgICBmb2xkUmFuZ2UgPSBmb2xkUmFuZ2UudW5pb24oY29uam9pbmVkKVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlICgoY29uam9pbmVkID0gZm9sZFJhbmdlcy5maW5kKHJhbmdlID0+IHJhbmdlLnN0YXJ0LnJvdyA9PT0gZm9sZFJhbmdlLmVuZC5yb3cpKSkge1xuICAgICAgICAgIGZvbGRSYW5nZSA9IGZvbGRSYW5nZS51bmlvbihjb25qb2luZWQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnV0aWxzLmRvZXNSYW5nZVN0YXJ0QW5kRW5kV2l0aFNhbWVJbmRlbnRMZXZlbCh0aGlzLmVkaXRvciwgZm9sZFJhbmdlKSkge1xuICAgICAgICAgIGZvbGRSYW5nZS5lbmQucm93IC09IDFcbiAgICAgICAgfVxuICAgICAgICBmb2xkUmFuZ2Uuc3RhcnQucm93ICs9IDFcbiAgICAgIH1cbiAgICAgIGZvbGRSYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShbZm9sZFJhbmdlLnN0YXJ0LnJvdywgZm9sZFJhbmdlLmVuZC5yb3ddKVxuICAgICAgaWYgKCFzZWxlY3RlZFJhbmdlLmNvbnRhaW5zUmFuZ2UoZm9sZFJhbmdlKSkge1xuICAgICAgICByZXR1cm4gZm9sZFJhbmdlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEZ1bmN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHNjb3BlTmFtZXNPbWl0dGluZ0Nsb3NpbmdCcmFjZSA9IFsnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXSAvLyBsYW5ndWFnZSBkb2Vzbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuXG4gIGdldEZ1bmN0aW9uQm9keVN0YXJ0UmVnZXggKHtzY29wZU5hbWV9KSB7XG4gICAgaWYgKHNjb3BlTmFtZSA9PT0gJ3NvdXJjZS5weXRob24nKSB7XG4gICAgICByZXR1cm4gLzokL1xuICAgIH0gZWxzZSBpZiAoc2NvcGVOYW1lID09PSAnc291cmNlLmNvZmZlZScpIHtcbiAgICAgIHJldHVybiAvLXw9PiQvXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAveyQvXG4gICAgfVxuICB9XG5cbiAgaXNNdWx0aUxpbmVQYXJhbWV0ZXJGdW5jdGlvblJhbmdlIChwYXJhbWV0ZXJSYW5nZSwgYm9keVJhbmdlLCBib2R5U3RhcnRSZWdleCkge1xuICAgIGNvbnN0IGlzQm9keVN0YXJ0Um93ID0gcm93ID0+IGJvZHlTdGFydFJlZ2V4LnRlc3QodGhpcy5lZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcbiAgICBpZiAoaXNCb2R5U3RhcnRSb3cocGFyYW1ldGVyUmFuZ2Uuc3RhcnQucm93KSkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGlzQm9keVN0YXJ0Um93KHBhcmFtZXRlclJhbmdlLmVuZC5yb3cpKSByZXR1cm4gcGFyYW1ldGVyUmFuZ2UuZW5kLnJvdyA9PT0gYm9keVJhbmdlLnN0YXJ0LnJvd1xuICAgIGlmIChpc0JvZHlTdGFydFJvdyhwYXJhbWV0ZXJSYW5nZS5lbmQucm93ICsgMSkpIHJldHVybiBwYXJhbWV0ZXJSYW5nZS5lbmQucm93ICsgMSA9PT0gYm9keVJhbmdlLnN0YXJ0LnJvd1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuZWRpdG9yXG4gICAgY29uc3QgY3Vyc29yUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGNvbnN0IGJvZHlTdGFydFJlZ2V4ID0gdGhpcy5nZXRGdW5jdGlvbkJvZHlTdGFydFJlZ2V4KGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgY29uc3QgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IHJvdyA9PiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coZWRpdG9yLCByb3cpXG5cbiAgICBjb25zdCBmdW5jdGlvblJhbmdlcyA9IFtdXG4gICAgY29uc3Qgc2F2ZUZ1bmN0aW9uUmFuZ2UgPSAoe2FSYW5nZSwgaW5uZXJSYW5nZX0pID0+IHtcbiAgICAgIGZ1bmN0aW9uUmFuZ2VzLnB1c2goe1xuICAgICAgICBhUmFuZ2U6IHRoaXMuYnVpbGRBUmFuZ2UoYVJhbmdlKSxcbiAgICAgICAgaW5uZXJSYW5nZTogdGhpcy5idWlsZElubmVyUmFuZ2UoaW5uZXJSYW5nZSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgZm9sZFJhbmdlcyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSYW5nZXMoZWRpdG9yKVxuICAgIHdoaWxlIChmb2xkUmFuZ2VzLmxlbmd0aCkge1xuICAgICAgY29uc3QgcmFuZ2UgPSBmb2xkUmFuZ2VzLnNoaWZ0KClcbiAgICAgIGlmIChpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHJhbmdlLnN0YXJ0LnJvdykpIHtcbiAgICAgICAgY29uc3QgbmV4dFJhbmdlID0gZm9sZFJhbmdlc1swXVxuICAgICAgICBjb25zdCBuZXh0Rm9sZElzQ29ubmVjdGVkID0gbmV4dFJhbmdlICYmIG5leHRSYW5nZS5zdGFydC5yb3cgPD0gcmFuZ2UuZW5kLnJvdyArIDFcbiAgICAgICAgY29uc3QgbWF5YmVBRnVuY3Rpb25SYW5nZSA9IG5leHRGb2xkSXNDb25uZWN0ZWQgPyByYW5nZS51bmlvbihuZXh0UmFuZ2UpIDogcmFuZ2VcbiAgICAgICAgaWYgKCFtYXliZUFGdW5jdGlvblJhbmdlLmNvbnRhaW5zUG9pbnQoW2N1cnNvclJvdywgSW5maW5pdHldKSkgY29udGludWUgLy8gc2tpcCB0byBhdm9pZCBoZWF2eSBjb21wdXRhdGlvblxuICAgICAgICBpZiAobmV4dEZvbGRJc0Nvbm5lY3RlZCAmJiB0aGlzLmlzTXVsdGlMaW5lUGFyYW1ldGVyRnVuY3Rpb25SYW5nZShyYW5nZSwgbmV4dFJhbmdlLCBib2R5U3RhcnRSZWdleCkpIHtcbiAgICAgICAgICBjb25zdCBib2R5UmFuZ2UgPSBmb2xkUmFuZ2VzLnNoaWZ0KClcbiAgICAgICAgICBzYXZlRnVuY3Rpb25SYW5nZSh7YVJhbmdlOiByYW5nZS51bmlvbihib2R5UmFuZ2UpLCBpbm5lclJhbmdlOiBib2R5UmFuZ2V9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IHJhbmdlLCBpbm5lclJhbmdlOiByYW5nZX0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzUm93ID0gcmFuZ2Uuc3RhcnQucm93IC0gMVxuICAgICAgICBpZiAocHJldmlvdXNSb3cgPCAwKSBjb250aW51ZVxuICAgICAgICBpZiAoZWRpdG9yLmlzRm9sZGFibGVBdEJ1ZmZlclJvdyhwcmV2aW91c1JvdykpIGNvbnRpbnVlXG4gICAgICAgIGNvbnN0IG1heWJlQUZ1bmN0aW9uUmFuZ2UgPSByYW5nZS51bmlvbihlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocHJldmlvdXNSb3cpKVxuICAgICAgICBpZiAoIW1heWJlQUZ1bmN0aW9uUmFuZ2UuY29udGFpbnNQb2ludChbY3Vyc29yUm93LCBJbmZpbml0eV0pKSBjb250aW51ZSAvLyBza2lwIHRvIGF2b2lkIGhlYXZ5IGNvbXB1dGF0aW9uXG5cbiAgICAgICAgY29uc3QgaXNCb2R5U3RhcnRPbmx5Um93ID0gcm93ID0+XG4gICAgICAgICAgbmV3IFJlZ0V4cCgnXlxcXFxzKicgKyBib2R5U3RhcnRSZWdleC5zb3VyY2UpLnRlc3QoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG4gICAgICAgIGlmIChpc0JvZHlTdGFydE9ubHlSb3cocmFuZ2Uuc3RhcnQucm93KSAmJiBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHByZXZpb3VzUm93KSkge1xuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IG1heWJlQUZ1bmN0aW9uUmFuZ2UsIGlubmVyUmFuZ2U6IHJhbmdlfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZnVuY3Rpb25SYW5nZSBvZiBmdW5jdGlvblJhbmdlcy5yZXZlcnNlKCkpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuaXNBKCkgPyBmdW5jdGlvblJhbmdlLmFSYW5nZSA6IGZ1bmN0aW9uUmFuZ2UuaW5uZXJSYW5nZVxuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoW3N0YXJ0LnJvdywgZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKSByZXR1cm4gcmFuZ2VcbiAgICB9XG4gIH1cblxuICBidWlsZElubmVyUmFuZ2UgKHJhbmdlKSB7XG4gICAgY29uc3QgZW5kUm93VHJhbnNsYXRpb24gPSB0aGlzLnV0aWxzLmRvZXNSYW5nZVN0YXJ0QW5kRW5kV2l0aFNhbWVJbmRlbnRMZXZlbCh0aGlzLmVkaXRvciwgcmFuZ2UpID8gLTEgOiAwXG4gICAgcmV0dXJuIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFtlbmRSb3dUcmFuc2xhdGlvbiwgMF0pXG4gIH1cblxuICBidWlsZEFSYW5nZSAocmFuZ2UpIHtcbiAgICAvLyBOT1RFOiBUaGlzIGFkanVzdG1lbnQgc2hvdWQgbm90IGJlIG5lY2Vzc2FyeSBpZiBsYW5ndWFnZS1zeW50YXggaXMgcHJvcGVybHkgZGVmaW5lZC5cbiAgICBjb25zdCBlbmRSb3dUcmFuc2xhdGlvbiA9IHRoaXMuaXNHcmFtbWFyRG9lc05vdEZvbGRDbG9zaW5nUm93KCkgPyArMSA6IDBcbiAgICByZXR1cm4gcmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgW2VuZFJvd1RyYW5zbGF0aW9uLCAwXSlcbiAgfVxuXG4gIGlzR3JhbW1hckRvZXNOb3RGb2xkQ2xvc2luZ1JvdyAoKSB7XG4gICAgY29uc3Qge3Njb3BlTmFtZSwgcGFja2FnZU5hbWV9ID0gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgaWYgKHRoaXMuc2NvcGVOYW1lc09taXR0aW5nQ2xvc2luZ0JyYWNlLmluY2x1ZGVzKHNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhBQ0s6IFJ1c3QgaGF2ZSB0d28gcGFja2FnZSBgbGFuZ3VhZ2UtcnVzdGAgYW5kIGBhdG9tLWxhbmd1YWdlLXJ1c3RgXG4gICAgICAvLyBsYW5ndWFnZS1ydXN0IGRvbid0IGZvbGQgZW5kaW5nIGB9YCwgYnV0IGF0b20tbGFuZ3VhZ2UtcnVzdCBkb2VzLlxuICAgICAgcmV0dXJuIHNjb3BlTmFtZSA9PT0gJ3NvdXJjZS5ydXN0JyAmJiBwYWNrYWdlTmFtZSA9PT0gJ2xhbmd1YWdlLXJ1c3QnXG4gICAgfVxuICB9XG59XG5cbi8vIFNlY3Rpb246IE90aGVyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBBcmd1bWVudHMgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgbmV3QXJnSW5mbyAoYXJnU3RhcnQsIGFyZywgc2VwYXJhdG9yKSB7XG4gICAgY29uc3QgYXJnRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIGFyZylcbiAgICBjb25zdCBhcmdSYW5nZSA9IG5ldyBSYW5nZShhcmdTdGFydCwgYXJnRW5kKVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgIT0gbnVsbCA/IHNlcGFyYXRvciA6ICcnKVxuICAgIGNvbnN0IHNlcGFyYXRvclJhbmdlID0gbmV3IFJhbmdlKGFyZ0VuZCwgc2VwYXJhdG9yRW5kKVxuXG4gICAgY29uc3QgaW5uZXJSYW5nZSA9IGFyZ1JhbmdlXG4gICAgY29uc3QgYVJhbmdlID0gYXJnUmFuZ2UudW5pb24oc2VwYXJhdG9yUmFuZ2UpXG4gICAgcmV0dXJuIHthcmdSYW5nZSwgc2VwYXJhdG9yUmFuZ2UsIGlubmVyUmFuZ2UsIGFSYW5nZX1cbiAgfVxuXG4gIGdldEFyZ3VtZW50c1JhbmdlRm9yU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgbWVtYmVyOiBbJ0N1cmx5QnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ1BhcmVudGhlc2lzJ10sXG4gICAgICBpbmNsdXNpdmU6IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKCdJbm5lckFueVBhaXInLCBvcHRpb25zKS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3NwbGl0QXJndW1lbnRzLCB0cmF2ZXJzZVRleHRGcm9tUG9pbnQsIGdldExhc3R9ID0gdGhpcy51dGlsc1xuICAgIGxldCByYW5nZSA9IHRoaXMuZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHBhaXJSYW5nZUZvdW5kID0gcmFuZ2UgIT0gbnVsbFxuXG4gICAgcmFuZ2UgPSByYW5nZSB8fCB0aGlzLmdldEluc3RhbmNlKCdJbm5lckN1cnJlbnRMaW5lJykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSAvLyBmYWxsYmFja1xuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgcmFuZ2UgPSB0aGlzLnRyaW1CdWZmZXJSYW5nZShyYW5nZSlcblxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBjb25zdCBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LCBwYWlyUmFuZ2VGb3VuZClcblxuICAgIGNvbnN0IGFyZ0luZm9zID0gW11cbiAgICBsZXQgYXJnU3RhcnQgPSByYW5nZS5zdGFydFxuXG4gICAgLy8gU2tpcCBzdGFydGluZyBzZXBhcmF0b3JcbiAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCAmJiBhbGxUb2tlbnNbMF0udHlwZSA9PT0gJ3NlcGFyYXRvcicpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGFyZ1N0YXJ0ID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCB0b2tlbi50ZXh0KVxuICAgIH1cblxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2FyZ3VtZW50Jykge1xuICAgICAgICBjb25zdCBuZXh0VG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSBuZXh0VG9rZW4gPyBuZXh0VG9rZW4udGV4dCA6IHVuZGVmaW5lZFxuICAgICAgICBjb25zdCBhcmdJbmZvID0gdGhpcy5uZXdBcmdJbmZvKGFyZ1N0YXJ0LCB0b2tlbi50ZXh0LCBzZXBhcmF0b3IpXG5cbiAgICAgICAgaWYgKGFsbFRva2Vucy5sZW5ndGggPT09IDAgJiYgYXJnSW5mb3MubGVuZ3RoKSB7XG4gICAgICAgICAgYXJnSW5mby5hUmFuZ2UgPSBhcmdJbmZvLmFyZ1JhbmdlLnVuaW9uKGdldExhc3QoYXJnSW5mb3MpLnNlcGFyYXRvclJhbmdlKVxuICAgICAgICB9XG5cbiAgICAgICAgYXJnU3RhcnQgPSBhcmdJbmZvLmFSYW5nZS5lbmRcbiAgICAgICAgYXJnSW5mb3MucHVzaChhcmdJbmZvKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtdXN0IG5vdCBoYXBwZW4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgZm9yIChjb25zdCB7aW5uZXJSYW5nZSwgYVJhbmdlfSBvZiBhcmdJbmZvcykge1xuICAgICAgaWYgKGlubmVyUmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0lubmVyKCkgPyBpbm5lclJhbmdlIDogYVJhbmdlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEN1cnJlbnRMaW5lIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gcmFuZ2UgOiB0aGlzLnRyaW1CdWZmZXJSYW5nZShyYW5nZSlcbiAgfVxufVxuXG5jbGFzcyBFbnRpcmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlci5nZXRSYW5nZSgpXG4gIH1cbn1cblxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzZWxlY3RPbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldCgnWycpXG4gICAgY29uc3QgZW5kID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldCgnXScpXG4gICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNYXRjaEZvcndhcmQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgYmFja3dhcmQgPSBmYWxzZVxuXG4gIGZpbmRNYXRjaCAoZnJvbSwgcmVnZXgpIHtcbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCAnYmFja3dhcmQnKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgSW5maW5pdHldfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2U6IHRoaXMuZmluZEluRWRpdG9yKCdiYWNrd2FyZCcsIHJlZ2V4LCBvcHRpb25zLCAoe3JhbmdlfSkgPT4gcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tKSAmJiByYW5nZSksXG4gICAgICAgIHdoaWNoSXNIZWFkOiAnc3RhcnQnXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09ICd2aXN1YWwnKSB7XG4gICAgICAgIGZyb20gPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgZnJvbSwgJ2ZvcndhcmQnKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgMF19XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZTogdGhpcy5maW5kSW5FZGl0b3IoJ2ZvcndhcmQnLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb20pICYmIHJhbmdlKSxcbiAgICAgICAgd2hpY2hJc0hlYWQ6ICdlbmQnXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKVxuICAgIGlmICghcGF0dGVybikgcmV0dXJuXG5cbiAgICBjb25zdCBmcm9tUG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCB7cmFuZ2UsIHdoaWNoSXNIZWFkfSA9IHRoaXMuZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKVxuICAgIH1cbiAgfVxuXG4gIHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlIChzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZCkge1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSByZXR1cm4gcmFuZ2VcblxuICAgIGxldCBoZWFkID0gcmFuZ2Vbd2hpY2hJc0hlYWRdXG4gICAgY29uc3QgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKHRoaXMuYmFja3dhcmQpIHtcbiAgICAgIGlmICh0YWlsLmlzTGVzc1RoYW4oaGVhZCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgJ2ZvcndhcmQnKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKSBoZWFkID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpXG4gICAgfVxuXG4gICAgdGhpcy5yZXZlcnNlZCA9IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgIHJldHVybiBuZXcgUmFuZ2UodGFpbCwgaGVhZCkudW5pb24odGhpcy5zd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuICB9XG5cbiAgc2VsZWN0VGV4dE9iamVjdCAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkOiB0aGlzLnJldmVyc2VkICE9IG51bGwgPyB0aGlzLnJldmVyc2VkIDogdGhpcy5iYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkIHtcbiAgYmFja3dhcmQgPSB0cnVlXG59XG5cbi8vIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4vLyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3Rcbi8vIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdCAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gdGhpcy52aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIChwcm9wZXJ0aWVzICYmIHN1Ym1vZGUpIHtcbiAgICAgIHRoaXMud2lzZSA9IHN1Ym1vZGVcbiAgICAgIHRoaXMuc3dyYXAodGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBpZiAodGhpcy52aW1TdGF0ZS5oYXNQZXJzaXN0ZW50U2VsZWN0aW9ucygpKSB7XG4gICAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVXNlZCBvbmx5IGJ5IFJlcGxhY2VXaXRoUmVnaXN0ZXIgYW5kIFB1dEJlZm9yZSBhbmQgaXRzJyBjaGlsZHJlbi5cbmNsYXNzIExhc3RQYXN0ZWRSYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdCAoc2VsZWN0aW9uKSB7XG4gICAgZm9yIChzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5nZXRQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gdGhpcy5lZGl0b3IuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShbW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgSW5maW5pdHldXSlcbiAgfVxufVxuXG5jbGFzcyBEaWZmSHVuayBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEh1bmtSYW5nZUF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKFxuICB7XG4gICAgVGV4dE9iamVjdCxcbiAgICBXb3JkLFxuICAgIFdob2xlV29yZCxcbiAgICBTbWFydFdvcmQsXG4gICAgU3Vid29yZCxcbiAgICBQYWlyLFxuICAgIEFQYWlyLFxuICAgIEFueVBhaXIsXG4gICAgQW55UGFpckFsbG93Rm9yd2FyZGluZyxcbiAgICBBbnlRdW90ZSxcbiAgICBRdW90ZSxcbiAgICBEb3VibGVRdW90ZSxcbiAgICBTaW5nbGVRdW90ZSxcbiAgICBCYWNrVGljayxcbiAgICBDdXJseUJyYWNrZXQsXG4gICAgU3F1YXJlQnJhY2tldCxcbiAgICBQYXJlbnRoZXNpcyxcbiAgICBBbmdsZUJyYWNrZXQsXG4gICAgVGFnLFxuICAgIFBhcmFncmFwaCxcbiAgICBJbmRlbnRhdGlvbixcbiAgICBDb21tZW50LFxuICAgIENvbW1lbnRPclBhcmFncmFwaCxcbiAgICBGb2xkLFxuICAgIEZ1bmN0aW9uLFxuICAgIEFyZ3VtZW50cyxcbiAgICBDdXJyZW50TGluZSxcbiAgICBFbnRpcmUsXG4gICAgRW1wdHksXG4gICAgTGF0ZXN0Q2hhbmdlLFxuICAgIFNlYXJjaE1hdGNoRm9yd2FyZCxcbiAgICBTZWFyY2hNYXRjaEJhY2t3YXJkLFxuICAgIFByZXZpb3VzU2VsZWN0aW9uLFxuICAgIFBlcnNpc3RlbnRTZWxlY3Rpb24sXG4gICAgTGFzdFBhc3RlZFJhbmdlLFxuICAgIFZpc2libGVBcmVhXG4gIH0sXG4gIFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFdob2xlV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU21hcnRXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTdWJ3b3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlQYWlyLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRG91YmxlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFNpbmdsZVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBCYWNrVGljay5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ3VybHlCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBTcXVhcmVCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBQYXJlbnRoZXNpcy5kZXJpdmVDbGFzcyh0cnVlLCB0cnVlKSxcbiAgQW5nbGVCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBUYWcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBhcmFncmFwaC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgSW5kZW50YXRpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIENvbW1lbnQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIENvbW1lbnRPclBhcmFncmFwaC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRm9sZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRnVuY3Rpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFyZ3VtZW50cy5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ3VycmVudExpbmUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEVudGlyZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgTGF0ZXN0Q2hhbmdlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBQZXJzaXN0ZW50U2VsZWN0aW9uLmRlcml2ZUNsYXNzKHRydWUpLFxuICBWaXNpYmxlQXJlYS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRGlmZkh1bmsuZGVyaXZlQ2xhc3ModHJ1ZSlcbilcbiJdfQ==