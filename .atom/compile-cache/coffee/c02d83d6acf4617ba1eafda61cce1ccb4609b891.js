(function() {
  var Point, TextData, dispatch, getView, getVimState, ref, setEditorWidthInCharacters, settings;

  Point = require('atom').Point;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  setEditorWidthInCharacters = function(editor, widthInCharacters) {
    var component;
    editor.setDefaultCharWidth(1);
    component = editor.component;
    component.element.style.width = component.getGutterContainerWidth() + widthInCharacters * component.measurements.baseCharacterWidth + "px";
    return component.getNextUpdatePromise();
  };

  describe("Motion general", function() {
    var editor, editorElement, ensure, ensureWait, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, ensureWait = _vim.ensureWait, _vim;
      });
    });
    describe("simple motions", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = new TextData("12345\nabcd\nABCDE\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      describe("the h keybinding", function() {
        describe("as a motion", function() {
          it("moves the cursor left, but not to the previous line", function() {
            ensure('h', {
              cursor: [1, 0]
            });
            return ensure('h', {
              cursor: [1, 0]
            });
          });
          return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
            settings.set('wrapLeftRightMotion', true);
            return ensure('h h', {
              cursor: [0, 4]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects the character to the left", function() {
            return ensure('y h', {
              cursor: [1, 0],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
      });
      describe("the j keybinding", function() {
        it("moves the cursor down, but not to the end of the last line", function() {
          ensure('j', {
            cursor: [2, 1]
          });
          return ensure('j', {
            cursor: [2, 1]
          });
        });
        it("moves the cursor to the end of the line, not past it", function() {
          set({
            cursor: [0, 4]
          });
          return ensure('j', {
            cursor: [1, 3]
          });
        });
        it("remembers the column it was in after moving to shorter line", function() {
          set({
            cursor: [0, 4]
          });
          ensure('j', {
            cursor: [1, 3]
          });
          return ensure('j', {
            cursor: [2, 4]
          });
        });
        it("never go past last newline", function() {
          return ensure('1 0 j', {
            cursor: [2, 1]
          });
        });
        return describe("when visual mode", function() {
          beforeEach(function() {
            return ensure('v', {
              cursor: [1, 2],
              selectedText: 'b'
            });
          });
          it("moves the cursor down", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("doesn't go over after the last line", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("keep same column(goalColumn) even after across the empty line", function() {
            ensure('escape');
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [0, 3]
            });
            ensure('v', {
              cursor: [0, 4]
            });
            return ensure('j j', {
              cursor: [2, 4],
              selectedText: "defg\n\nabcd"
            });
          });
          return it("original visual line remains when jk across orignal selection", function() {
            text = new TextData("line0\nline1\nline2\n");
            set({
              text: text.getRaw(),
              cursor: [1, 1]
            });
            ensure('V', {
              selectedText: text.getLines([1])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([1])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([1])
            });
            return ensure('j', {
              selectedText: text.getLines([1, 2])
            });
          });
        });
      });
      describe("move-down-wrap, move-up-wrap", function() {
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'k': 'vim-mode-plus:move-up-wrap',
              'j': 'vim-mode-plus:move-down-wrap'
            }
          });
          return set({
            text: "hello\nhello\nhello\nhello\n"
          });
        });
        describe('move-down-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('j', {
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 j', {
              cursor: [1, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 j', {
              cursor: [3, 1]
            });
          });
        });
        return describe('move-up-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('k', {
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 k', {
              cursor: [2, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 k', {
              cursor: [0, 1]
            });
          });
        });
      });
      xdescribe("with big count was given", function() {
        var BIG_NUMBER, ensureBigCountMotion;
        BIG_NUMBER = Number.MAX_SAFE_INTEGER;
        ensureBigCountMotion = function(keystrokes, options) {
          var count;
          count = String(BIG_NUMBER).split('').join(' ');
          keystrokes = keystrokes.split('').join(' ');
          return ensure(count + " " + keystrokes, options);
        };
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g {': 'vim-mode-plus:move-to-previous-fold-start',
              'g }': 'vim-mode-plus:move-to-next-fold-start',
              ', N': 'vim-mode-plus:move-to-previous-number',
              ', n': 'vim-mode-plus:move-to-next-number'
            }
          });
          return set({
            text: "0000\n1111\n2222\n",
            cursor: [1, 2]
          });
        });
        it("by `j`", function() {
          return ensureBigCountMotion('j', {
            cursor: [2, 2]
          });
        });
        it("by `k`", function() {
          return ensureBigCountMotion('k', {
            cursor: [0, 2]
          });
        });
        it("by `h`", function() {
          return ensureBigCountMotion('h', {
            cursor: [1, 0]
          });
        });
        it("by `l`", function() {
          return ensureBigCountMotion('l', {
            cursor: [1, 3]
          });
        });
        it("by `[`", function() {
          return ensureBigCountMotion('[', {
            cursor: [0, 2]
          });
        });
        it("by `]`", function() {
          return ensureBigCountMotion(']', {
            cursor: [2, 2]
          });
        });
        it("by `w`", function() {
          return ensureBigCountMotion('w', {
            cursor: [2, 3]
          });
        });
        it("by `W`", function() {
          return ensureBigCountMotion('W', {
            cursor: [2, 3]
          });
        });
        it("by `b`", function() {
          return ensureBigCountMotion('b', {
            cursor: [0, 0]
          });
        });
        it("by `B`", function() {
          return ensureBigCountMotion('B', {
            cursor: [0, 0]
          });
        });
        it("by `e`", function() {
          return ensureBigCountMotion('e', {
            cursor: [2, 3]
          });
        });
        it("by `(`", function() {
          return ensureBigCountMotion('(', {
            cursor: [0, 0]
          });
        });
        it("by `)`", function() {
          return ensureBigCountMotion(')', {
            cursor: [2, 3]
          });
        });
        it("by `{`", function() {
          return ensureBigCountMotion('{', {
            cursor: [0, 0]
          });
        });
        it("by `}`", function() {
          return ensureBigCountMotion('}', {
            cursor: [2, 3]
          });
        });
        it("by `-`", function() {
          return ensureBigCountMotion('-', {
            cursor: [0, 0]
          });
        });
        it("by `_`", function() {
          return ensureBigCountMotion('_', {
            cursor: [2, 0]
          });
        });
        it("by `g {`", function() {
          return ensureBigCountMotion('g {', {
            cursor: [1, 2]
          });
        });
        it("by `g }`", function() {
          return ensureBigCountMotion('g }', {
            cursor: [1, 2]
          });
        });
        it("by `, N`", function() {
          return ensureBigCountMotion(', N', {
            cursor: [1, 2]
          });
        });
        it("by `, n`", function() {
          return ensureBigCountMotion(', n', {
            cursor: [1, 2]
          });
        });
        return it("by `y y`", function() {
          return ensureBigCountMotion('y y', {
            cursor: [1, 2]
          });
        });
      });
      describe("the k keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 1]
          });
        });
        it("moves the cursor up", function() {
          return ensure('k', {
            cursor: [1, 1]
          });
        });
        it("moves the cursor up and remember column it was in", function() {
          set({
            cursor: [2, 4]
          });
          ensure('k', {
            cursor: [1, 3]
          });
          return ensure('k', {
            cursor: [0, 4]
          });
        });
        it("moves the cursor up, but not to the beginning of the first line", function() {
          return ensure('1 0 k', {
            cursor: [0, 1]
          });
        });
        return describe("when visual mode", function() {
          return it("keep same column(goalColumn) even after across the empty line", function() {
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [2, 3]
            });
            ensure('v', {
              cursor: [2, 4],
              selectedText: 'd'
            });
            return ensure('k k', {
              cursor: [0, 3],
              selectedText: "defg\n\nabcd"
            });
          });
        });
      });
      describe("the j, k keybinding in hardTab text", function() {
        beforeEach(function() {
          jasmine.attachToDOM(atom.workspace.getElement());
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-go');
          });
          getVimState(function(state, vimEditor) {
            editor = state.editor, editorElement = state.editorElement;
            return set = vimEditor.set, ensure = vimEditor.ensure, vimEditor;
          });
          return runs(function() {
            return set({
              grammar: 'source.go',
              textC: "packa|ge main\n\nimport \"fmt\"\n\nfunc main() {\n\tif 7%2 == 0 {\n\t\tfmt.Println(\"7 is even\")\n\t} else {\n\t\tfmt.Println(\"7 is odd\")\n\t}\n}\n"
            });
          });
        });
        it("[tabLength = 2] move up/down bufferRow wise with aware of tabLength", function() {
          editor.update({
            tabLength: 2
          });
          ensure('j', {
            cursor: [1, 0],
            cursorScreen: [1, 0]
          });
          ensure('j', {
            cursor: [2, 5],
            cursorScreen: [2, 5]
          });
          ensure('j', {
            cursor: [3, 0],
            cursorScreen: [3, 0]
          });
          ensure('j', {
            cursor: [4, 5],
            cursorScreen: [4, 5]
          });
          ensure('j', {
            cursor: [5, 4],
            cursorScreen: [5, 5]
          });
          ensure('j', {
            cursor: [6, 3],
            cursorScreen: [6, 5]
          });
          ensure('j', {
            cursor: [7, 4],
            cursorScreen: [7, 5]
          });
          ensure('j', {
            cursor: [8, 3],
            cursorScreen: [8, 5]
          });
          ensure('j', {
            cursor: [9, 1],
            cursorScreen: [9, 2]
          });
          ensure('j', {
            cursor: [10, 0],
            cursorScreen: [10, 0]
          });
          ensure('k', {
            cursor: [9, 1],
            cursorScreen: [9, 2]
          });
          ensure('k', {
            cursor: [8, 3],
            cursorScreen: [8, 5]
          });
          ensure('k', {
            cursor: [7, 4],
            cursorScreen: [7, 5]
          });
          ensure('k', {
            cursor: [6, 3],
            cursorScreen: [6, 5]
          });
          ensure('k', {
            cursor: [5, 4],
            cursorScreen: [5, 5]
          });
          ensure('k', {
            cursor: [4, 5],
            cursorScreen: [4, 5]
          });
          ensure('k', {
            cursor: [3, 0],
            cursorScreen: [3, 0]
          });
          ensure('k', {
            cursor: [2, 5],
            cursorScreen: [2, 5]
          });
          ensure('k', {
            cursor: [1, 0],
            cursorScreen: [1, 0]
          });
          return ensure('k', {
            cursor: [0, 5],
            cursorScreen: [0, 5]
          });
        });
        it("[tabLength = 4] move up/down bufferRow wise with aware of tabLength", function() {
          editor.update({
            tabLength: 4
          });
          ensure('j', {
            cursor: [1, 0],
            cursorScreen: [1, 0]
          });
          ensure('j', {
            cursor: [2, 5],
            cursorScreen: [2, 5]
          });
          ensure('j', {
            cursor: [3, 0],
            cursorScreen: [3, 0]
          });
          ensure('j', {
            cursor: [4, 5],
            cursorScreen: [4, 5]
          });
          ensure('j', {
            cursor: [5, 2],
            cursorScreen: [5, 5]
          });
          ensure('j', {
            cursor: [6, 1],
            cursorScreen: [6, 4]
          });
          ensure('j', {
            cursor: [7, 2],
            cursorScreen: [7, 5]
          });
          ensure('j', {
            cursor: [8, 1],
            cursorScreen: [8, 4]
          });
          ensure('j', {
            cursor: [9, 1],
            cursorScreen: [9, 4]
          });
          ensure('j', {
            cursor: [10, 0],
            cursorScreen: [10, 0]
          });
          ensure('k', {
            cursor: [9, 1],
            cursorScreen: [9, 4]
          });
          ensure('k', {
            cursor: [8, 1],
            cursorScreen: [8, 4]
          });
          ensure('k', {
            cursor: [7, 2],
            cursorScreen: [7, 5]
          });
          ensure('k', {
            cursor: [6, 1],
            cursorScreen: [6, 4]
          });
          ensure('k', {
            cursor: [5, 2],
            cursorScreen: [5, 5]
          });
          ensure('k', {
            cursor: [4, 5],
            cursorScreen: [4, 5]
          });
          ensure('k', {
            cursor: [3, 0],
            cursorScreen: [3, 0]
          });
          ensure('k', {
            cursor: [2, 5],
            cursorScreen: [2, 5]
          });
          ensure('k', {
            cursor: [1, 0],
            cursorScreen: [1, 0]
          });
          return ensure('k', {
            cursor: [0, 5],
            cursorScreen: [0, 5]
          });
        });
        return it("[tabLength = 8] move up/down bufferRow wise with aware of tabLength", function() {
          editor.update({
            tabLength: 8
          });
          set({
            cursor: [5, 9]
          });
          ensure('j', {
            cursor: [6, 2],
            cursorScreen: [6, 16]
          });
          ensure('j', {
            cursor: [7, 8],
            cursorScreen: [7, 15]
          });
          ensure('j', {
            cursor: [8, 2],
            cursorScreen: [8, 16]
          });
          ensure('j', {
            cursor: [9, 1],
            cursorScreen: [9, 8]
          });
          ensure('j', {
            cursor: [10, 0],
            cursorScreen: [10, 0]
          });
          ensure('k', {
            cursor: [9, 1],
            cursorScreen: [9, 8]
          });
          ensure('k', {
            cursor: [8, 2],
            cursorScreen: [8, 16]
          });
          ensure('k', {
            cursor: [7, 8],
            cursorScreen: [7, 15]
          });
          return ensure('k', {
            cursor: [6, 2],
            cursorScreen: [6, 16]
          });
        });
      });
      describe("gj gk in softwrap", function() {
        text = [][0];
        beforeEach(function() {
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setDefaultCharWidth(1);
          text = new TextData("1st line of buffer\n2nd line of buffer, Very long line\n3rd line of buffer\n\n5th line of buffer\n");
          return set({
            text: text.getRaw(),
            cursor: [0, 0]
          });
        });
        describe("selection is not reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            ensure('V', {
              selectedText: text.getLines([0])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('k', {
              selectedText: text.getLines([0])
            });
            return ensure('k', {
              selectedText: text.getLines([0])
            });
          });
        });
        return describe("selection is reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            set({
              cursor: [4, 0]
            });
            ensure('V', {
              selectedText: text.getLines([4])
            });
            ensure('k', {
              selectedText: text.getLines([3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([4])
            });
            return ensure('j', {
              selectedText: text.getLines([4])
            });
          });
        });
      });
      describe("the l keybinding", function() {
        beforeEach(function() {
          set({
            textC: "0: aaaa\n1: bbbb\n2: cccc\n\n4:\n"
          });
          return set({
            cursor: [1, 2]
          });
        });
        describe("when wrapLeftRightMotion = false(=default)", function() {
          it("[normal] move to right, count support, but not wrap to next-line", function() {
            set({
              cursor: [0, 0]
            });
            ensure('l', {
              cursor: [0, 1]
            });
            ensure('l', {
              cursor: [0, 2]
            });
            ensure('2 l', {
              cursor: [0, 4]
            });
            ensure('5 l', {
              cursor: [0, 6]
            });
            return ensure('l', {
              cursor: [0, 6]
            });
          });
          it("[normal: at-blank-row] not wrap to next line", function() {
            set({
              cursor: [3, 0]
            });
            return ensure('l', {
              cursor: [3, 0],
              mode: "normal"
            });
          });
          it("[visual: at-last-char] can select newline but not wrap to next-line", function() {
            set({
              cursor: [0, 6]
            });
            ensure("v", {
              selectedText: "a",
              mode: ['visual', 'characterwise'],
              cursor: [0, 7]
            });
            expect(editor.getLastCursor().isAtEndOfLine()).toBe(true);
            ensure("l", {
              selectedText: "a\n",
              mode: ['visual', 'characterwise'],
              cursor: [1, 0]
            });
            return ensure("l", {
              selectedText: "a\n",
              mode: ['visual', 'characterwise'],
              cursor: [1, 0]
            });
          });
          return it("[visual: at-blank-row] can select newline but not wrap to next-line", function() {
            set({
              cursor: [3, 0]
            });
            ensure("v", {
              selectedText: "\n",
              mode: ['visual', 'characterwise'],
              cursor: [4, 0]
            });
            return ensure("l", {
              selectedText: "\n",
              mode: ['visual', 'characterwise'],
              cursor: [4, 0]
            });
          });
        });
        return describe("when wrapLeftRightMotion = true", function() {
          beforeEach(function() {
            return settings.set('wrapLeftRightMotion', true);
          });
          it("[normal: at-last-char] moves the cursor to the next line", function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l', {
              cursor: [1, 0],
              mode: "normal"
            });
          });
          it("[normal: at-blank-row] wrap to next line", function() {
            set({
              cursor: [3, 0]
            });
            return ensure('l', {
              cursor: [4, 0],
              mode: "normal"
            });
          });
          it("[visual: at-last-char] select newline then move to next-line", function() {
            set({
              cursor: [0, 6]
            });
            ensure("v", {
              selectedText: "a",
              mode: ['visual', 'characterwise'],
              cursor: [0, 7]
            });
            expect(editor.getLastCursor().isAtEndOfLine()).toBe(true);
            ensure("l", {
              selectedText: "a\n",
              mode: ['visual', 'characterwise'],
              cursor: [1, 0]
            });
            return ensure("l", {
              selectedText: "a\n1",
              mode: ['visual', 'characterwise'],
              cursor: [1, 1]
            });
          });
          return it("[visual: at-blank-row] move to next-line", function() {
            set({
              cursor: [3, 0]
            });
            ensure("v", {
              selectedText: "\n",
              mode: ['visual', 'characterwise'],
              cursor: [4, 0]
            });
            return ensure("l", {
              selectedText: "\n4",
              mode: ['visual', 'characterwise'],
              cursor: [4, 1]
            });
          });
        });
      });
      return describe("move-(up/down)-to-edge", function() {
        text = null;
        beforeEach(function() {
          text = new TextData("0:  4 67  01234567890123456789\n1:         1234567890123456789\n2:    6 890         0123456789\n3:    6 890         0123456789\n4:   56 890         0123456789\n5:                  0123456789\n6:                  0123456789\n7:  4 67            0123456789\n");
          return set({
            text: text.getRaw(),
            cursor: [4, 3]
          });
        });
        describe("edgeness of first-line and last-line", function() {
          beforeEach(function() {
            return set({
              text_: "____this is line 0\n____this is text of line 1\n____this is text of line 2\n______hello line 3\n______hello line 4",
              cursor: [2, 2]
            });
          });
          describe("when column is leading spaces", function() {
            it("move cursor if it's stoppable", function() {
              ensure('[', {
                cursor: [0, 2]
              });
              return ensure(']', {
                cursor: [4, 2]
              });
            });
            return it("doesn't move cursor if it's NOT stoppable", function() {
              set({
                text_: "__\n____this is text of line 1\n____this is text of line 2\n______hello line 3\n______hello line 4\n__",
                cursor: [2, 2]
              });
              ensure('[', {
                cursor: [2, 2]
              });
              return ensure(']', {
                cursor: [2, 2]
              });
            });
          });
          return describe("when column is trailing spaces", function() {
            return it("doesn't move cursor", function() {
              set({
                cursor: [1, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure('[', {
                cursor: [1, 20]
              });
              return ensure('[', {
                cursor: [1, 20]
              });
            });
          });
        });
        it("move to non-blank-char on both first and last row", function() {
          set({
            cursor: [4, 4]
          });
          ensure('[', {
            cursor: [0, 4]
          });
          return ensure(']', {
            cursor: [7, 4]
          });
        });
        it("move to white space char when both side column is non-blank char", function() {
          set({
            cursor: [4, 5]
          });
          ensure('[', {
            cursor: [0, 5]
          });
          ensure(']', {
            cursor: [4, 5]
          });
          return ensure(']', {
            cursor: [7, 5]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-1", function() {
          set({
            cursor: [4, 6]
          });
          ensure('[', {
            cursor: [2, 6]
          });
          ensure('[', {
            cursor: [0, 6]
          });
          ensure(']', {
            cursor: [2, 6]
          });
          ensure(']', {
            cursor: [4, 6]
          });
          return ensure(']', {
            cursor: [7, 6]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-2", function() {
          set({
            cursor: [4, 7]
          });
          ensure('[', {
            cursor: [2, 7]
          });
          ensure('[', {
            cursor: [0, 7]
          });
          ensure(']', {
            cursor: [2, 7]
          });
          ensure(']', {
            cursor: [4, 7]
          });
          return ensure(']', {
            cursor: [7, 7]
          });
        });
        it("support count", function() {
          set({
            cursor: [4, 6]
          });
          ensure('2 [', {
            cursor: [0, 6]
          });
          return ensure('3 ]', {
            cursor: [7, 6]
          });
        });
        return describe('editor for hardTab', function() {
          var pack;
          pack = 'language-go';
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage(pack);
            });
            getVimState('sample.go', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, vimEditor;
            });
            return runs(function() {
              set({
                cursorScreen: [8, 2]
              });
              return ensure(null, {
                cursor: [8, 1]
              });
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage(pack);
          });
          return it("move up/down to next edge of same *screen* column", function() {
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            ensure('[', {
              cursorScreen: [0, 2]
            });
            ensure(']', {
              cursorScreen: [2, 2]
            });
            ensure(']', {
              cursorScreen: [3, 2]
            });
            ensure(']', {
              cursorScreen: [5, 2]
            });
            ensure(']', {
              cursorScreen: [9, 2]
            });
            ensure(']', {
              cursorScreen: [11, 2]
            });
            ensure(']', {
              cursorScreen: [14, 2]
            });
            ensure(']', {
              cursorScreen: [17, 2]
            });
            ensure('[', {
              cursorScreen: [14, 2]
            });
            ensure('[', {
              cursorScreen: [11, 2]
            });
            ensure('[', {
              cursorScreen: [9, 2]
            });
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            return ensure('[', {
              cursorScreen: [0, 2]
            });
          });
        });
      });
    });
    describe('moveSuccessOnLinewise behaviral characteristic', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        settings.set('useClipboardAsDefaultRegister', false);
        set({
          text: "000\n111\n222\n"
        });
        originalText = editor.getText();
        return ensure(null, {
          register: {
            '"': {
              text: void 0
            }
          }
        });
      });
      describe("moveSuccessOnLinewise=false motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by j", function() {
            return ensure("d j", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by j", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by j", function() {
            return ensure("c j", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by k", function() {
            return ensure("d k", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by k", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by k", function() {
            return ensure("c k", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by dk", function() {
            return ensure("d k", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yk", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by ck", function() {
            return ensure("c k", {
              textC: "|000\n111\n222\n",
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by dj", function() {
            return ensure("d j", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yj", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by cj", function() {
            return ensure("c j", {
              textC: "000\n111\n|222\n",
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
        });
      });
      return describe("moveSuccessOnLinewise=true motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by G", function() {
            return ensure("c G", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "111\n222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n111\n222\n",
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n111\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by G", function() {
            return ensure("c G", {
              textC: "000\n111\n|\n",
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
    });
    describe("the w keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the beginning of the next word", function() {
          set({
            textC: "|ab cde1+-\n xyz\n\nzip"
          });
          ensure("w", {
            textC: "ab |cde1+-\n xyz\n\nzip"
          });
          ensure("w", {
            textC: "ab cde1|+-\n xyz\n\nzip"
          });
          ensure("w", {
            textC: "ab cde1+-\n |xyz\n\nzip"
          });
          ensure("w", {
            textC: "ab cde1+-\n xyz\n|\nzip"
          });
          ensure("w", {
            textC: "ab cde1+-\n xyz\n\n|zip"
          });
          ensure("w", {
            textC: "ab cde1+-\n xyz\n\nzi|p"
          });
          return ensure("w", {
            textC: "ab cde1+-\n xyz\n\nzi|p"
          });
        });
        it("[CRLF] moves the cursor to the beginning of the next word", function() {
          set({
            textC: "|ab cde1+-\r\n xyz\r\n\r\nzip"
          });
          ensure("w", {
            textC: "ab |cde1+-\r\n xyz\r\n\r\nzip"
          });
          ensure("w", {
            textC: "ab cde1|+-\r\n xyz\r\n\r\nzip"
          });
          ensure("w", {
            textC: "ab cde1+-\r\n |xyz\r\n\r\nzip"
          });
          ensure("w", {
            textC: "ab cde1+-\r\n xyz\r\n|\r\nzip"
          });
          ensure("w", {
            textC: "ab cde1+-\r\n xyz\r\n\r\n|zip"
          });
          ensure("w", {
            textC: "ab cde1+-\r\n xyz\r\n\r\nzi|p"
          });
          return ensure("w", {
            textC: "ab cde1+-\r\n xyz\r\n\r\nzi|p"
          });
        });
        it("move to next word by skipping trailing white spaces", function() {
          set({
            textC: "012|   \n  234"
          });
          return ensure("w", {
            textC: "012   \n  |234"
          });
        });
        return it("move to next word from EOL", function() {
          set({
            textC: "|\n  234"
          });
          return ensure("w", {
            textC: "\n  |234"
          });
        });
      });
      describe("used as change TARGET", function() {
        it("[at-word] not eat whitespace", function() {
          set({
            textC: "v|ar1 = 1"
          });
          return ensure('c w', {
            textC: "v = 1"
          });
        });
        it("[at white-space] only eat white space", function() {
          set({
            textC: "|  var1 = 1"
          });
          return ensure('c w', {
            textC: "var1 = 1"
          });
        });
        it("[at trailing whitespace] doesnt eat new line character", function() {
          set({
            textC: "abc|  \ndef"
          });
          return ensure('c w', {
            textC: "abc|\ndef"
          });
        });
        return xit("[at trailing whitespace] eat new line when count is specified", function() {
          set({
            textC: "|\n\n\n\n\nline6\n"
          });
          return ensure('5 c w', {
            textC: "|\nline6\n"
          });
        });
      });
      return describe("as a selection", function() {
        it("[within-word] selects to the end of the word", function() {
          set({
            textC: "|ab cd"
          });
          return ensure('y w', {
            register: {
              '"': {
                text: 'ab '
              }
            }
          });
        });
        return it("[between-word] selects the whitespace", function() {
          set({
            textC: "ab| cd"
          });
          return ensure('y w', {
            register: {
              '"': {
                text: ' '
              }
            }
          });
        });
      });
    });
    describe("the W keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the beginning of the next word", function() {
          set({
            textC: "|cde1+- ab \n xyz\n\nzip"
          });
          ensure("W", {
            textC: "cde1+- |ab \n xyz\n\nzip"
          });
          ensure("W", {
            textC: "cde1+- ab \n |xyz\n\nzip"
          });
          ensure("W", {
            textC: "cde1+- ab \n xyz\n|\nzip"
          });
          ensure("W", {
            textC: "cde1+- ab \n xyz\n\n|zip"
          });
          ensure("W", {
            textC: "cde1+- ab \n xyz\n\nzi|p"
          });
          return ensure("W", {
            textC: "cde1+- ab \n xyz\n\nzi|p"
          });
        });
        it("[at-trailing-WS] moves the cursor to beginning of the next word at next line", function() {
          set({
            textC: "012|   \n  234"
          });
          return ensure('W', {
            textC: "012   \n  |234"
          });
        });
        return it("moves the cursor to beginning of the next word of next line when cursor is at EOL.", function() {
          set({
            textC: "|\n  234"
          });
          return ensure('W', {
            textC: "\n  |234"
          });
        });
      });
      describe("used as change TARGET", function() {
        it("[at-word] not eat whitespace", function() {
          set({
            textC: "v|ar1 = 1"
          });
          return ensure('c W', {
            textC: "v| = 1"
          });
        });
        it("[at-WS] only eat white space", function() {
          set({
            textC: "|  var1 = 1"
          });
          return ensure('c W', {
            textC: "var1 = 1"
          });
        });
        it("[at-trailing-WS] doesn't eat new line character", function() {
          set({
            textC: "abc|  \ndef\n"
          });
          return ensure('c W', {
            textC: "abc|\ndef\n"
          });
        });
        return xit("can eat new line when count is specified", function() {
          set({
            textC: "|\n\n\n\n\nline6\n"
          });
          return ensure('5 c W', {
            textC: "|\nline6\n"
          });
        });
      });
      return describe("as a TARGET", function() {
        it("[at-word] yank", function() {
          set({
            textC: "|cde1+- ab"
          });
          return ensure('y W', {
            register: {
              '"': {
                text: 'cde1+- '
              }
            }
          });
        });
        it("delete new line", function() {
          set({
            textC: "cde1+- ab \n xyz\n|\nzip"
          });
          return ensure('d W', {
            textC: "cde1+- ab \n xyz\n|zip",
            register: {
              '"': {
                text: "\n"
              }
            }
          });
        });
        return it("delete last word in buffer and adjut cursor row to not past vimLastRow", function() {
          set({
            textC: "cde1+- ab \n xyz\n\n|zip"
          });
          return ensure('d W', {
            textC: "cde1+- ab \n xyz\n|\n",
            register: {
              '"': {
                text: "zip"
              }
            }
          });
        });
      });
    });
    describe("the e keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the end of the current word", function() {
          set({
            textC_: "|ab cde1+-_\n_xyz\n\nzip"
          });
          ensure('e', {
            textC_: "a|b cde1+-_\n_xyz\n\nzip"
          });
          ensure('e', {
            textC_: "ab cde|1+-_\n_xyz\n\nzip"
          });
          ensure('e', {
            textC_: "ab cde1+|-_\n_xyz\n\nzip"
          });
          ensure('e', {
            textC_: "ab cde1+-_\n_xy|z\n\nzip"
          });
          return ensure('e', {
            textC_: "ab cde1+-_\n_xyz\n\nzi|p"
          });
        });
        return it("skips whitespace until EOF", function() {
          set({
            textC: "|012\n\n\n012\n\n"
          });
          ensure('e', {
            textC: "01|2\n\n\n012\n\n"
          });
          ensure('e', {
            textC: "012\n\n\n01|2\n\n"
          });
          return ensure('e', {
            textC: "012\n\n\n012\n|\n"
          });
        });
      });
      return describe("as selection", function() {
        it("[in-word] selects to the end of the current word", function() {
          set({
            textC_: "|ab cde1+-_"
          });
          return ensure('y e', {
            register: {
              '"': {
                text: 'ab'
              }
            }
          });
        });
        return it("[between-word] selects to the end of the next word", function() {
          set({
            textC_: "ab| cde1+-_"
          });
          return ensure('y e', {
            register: {
              '"': {
                text: ' cde1'
              }
            }
          });
        });
      });
    });
    describe("the E keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab  cde1+-_\n_xyz_\n\nzip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("moves the cursor to the end of the current word", function() {
          ensure('E', {
            cursor: [0, 1]
          });
          ensure('E', {
            cursor: [0, 9]
          });
          ensure('E', {
            cursor: [1, 3]
          });
          ensure('E', {
            cursor: [3, 2]
          });
          return ensure('E', {
            cursor: [3, 2]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: '  cde1+-'
                }
              }
            });
          });
        });
        return describe("press more than once", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('v E E y', {
              register: {
                '"': {
                  text: 'ab  cde1+-'
                }
              }
            });
          });
        });
      });
    });
    describe("the ge keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the end of the previous word", function() {
          set({
            textC: "1234 5678 wordwo|rd"
          });
          ensure("g e", {
            textC: "1234 567|8 wordword"
          });
          ensure("g e", {
            textC: "123|4 5678 wordword"
          });
          ensure("g e", {
            textC: "|1234 5678 wordword"
          });
          return ensure("g e", {
            textC: "|1234 5678 wordword"
          });
        });
        it("moves corrently when starting between words", function() {
          set({
            textC: "1 leading   |  end"
          });
          return ensure('g e', {
            textC: "1 leadin|g     end"
          });
        });
        it("takes a count", function() {
          set({
            textC: "vim mode plus is getting the|re"
          });
          return ensure('5 g e', {
            textC: "vi|m mode plus is getting there"
          });
        });
        it("handles non-words inside words like vim", function() {
          set({
            textC: "1234 5678 word-wor|d"
          });
          ensure('g e', {
            textC: "1234 5678 word|-word"
          });
          ensure('g e', {
            textC: "1234 5678 wor|d-word"
          });
          return ensure('g e', {
            textC: "1234 567|8 word-word"
          });
        });
        return xit("handles newlines like vim", function() {
          set({
            textC: "1234\n\n\n\n56|78"
          });
          ensure("g e", {
            textC: "1234\n\n\n|\n5678"
          });
          ensure("g e", {
            textC: "1234\n\n|\n\n5678"
          });
          ensure("g e", {
            textC: "1234\n|\n\n\n5678"
          });
          ensure("g e", {
            textC: "123|4\n\n\n\n5678"
          });
          return ensure("g e", {
            textC: "|1234\n\n\n\n5678"
          });
        });
      });
      describe("when used by Change operator", function() {
        it("changes word fragments", function() {
          set({
            text: "cet document",
            cursor: [0, 7]
          });
          return ensure('c g e', {
            cursor: [0, 2],
            text: "cement",
            mode: 'insert'
          });
        });
        return it("changes whitespace properly", function() {
          set({
            text: "ce    doc",
            cursor: [0, 4]
          });
          return ensure('c g e', {
            cursor: [0, 1],
            text: "c doc",
            mode: 'insert'
          });
        });
      });
      return describe("in characterwise visual mode", function() {
        return it("selects word fragments", function() {
          set({
            text: "cet document",
            cursor: [0, 7]
          });
          return ensure('v g e', {
            cursor: [0, 2],
            selectedText: "t docu"
          });
        });
      });
    });
    describe("the gE keybinding", function() {
      return describe("as a motion", function() {
        return it("moves the cursor to the end of the previous word", function() {
          set({
            textC: "12.4 5~7- word-w|ord"
          });
          ensure('g E', {
            textC: "12.4 5~7|- word-word"
          });
          ensure('g E', {
            textC: "12.|4 5~7- word-word"
          });
          ensure('g E', {
            textC: "|12.4 5~7- word-word"
          });
          return ensure('g E', {
            textC: "|12.4 5~7- word-word"
          });
        });
      });
    });
    describe("the (,) sentence keybinding", function() {
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "sentence one.])'\"    sen.tence .two.\nhere.  sentence three\nmore three\n\n   sentence four\n\n\nsentence five.\nmore five\nmore six\n\n last sentence\nall done seven"
          });
        });
        it("moves the cursor to the end of the sentence", function() {
          ensure(')', {
            cursor: [0, 21]
          });
          ensure(')', {
            cursor: [1, 0]
          });
          ensure(')', {
            cursor: [1, 7]
          });
          ensure(')', {
            cursor: [3, 0]
          });
          ensure(')', {
            cursor: [4, 3]
          });
          ensure(')', {
            cursor: [5, 0]
          });
          ensure(')', {
            cursor: [7, 0]
          });
          ensure(')', {
            cursor: [8, 0]
          });
          ensure(')', {
            cursor: [10, 0]
          });
          ensure(')', {
            cursor: [11, 1]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure('(', {
            cursor: [11, 1]
          });
          ensure('(', {
            cursor: [10, 0]
          });
          ensure('(', {
            cursor: [8, 0]
          });
          ensure('(', {
            cursor: [7, 0]
          });
          ensure('(', {
            cursor: [6, 0]
          });
          ensure('(', {
            cursor: [4, 3]
          });
          ensure('(', {
            cursor: [3, 0]
          });
          ensure('(', {
            cursor: [1, 7]
          });
          ensure('(', {
            cursor: [1, 0]
          });
          ensure('(', {
            cursor: [0, 21]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
        it("skips to beginning of sentence", function() {
          set({
            cursor: [4, 15]
          });
          return ensure('(', {
            cursor: [4, 3]
          });
        });
        it("supports a count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 )', {
            cursor: [1, 7]
          });
          return ensure('3 (', {
            cursor: [0, 0]
          });
        });
        it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('2 0 )', {
            cursor: [12, 13]
          });
          return ensure('2 0 (', {
            cursor: [0, 0]
          });
        });
        return describe("sentence motion with skip-blank-row", function() {
          beforeEach(function() {
            return atom.keymaps.add("test", {
              'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
                'g )': 'vim-mode-plus:move-to-next-sentence-skip-blank-row',
                'g (': 'vim-mode-plus:move-to-previous-sentence-skip-blank-row'
              }
            });
          });
          return it("moves the cursor to the end of the sentence", function() {
            ensure('g )', {
              cursor: [0, 21]
            });
            ensure('g )', {
              cursor: [1, 0]
            });
            ensure('g )', {
              cursor: [1, 7]
            });
            ensure('g )', {
              cursor: [4, 3]
            });
            ensure('g )', {
              cursor: [7, 0]
            });
            ensure('g )', {
              cursor: [8, 0]
            });
            ensure('g )', {
              cursor: [11, 1]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g (', {
              cursor: [11, 1]
            });
            ensure('g (', {
              cursor: [8, 0]
            });
            ensure('g (', {
              cursor: [7, 0]
            });
            ensure('g (', {
              cursor: [4, 3]
            });
            ensure('g (', {
              cursor: [1, 7]
            });
            ensure('g (', {
              cursor: [1, 0]
            });
            ensure('g (', {
              cursor: [0, 21]
            });
            ensure('g (', {
              cursor: [0, 0]
            });
            return ensure('g (', {
              cursor: [0, 0]
            });
          });
        });
      });
      describe("moving inside a blank document", function() {
        beforeEach(function() {
          return set({
            text_: "_____\n_____"
          });
        });
        return it("moves without crashing", function() {
          set({
            cursor: [0, 0]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          return set({
            text: "sentence one. sentence two.\n  sentence three."
          });
        });
        it('selects to the end of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y )', {
            register: {
              '"': {
                text: "ce two.\n  "
              }
            }
          });
        });
        return it('selects to the beginning of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y (', {
            register: {
              '"': {
                text: "senten"
              }
            }
          });
        });
      });
    });
    describe("the {,} keybinding", function() {
      beforeEach(function() {
        return set({
          text: "\n\n\n3: paragraph-1\n4: paragraph-1\n\n\n\n8: paragraph-2\n\n\n\n12: paragraph-3\n13: paragraph-3\n\n\n16: paragprah-4\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the paragraph", function() {
          set({
            cursor: [0, 0]
          });
          ensure('}', {
            cursor: [5, 0]
          });
          ensure('}', {
            cursor: [9, 0]
          });
          ensure('}', {
            cursor: [14, 0]
          });
          ensure('{', {
            cursor: [11, 0]
          });
          ensure('{', {
            cursor: [7, 0]
          });
          return ensure('{', {
            cursor: [2, 0]
          });
        });
        it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 }', {
            cursor: [14, 0]
          });
          return ensure('3 {', {
            cursor: [2, 0]
          });
        });
        return it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('1 0 }', {
            cursor: [16, 14]
          });
          return ensure('1 0 {', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it('selects to the end of the current paragraph', function() {
          set({
            cursor: [3, 3]
          });
          return ensure('y }', {
            register: {
              '"': {
                text: "paragraph-1\n4: paragraph-1\n"
              }
            }
          });
        });
        return it('selects to the end of the current paragraph', function() {
          set({
            cursor: [4, 3]
          });
          return ensure('y {', {
            register: {
              '"': {
                text: "\n3: paragraph-1\n4: "
              }
            }
          });
        });
      });
    });
    describe("MoveToNextDiffHunk, MoveToPreviousDiffHunk", function() {
      beforeEach(function() {
        set({
          text: "--- file        2017-12-24 15:11:33.000000000 +0900\n+++ file-new    2017-12-24 15:15:09.000000000 +0900\n@@ -1,9 +1,9 @@\n line 0\n+line 0-1\n line 1\n-line 2\n+line 1-1\n line 3\n-line 4\n line 5\n-line 6\n-line 7\n+line 7-1\n+line 7-2\n line 8\n",
          cursor: [0, 0]
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              ']': 'vim-mode-plus:move-to-next-diff-hunk',
              '[': 'vim-mode-plus:move-to-previous-diff-hunk'
            }
          });
        });
      });
      return it("move to next and previous hunk", function() {
        ensure(']', {
          cursor: [1, 0]
        });
        ensure(']', {
          cursor: [4, 0]
        });
        ensure(']', {
          cursor: [6, 0]
        });
        ensure(']', {
          cursor: [7, 0]
        });
        ensure(']', {
          cursor: [9, 0]
        });
        ensure(']', {
          cursor: [11, 0]
        });
        ensure(']', {
          cursor: [13, 0]
        });
        ensure(']', {
          cursor: [13, 0]
        });
        ensure('[', {
          cursor: [11, 0]
        });
        ensure('[', {
          cursor: [9, 0]
        });
        ensure('[', {
          cursor: [7, 0]
        });
        ensure('[', {
          cursor: [6, 0]
        });
        ensure('[', {
          cursor: [4, 0]
        });
        ensure('[', {
          cursor: [1, 0]
        });
        ensure('[', {
          cursor: [0, 0]
        });
        return ensure('[', {
          cursor: [0, 0]
        });
      });
    });
    describe("the b keybinding", function() {
      beforeEach(function() {
        return set({
          textC_: "_ab cde1+-_\n_xyz\n\nzip }\n_|last"
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('b', {
            textC: " ab cde1+- \n xyz\n\nzip |}\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n xyz\n\n|zip }\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n xyz\n|\nzip }\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n |xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " ab cde1|+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " ab |cde1+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " |ab cde1+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: "| ab cde1+- \n xyz\n\nzip }\n last"
          });
          return ensure('b', {
            textC: "| ab cde1+- \n xyz\n\nzip }\n last"
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the beginning of the current word", function() {
            set({
              textC: " a|b cd"
            });
            return ensure('y b', {
              textC: " |ab cd",
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the beginning of the last word", function() {
            set({
              textC: " ab |cd"
            });
            return ensure('y b', {
              textC: " |ab cd",
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
      });
    });
    describe("the B keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab\n\t xyz-123\n\n zip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 0]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('B', {
            cursor: [3, 1]
          });
          ensure('B', {
            cursor: [2, 0]
          });
          ensure('B', {
            cursor: [1, 2]
          });
          ensure('B', {
            cursor: [0, 7]
          });
          return ensure('B', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it("selects to the beginning of the whole word", function() {
          set({
            cursor: [1, 8]
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'xyz-12'
              }
            }
          });
        });
        return it("doesn't go past the beginning of the file", function() {
          set({
            cursor: [0, 0],
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
        });
      });
    });
    describe("the ^ keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|  abcde"
        });
      });
      describe("from the beginning of the line", function() {
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
        });
      });
      describe("from the first character of the line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("stays put", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("does nothing", function() {
            return ensure('d ^', {
              text: '  abcde',
              cursor: [0, 2]
            });
          });
        });
      });
      return describe("from the middle of a word", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 4]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "  ab|cde"
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the first column", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        return it('selects to the first column of the line', function() {
          return ensure('d 0', {
            text: 'cde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("g 0, g ^ and g $", function() {
      var enableSoftWrapAndEnsure;
      enableSoftWrapAndEnsure = function() {
        editor.setSoftWrapped(true);
        expect(editor.lineTextForScreenRow(0)).toBe(" 1234567");
        expect(editor.lineTextForScreenRow(1)).toBe(" 89B1234");
        expect(editor.lineTextForScreenRow(2)).toBe(" 56789C1");
        expect(editor.lineTextForScreenRow(3)).toBe(" 2345678");
        return expect(editor.lineTextForScreenRow(4)).toBe(" 9");
      };
      beforeEach(function() {
        var scrollbarStyle;
        scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = '::-webkit-scrollbar { -webkit-appearance: none }';
        jasmine.attachToDOM(scrollbarStyle);
        set({
          text_: "_123456789B123456789C123456789"
        });
        jasmine.attachToDOM(getView(atom.workspace));
        return waitsForPromise(function() {
          return setEditorWidthInCharacters(editor, 10);
        });
      });
      describe("the g 0 keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to column 0 of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g 0", {
                cursorScreen: [0, 0]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g 0", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first visible colum of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 10]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to column 0 of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g 0", {
                cursorScreen: [0, 0]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g 0", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
      });
      describe("the g ^ keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to first-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g ^", {
                cursorScreen: [0, 1]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g ^", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 10]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to first-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g ^", {
                cursorScreen: [0, 1]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g ^", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
      });
      return describe("the g $ keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, lastColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 27]
              });
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          describe("softwrap = false, lastColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to last-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g $", {
                cursorScreen: [0, 7]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g $", {
                cursorScreen: [1, 7]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, lastColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 27]
              });
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          describe("softwrap = false, lastColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to last-char in visible screen line", function() {
              return ensure("g $", {
                cursor: [0, 18]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to last-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g $", {
                cursorScreen: [0, 7]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g $", {
                cursorScreen: [1, 7]
              });
            });
          });
        });
      });
    });
    describe("the | keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde",
          cursor: [0, 4]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the number column", function() {
          ensure('|', {
            cursor: [0, 0]
          });
          ensure('1 |', {
            cursor: [0, 0]
          });
          ensure('3 |', {
            cursor: [0, 2]
          });
          return ensure('4 |', {
            cursor: [0, 3]
          });
        });
      });
      return describe("as operator's target", function() {
        return it('behave exclusively', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('d 4 |', {
            text: 'bcde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the $ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde\n\n1234567890",
          cursor: [0, 4]
        });
      });
      describe("as a motion from empty line", function() {
        return it("moves the cursor to the end of the line", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('$', {
            cursor: [1, 0]
          });
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the line", function() {
          return ensure('$', {
            cursor: [0, 6]
          });
        });
        it("set goalColumn Infinity", function() {
          expect(editor.getLastCursor().goalColumn).toBe(null);
          ensure('$', {
            cursor: [0, 6]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
        it("should remain in the last column when moving down", function() {
          ensure('$ j', {
            cursor: [1, 0]
          });
          return ensure('j', {
            cursor: [2, 9]
          });
        });
        return it("support count", function() {
          return ensure('3 $', {
            cursor: [2, 9]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the end of the lines", function() {
          return ensure('d $', {
            text: "  ab\n\n1234567890",
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the - keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abcdefg\n  abc\n  abc\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the last character of the previous line", function() {
            return ensure('-', {
              cursor: [0, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and previous line", function() {
            return ensure('d -', {
              text: "  abc\n",
              cursor: [0, 2]
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the previous one", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the previous line (directly above)", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line (directly above)", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line preceded by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the previous line", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [4, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines previous", function() {
            return ensure('3 -', {
              cursor: [1, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many previous lines", function() {
            return ensure('d 3 -', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the + keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [2, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and next line", function() {
            return ensure('d +', {
              text: "  abc\n"
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the next one", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the next line (directly below)", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line (directly below)", function() {
            return ensure('d +', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line followed by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line", function() {
            return ensure('d +', {
              text: "abcdefg\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 +', {
              cursor: [4, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 +', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the _ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the current line", function() {
            return ensure('_', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line", function() {
            return ensure('d _', {
              text_: "__abc\nabcdefg\n",
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 _', {
              cursor: [3, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 _', {
              text: "1\n5\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the enter keybinding", function() {
      var startingText;
      startingText = "  abc\n  abc\nabcdefg\n";
      return describe("from the middle of a line", function() {
        var startingCursorPosition;
        startingCursorPosition = [1, 3];
        describe("as a motion", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            ensure('+');
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('enter', {
              cursor: referenceCursorPosition
            });
          });
        });
        return describe("as a selection", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition, referenceText;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            ensure('d +');
            referenceText = editor.getText();
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('d enter', {
              text: referenceText,
              cursor: referenceCursorPosition
            });
          });
        });
      });
    });
    describe("the gg keybinding with stayOnVerticalMotion = false", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text: " 1abc\n 2\n3\n",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        describe("in normal mode", function() {
          it("moves the cursor to the beginning of the first line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
          return it("move to same position if its on first line and first char", function() {
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
        });
        describe("in linewise visual mode", function() {
          return it("selects to the first line in the file", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('V g g', {
              selectedText: " 1abc\n 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("in characterwise visual mode", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 1]
            });
          });
          return it("selects to the first line in the file", function() {
            return ensure('v g g', {
              selectedText: "1abc\n 2",
              cursor: [0, 1]
            });
          });
        });
      });
      return describe("when count specified", function() {
        describe("in normal mode", function() {
          return it("moves the cursor to first char of a specified line", function() {
            return ensure('2 g g', {
              cursor: [1, 1]
            });
          });
        });
        describe("in linewise visual motion", function() {
          return it("selects to a specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('V 2 g g', {
              selectedText: " 2\n3\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("in characterwise visual motion", function() {
          return it("selects to a first character of specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('v 2 g g', {
              selectedText: "2\n3",
              cursor: [1, 1]
            });
          });
        });
      });
    });
    describe("the g_ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "1__\n    2__\n 3abc\n_"
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the last nonblank character", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('g _', {
            cursor: [1, 4]
          });
        });
        return it("will move the cursor to the beginning of the line if necessary", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('g _', {
            cursor: [0, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor downward and outward", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('2 g _', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects the current line excluding whitespace", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v 2 g _', {
            selectedText: "  2  \n 3abc"
          });
        });
      });
    });
    describe("the G keybinding (stayOnVerticalMotion = false)", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text_: "1\n____2\n_3abc\n_",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the last line after whitespace", function() {
          return ensure('G', {
            cursor: [3, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor to a specified line", function() {
          return ensure('2 G', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the last line in the file", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v G', {
            selectedText: "    2\n 3abc\n ",
            cursor: [3, 1]
          });
        });
      });
    });
    describe("the N% keybinding", function() {
      beforeEach(function() {
        var i, results;
        return set({
          text: (function() {
            results = [];
            for (i = 0; i <= 999; i++){ results.push(i); }
            return results;
          }).apply(this).join("\n"),
          cursor: [0, 0]
        });
      });
      return describe("put cursor on line specified by percent", function() {
        it("50%", function() {
          return ensure('5 0 %', {
            cursor: [499, 0]
          });
        });
        it("30%", function() {
          return ensure('3 0 %', {
            cursor: [299, 0]
          });
        });
        it("100%", function() {
          return ensure('1 0 0 %', {
            cursor: [999, 0]
          });
        });
        return it("120%", function() {
          return ensure('1 2 0 %', {
            cursor: [999, 0]
          });
        });
      });
    });
    describe("the H, M, L keybinding( stayOnVerticalMotio = false )", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          textC: "  1\n2\n3\n4\n  5\n6\n7\n8\n|9\n  10"
        });
      });
      describe("the H keybinding", function() {
        beforeEach(function() {
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
        });
        it("moves the cursor to the non-blank-char on first row if visible", function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('H', {
            cursor: [0, 2]
          });
        });
        it("moves the cursor to the non-blank-char on first visible row plus scroll offset", function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(2);
          return ensure('H', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('4 H', {
            cursor: [3, 0]
          });
        });
      });
      describe("the L keybinding", function() {
        beforeEach(function() {
          return spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
        });
        it("moves the cursor to non-blank-char on last row if visible", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('L', {
            cursor: [9, 2]
          });
        });
        it("moves the cursor to the first visible row plus offset", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(7);
          return ensure('L', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('3 L', {
            cursor: [7, 0]
          });
        });
      });
      return describe("the M keybinding", function() {
        beforeEach(function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
        });
        return it("moves the cursor to the non-blank-char of middle of screen", function() {
          return ensure('M', {
            cursor: [4, 2]
          });
        });
      });
    });
    describe("stayOnVerticalMotion setting", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', true);
        return set({
          text: "  0 000000000000\n  1 111111111111\n2 222222222222\n",
          cursor: [2, 10]
        });
      });
      describe("gg, G, N%", function() {
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('g g', {
            cursor: [0, 10]
          });
          ensure('$', {
            cursor: [0, 15]
          });
          ensure('G', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 %', {
            cursor: [0, 15]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 0 h', {
            cursor: [0, 5]
          });
          ensure('5 0 %', {
            cursor: [1, 5]
          });
          return ensure('1 0 0 %', {
            cursor: [2, 5]
          });
        });
      });
      return describe("H, M, L", function() {
        beforeEach(function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(3);
        });
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('H', {
            cursor: [0, 10]
          });
          ensure('M', {
            cursor: [1, 10]
          });
          ensure('L', {
            cursor: [2, 10]
          });
          ensure('$', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('H', {
            cursor: [0, 15]
          });
          ensure('M', {
            cursor: [1, 15]
          });
          ensure('L', {
            cursor: [2, 13]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
      });
    });
    describe('the mark keybindings', function() {
      beforeEach(function() {
        return set({
          text: "  12\n    34\n56\n",
          cursor: [0, 1]
        });
      });
      it('moves to the beginning of the line of a mark', function() {
        runs(function() {
          set({
            cursor: [1, 1]
          });
          return ensureWait('m a');
        });
        return runs(function() {
          set({
            cursor: [0, 0]
          });
          return ensure("' a", {
            cursor: [1, 4]
          });
        });
      });
      it('moves literally to a mark', function() {
        runs(function() {
          set({
            cursor: [1, 2]
          });
          return ensureWait('m a');
        });
        return runs(function() {
          set({
            cursor: [0, 0]
          });
          return ensure('` a', {
            cursor: [1, 2]
          });
        });
      });
      it('deletes to a mark by line', function() {
        runs(function() {
          set({
            cursor: [1, 5]
          });
          return ensureWait('m a');
        });
        return runs(function() {
          set({
            cursor: [0, 0]
          });
          return ensure("d ' a", {
            text: '56\n'
          });
        });
      });
      it('deletes before to a mark literally', function() {
        runs(function() {
          set({
            cursor: [1, 5]
          });
          return ensureWait('m a');
        });
        return runs(function() {
          set({
            cursor: [0, 2]
          });
          return ensure('d ` a', {
            text: '  4\n56\n'
          });
        });
      });
      it('deletes after to a mark literally', function() {
        runs(function() {
          set({
            cursor: [1, 5]
          });
          return ensureWait('m a');
        });
        return runs(function() {
          set({
            cursor: [2, 1]
          });
          return ensure('d ` a', {
            text: '  12\n    36\n'
          });
        });
      });
      return it('moves back to previous', function() {
        set({
          cursor: [1, 5]
        });
        ensure('` `');
        set({
          cursor: [2, 1]
        });
        return ensure('` `', {
          cursor: [1, 5]
        });
      });
    });
    describe("jump command update ` and ' mark", function() {
      var ensureJumpAndBack, ensureJumpAndBackLinewise, ensureJumpMark;
      ensureJumpMark = function(value) {
        ensure(null, {
          mark: {
            "`": value
          }
        });
        return ensure(null, {
          mark: {
            "'": value
          }
        });
      };
      ensureJumpAndBack = function(keystroke, option) {
        var afterMove, beforeMove;
        afterMove = option.cursor;
        beforeMove = editor.getCursorBufferPosition();
        ensure(keystroke, {
          cursor: afterMove
        });
        ensureJumpMark(beforeMove);
        expect(beforeMove.isEqual(afterMove)).toBe(false);
        ensure("` `", {
          cursor: beforeMove
        });
        return ensureJumpMark(afterMove);
      };
      ensureJumpAndBackLinewise = function(keystroke, option) {
        var afterMove, beforeMove;
        afterMove = option.cursor;
        beforeMove = editor.getCursorBufferPosition();
        expect(beforeMove.column).not.toBe(0);
        ensure(keystroke, {
          cursor: afterMove
        });
        ensureJumpMark(beforeMove);
        expect(beforeMove.isEqual(afterMove)).toBe(false);
        ensure("' '", {
          cursor: [beforeMove.row, 0]
        });
        return ensureJumpMark(afterMove);
      };
      beforeEach(function() {
        var i, len, mark, ref2, ref3;
        ref2 = "`'";
        for (i = 0, len = ref2.length; i < len; i++) {
          mark = ref2[i];
          if ((ref3 = vimState.mark.marks[mark]) != null) {
            ref3.destroy();
          }
          vimState.mark.marks[mark] = null;
        }
        return set({
          text: "0: oo 0\n1: 1111\n2: 2222\n3: oo 3\n4: 4444\n5: oo 5",
          cursor: [1, 0]
        });
      });
      describe("initial state", function() {
        return it("return [0, 0]", function() {
          ensure(null, {
            mark: {
              "'": [0, 0]
            }
          });
          return ensure(null, {
            mark: {
              "`": [0, 0]
            }
          });
        });
      });
      return describe("jump motion in normal-mode", function() {
        var initial;
        initial = [3, 3];
        beforeEach(function() {
          var component;
          jasmine.attachToDOM(getView(atom.workspace));
          if (editorElement.measureDimensions != null) {
            component = editor.component;
            component.element.style.height = component.getLineHeight() * editor.getLineCount() + 'px';
            editorElement.measureDimensions();
          }
          ensure(null, {
            mark: {
              "'": [0, 0]
            }
          });
          ensure(null, {
            mark: {
              "`": [0, 0]
            }
          });
          return set({
            cursor: initial
          });
        });
        it("G jump&back", function() {
          return ensureJumpAndBack('G', {
            cursor: [5, 3]
          });
        });
        it("g g jump&back", function() {
          return ensureJumpAndBack("g g", {
            cursor: [0, 3]
          });
        });
        it("100 % jump&back", function() {
          return ensureJumpAndBack("1 0 0 %", {
            cursor: [5, 3]
          });
        });
        it(") jump&back", function() {
          return ensureJumpAndBack(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back", function() {
          return ensureJumpAndBack("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back", function() {
          return ensureJumpAndBack("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back", function() {
          return ensureJumpAndBack("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back", function() {
          return ensureJumpAndBack("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back", function() {
          return ensureJumpAndBack("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back", function() {
          return ensureJumpAndBack("L", {
            cursor: [5, 3]
          });
        });
        it("H jump&back", function() {
          return ensureJumpAndBack("H", {
            cursor: [0, 3]
          });
        });
        it("M jump&back", function() {
          return ensureJumpAndBack("M", {
            cursor: [2, 3]
          });
        });
        it("* jump&back", function() {
          return ensureJumpAndBack("*", {
            cursor: [5, 3]
          });
        });
        it("Sharp(#) jump&back", function() {
          return ensureJumpAndBack('#', {
            cursor: [0, 3]
          });
        });
        it("/ jump&back", function() {
          return ensureJumpAndBack('/ oo enter', {
            cursor: [5, 3]
          });
        });
        it("? jump&back", function() {
          return ensureJumpAndBack('? oo enter', {
            cursor: [0, 3]
          });
        });
        it("n jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure('/ oo enter', {
            cursor: [0, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [5, 3]
          });
        });
        it("N jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure('? oo enter', {
            cursor: [5, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [0, 3]
          });
        });
        it("G jump&back linewise", function() {
          return ensureJumpAndBackLinewise('G', {
            cursor: [5, 3]
          });
        });
        it("g g jump&back linewise", function() {
          return ensureJumpAndBackLinewise("g g", {
            cursor: [0, 3]
          });
        });
        it("100 % jump&back linewise", function() {
          return ensureJumpAndBackLinewise("1 0 0 %", {
            cursor: [5, 3]
          });
        });
        it(") jump&back linewise", function() {
          return ensureJumpAndBackLinewise(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back linewise", function() {
          return ensureJumpAndBackLinewise("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back linewise", function() {
          return ensureJumpAndBackLinewise("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back linewise", function() {
          return ensureJumpAndBackLinewise("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back linewise", function() {
          return ensureJumpAndBackLinewise("L", {
            cursor: [5, 3]
          });
        });
        it("H jump&back linewise", function() {
          return ensureJumpAndBackLinewise("H", {
            cursor: [0, 3]
          });
        });
        it("M jump&back linewise", function() {
          return ensureJumpAndBackLinewise("M", {
            cursor: [2, 3]
          });
        });
        return it("* jump&back linewise", function() {
          return ensureJumpAndBackLinewise("*", {
            cursor: [5, 3]
          });
        });
      });
    });
    describe('the V keybinding', function() {
      var text;
      text = [][0];
      beforeEach(function() {
        text = new TextData("01\n002\n0003\n00004\n000005\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      it("selects down a line", function() {
        return ensure('V j j', {
          selectedText: text.getLines([1, 2, 3])
        });
      });
      return it("selects up a line", function() {
        return ensure('V k', {
          selectedText: text.getLines([0, 1])
        });
      });
    });
    describe('MoveTo(Previous|Next)Fold(Start|End)', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              '[ [': 'vim-mode-plus:move-to-previous-fold-start',
              '] [': 'vim-mode-plus:move-to-next-fold-start',
              '[ ]': 'vim-mode-plus:move-to-previous-fold-end',
              '] ]': 'vim-mode-plus:move-to-next-fold-end'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("MoveToPreviousFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold start row", function() {
          ensure('[ [', {
            cursor: [22, 6]
          });
          ensure('[ [', {
            cursor: [20, 6]
          });
          ensure('[ [', {
            cursor: [18, 4]
          });
          ensure('[ [', {
            cursor: [9, 2]
          });
          return ensure('[ [', {
            cursor: [8, 0]
          });
        });
      });
      describe("MoveToNextFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold start row", function() {
          ensure('] [', {
            cursor: [8, 0]
          });
          ensure('] [', {
            cursor: [9, 2]
          });
          ensure('] [', {
            cursor: [18, 4]
          });
          ensure('] [', {
            cursor: [20, 6]
          });
          return ensure('] [', {
            cursor: [22, 6]
          });
        });
      });
      describe("MoveToPreviousFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold end row", function() {
          ensure('[ ]', {
            cursor: [28, 2]
          });
          ensure('[ ]', {
            cursor: [25, 4]
          });
          ensure('[ ]', {
            cursor: [23, 8]
          });
          return ensure('[ ]', {
            cursor: [21, 8]
          });
        });
      });
      return describe("MoveToNextFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold end row", function() {
          ensure('] ]', {
            cursor: [21, 8]
          });
          ensure('] ]', {
            cursor: [23, 8]
          });
          ensure('] ]', {
            cursor: [25, 4]
          });
          return ensure('] ]', {
            cursor: [28, 2]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)Fold(Start|End)WithSameIndent', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        getVimState(function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, vim;
        });
        return runs(function() {
          set({
            grammar: "source.js",
            text: "class TestA {\n  methA() {\n    if (true) {\n      null\n    }\n  }\n}\n\nclass TestB {\n  methB() {\n    if (true) {\n      null\n    }\n  }\n}\n"
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              '[ [': 'vim-mode-plus:move-to-previous-fold-start-with-same-indent',
              '] [': 'vim-mode-plus:move-to-next-fold-start-with-same-indent',
              '[ ]': 'vim-mode-plus:move-to-previous-fold-end-with-same-indent',
              '] ]': 'vim-mode-plus:move-to-next-fold-end-with-same-indent'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-javascript');
      });
      describe("MoveToPreviousFoldStartWithSameIndent", function() {
        it("[from largetst fold] move to first char of previous fold start row", function() {
          set({
            cursor: [14, 0]
          });
          ensure('[ [', {
            cursor: [8, 0]
          });
          ensure('[ [', {
            cursor: [0, 0]
          });
          return ensure('[ [', {
            cursor: [0, 0]
          });
        });
        it("[from outer fold] move to first char of previous fold start row", function() {
          set({
            cursor: [7, 0]
          });
          ensure('[ [', {
            cursor: [0, 0]
          });
          return ensure('[ [', {
            cursor: [0, 0]
          });
        });
        return it("[from one level deeper fold] move to first char of previous fold start row", function() {
          set({
            cursor: [9, 0]
          });
          ensure('[ [', {
            cursor: [1, 2]
          });
          return ensure('[ [', {
            cursor: [1, 2]
          });
        });
      });
      describe("MoveToNextFoldStartWithSameIndent", function() {
        it("[from largetst fold] move to first char of next fold start row", function() {
          set({
            cursor: [0, 0]
          });
          ensure('] [', {
            cursor: [8, 0]
          });
          return ensure('] [', {
            cursor: [8, 0]
          });
        });
        it("[from outer fold] move to first char of next fold start row", function() {
          set({
            cursor: [7, 0]
          });
          ensure('] [', {
            cursor: [8, 0]
          });
          return ensure('] [', {
            cursor: [8, 0]
          });
        });
        return it("[from one level deeper fold] move to first char of next fold start row", function() {
          set({
            cursor: [1, 0]
          });
          ensure('] [', {
            cursor: [9, 2]
          });
          return ensure('] [', {
            cursor: [9, 2]
          });
        });
      });
      describe("MoveToPreviousFoldEndWithSameIndent", function() {
        it("[from largetst fold] move to first char of previous fold end row", function() {
          set({
            cursor: [14, 0]
          });
          ensure('[ ]', {
            cursor: [6, 0]
          });
          return ensure('[ ]', {
            cursor: [6, 0]
          });
        });
        it("[from outer fold] move to first char of previous fold end row", function() {
          set({
            cursor: [7, 0]
          });
          ensure('[ ]', {
            cursor: [6, 0]
          });
          return ensure('[ ]', {
            cursor: [6, 0]
          });
        });
        return it("[from one level deeper fold] move to first char of previous fold end row", function() {
          set({
            cursor: [13, 0]
          });
          ensure('[ ]', {
            cursor: [5, 2]
          });
          return ensure('[ ]', {
            cursor: [5, 2]
          });
        });
      });
      return describe("MoveToNextFoldEndWithSameIndent", function() {
        it("[from largetst fold] move to first char of next fold end row", function() {
          set({
            cursor: [0, 0]
          });
          ensure('] ]', {
            cursor: [6, 0]
          });
          ensure('] ]', {
            cursor: [14, 0]
          });
          return ensure('] ]', {
            cursor: [14, 0]
          });
        });
        it("[from outer fold] move to first char of next fold end row", function() {
          set({
            cursor: [7, 0]
          });
          ensure('] ]', {
            cursor: [14, 0]
          });
          return ensure('] ]', {
            cursor: [14, 0]
          });
        });
        return it("[from one level deeper fold] move to first char of next fold end row", function() {
          set({
            cursor: [1, 0]
          });
          ensure('] ]', {
            cursor: [5, 2]
          });
          ensure('] ]', {
            cursor: [13, 2]
          });
          return ensure('] ]', {
            cursor: [13, 2]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)String', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g s': 'vim-mode-plus:move-to-next-string',
            'g S': 'vim-mode-plus:move-to-previous-string'
          }
        });
      });
      describe('editor for softTab', function() {
        var pack;
        pack = 'language-coffee-script';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return runs(function() {
            return set({
              text: "disposable?.dispose()\ndisposable = atom.commands.add 'atom-workspace',\n  'check-up': -> fun('backward')\n  'check-down': -> fun('forward')\n\n",
              grammar: 'source.coffee'
            });
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursor: [0, 0]
          });
          ensure('g s', {
            cursor: [1, 31]
          });
          ensure('g s', {
            cursor: [2, 2]
          });
          ensure('g s', {
            cursor: [2, 21]
          });
          ensure('g s', {
            cursor: [3, 2]
          });
          return ensure('g s', {
            cursor: [3, 23]
          });
        });
        it("move to previous string", function() {
          set({
            cursor: [4, 0]
          });
          ensure('g S', {
            cursor: [3, 23]
          });
          ensure('g S', {
            cursor: [3, 2]
          });
          ensure('g S', {
            cursor: [2, 21]
          });
          ensure('g S', {
            cursor: [2, 2]
          });
          return ensure('g S', {
            cursor: [1, 31]
          });
        });
        return it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 g s', {
            cursor: [2, 21]
          });
          return ensure('3 g S', {
            cursor: [1, 31]
          });
        });
      });
      return describe('editor for hardTab', function() {
        var pack;
        pack = 'language-go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return getVimState('sample.go', function(state, vimEditor) {
            editor = state.editor, editorElement = state.editorElement;
            return set = vimEditor.set, ensure = vimEditor.ensure, vimEditor;
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursorScreen: [0, 0]
          });
          ensure('g s', {
            cursorScreen: [2, 7]
          });
          ensure('g s', {
            cursorScreen: [3, 7]
          });
          ensure('g s', {
            cursorScreen: [8, 8]
          });
          ensure('g s', {
            cursorScreen: [9, 8]
          });
          ensure('g s', {
            cursorScreen: [11, 20]
          });
          ensure('g s', {
            cursorScreen: [12, 15]
          });
          ensure('g s', {
            cursorScreen: [13, 15]
          });
          ensure('g s', {
            cursorScreen: [15, 15]
          });
          return ensure('g s', {
            cursorScreen: [16, 15]
          });
        });
        return it("move to previous string", function() {
          set({
            cursorScreen: [18, 0]
          });
          ensure('g S', {
            cursorScreen: [16, 15]
          });
          ensure('g S', {
            cursorScreen: [15, 15]
          });
          ensure('g S', {
            cursorScreen: [13, 15]
          });
          ensure('g S', {
            cursorScreen: [12, 15]
          });
          ensure('g S', {
            cursorScreen: [11, 20]
          });
          ensure('g S', {
            cursorScreen: [9, 8]
          });
          ensure('g S', {
            cursorScreen: [8, 8]
          });
          ensure('g S', {
            cursorScreen: [3, 7]
          });
          return ensure('g S', {
            cursorScreen: [2, 7]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)Number', function() {
      var pack;
      pack = 'language-coffee-script';
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g n': 'vim-mode-plus:move-to-next-number',
            'g N': 'vim-mode-plus:move-to-previous-number'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage(pack);
        });
        runs(function() {
          return set({
            grammar: 'source.coffee'
          });
        });
        return set({
          text: "num1 = 1\narr1 = [1, 101, 1001]\narr2 = [\"1\", \"2\", \"3\"]\nnum2 = 2\nfun(\"1\", 2, 3)\n\n"
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage(pack);
      });
      it("move to next number", function() {
        set({
          cursor: [0, 0]
        });
        ensure('g n', {
          cursor: [0, 7]
        });
        ensure('g n', {
          cursor: [1, 8]
        });
        ensure('g n', {
          cursor: [1, 11]
        });
        ensure('g n', {
          cursor: [1, 16]
        });
        ensure('g n', {
          cursor: [3, 7]
        });
        ensure('g n', {
          cursor: [4, 9]
        });
        return ensure('g n', {
          cursor: [4, 12]
        });
      });
      it("move to previous number", function() {
        set({
          cursor: [5, 0]
        });
        ensure('g N', {
          cursor: [4, 12]
        });
        ensure('g N', {
          cursor: [4, 9]
        });
        ensure('g N', {
          cursor: [3, 7]
        });
        ensure('g N', {
          cursor: [1, 16]
        });
        ensure('g N', {
          cursor: [1, 11]
        });
        ensure('g N', {
          cursor: [1, 8]
        });
        return ensure('g N', {
          cursor: [0, 7]
        });
      });
      return it("support count", function() {
        set({
          cursor: [0, 0]
        });
        ensure('5 g n', {
          cursor: [3, 7]
        });
        return ensure('3 g N', {
          cursor: [1, 8]
        });
      });
    });
    return describe('subword motion', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'q': 'vim-mode-plus:move-to-next-subword',
            'Q': 'vim-mode-plus:move-to-previous-subword',
            'ctrl-e': 'vim-mode-plus:move-to-end-of-subword'
          }
        });
      });
      it("move to next/previous subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        return ensure('Q', {
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
      });
      return it("move-to-end-of-subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "came|lCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCas|e => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase =|> (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => |(with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (wit|h special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with specia|l) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Ch|aRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActe|rRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerR|s\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndas|h-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-cas|e\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnak|e_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_cas|e_word\n"
        });
        return ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tZ2VuZXJhbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFDVixNQUE2QyxPQUFBLENBQVEsZUFBUixDQUE3QyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDOztFQUNsQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLDBCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLGlCQUFUO0FBQzNCLFFBQUE7SUFBQSxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsQ0FBM0I7SUFDQSxTQUFBLEdBQVksTUFBTSxDQUFDO0lBQ25CLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQXhCLEdBQ0UsU0FBUyxDQUFDLHVCQUFWLENBQUEsQ0FBQSxHQUFzQyxpQkFBQSxHQUFvQixTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFqRixHQUFzRztBQUN4RyxXQUFPLFNBQVMsQ0FBQyxvQkFBVixDQUFBO0VBTG9COztFQU83QixRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtBQUN6QixRQUFBO0lBQUEsT0FBNkQsRUFBN0QsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxvQkFBZCxFQUEwQixnQkFBMUIsRUFBa0MsdUJBQWxDLEVBQWlEO0lBRWpELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsNEJBQWQsRUFBNEI7TUFIbEIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtBQUN6QixVQUFBO01BQUEsSUFBQSxHQUFPO01BQ1As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LEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFaO01BbkNrQyxDQUFwQzthQW9DQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtRQUMzQixHQUFBLENBQUk7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBSjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO2VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7TUFsQjJCLENBQTdCO0lBNUN5QixDQUEzQjtFQTFwRXlCLENBQTNCO0FBWEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuc2V0RWRpdG9yV2lkdGhJbkNoYXJhY3RlcnMgPSAoZWRpdG9yLCB3aWR0aEluQ2hhcmFjdGVycykgLT5cbiAgZWRpdG9yLnNldERlZmF1bHRDaGFyV2lkdGgoMSlcbiAgY29tcG9uZW50ID0gZWRpdG9yLmNvbXBvbmVudFxuICBjb21wb25lbnQuZWxlbWVudC5zdHlsZS53aWR0aCA9XG4gICAgY29tcG9uZW50LmdldEd1dHRlckNvbnRhaW5lcldpZHRoKCkgKyB3aWR0aEluQ2hhcmFjdGVycyAqIGNvbXBvbmVudC5tZWFzdXJlbWVudHMuYmFzZUNoYXJhY3RlcldpZHRoICsgXCJweFwiXG4gIHJldHVybiBjb21wb25lbnQuZ2V0TmV4dFVwZGF0ZVByb21pc2UoKVxuXG5kZXNjcmliZSBcIk1vdGlvbiBnZW5lcmFsXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdCwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGVuc3VyZVdhaXR9ID0gX3ZpbVxuXG4gIGRlc2NyaWJlIFwic2ltcGxlIG1vdGlvbnNcIiwgLT5cbiAgICB0ZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RcbiAgICAgICAgQUJDREVcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICBkZXNjcmliZSBcInRoZSBoIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGxlZnQsIGJ1dCBub3QgdG8gdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2gnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnaCcsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBwcmV2aW91cyBsaW5lIGlmIHdyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgICAgZW5zdXJlICdoIGgnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0aGUgY2hhcmFjdGVyIHRvIHRoZSBsZWZ0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd5IGgnLFxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYSdcblxuICAgIGRlc2NyaWJlIFwidGhlIGoga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGRvd24sIGJ1dCBub3QgdG8gdGhlIGVuZCBvZiB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBsaW5lLCBub3QgcGFzdCBpdFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgM11cblxuICAgICAgaXQgXCJyZW1lbWJlcnMgdGhlIGNvbHVtbiBpdCB3YXMgaW4gYWZ0ZXIgbW92aW5nIHRvIHNob3J0ZXIgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgNF1cblxuICAgICAgaXQgXCJuZXZlciBnbyBwYXN0IGxhc3QgbmV3bGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzEgMCBqJywgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFsxLCAyXSwgc2VsZWN0ZWRUZXh0OiAnYidcblxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgZG93blwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDJdLCBzZWxlY3RlZFRleHQ6IFwiYmNkXFxuQUJcIlxuXG4gICAgICAgIGl0IFwiZG9lc24ndCBnbyBvdmVyIGFmdGVyIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAyXSwgc2VsZWN0ZWRUZXh0OiBcImJjZFxcbkFCXCJcblxuICAgICAgICBpdCBcImtlZXAgc2FtZSBjb2x1bW4oZ29hbENvbHVtbikgZXZlbiBhZnRlciBhY3Jvc3MgdGhlIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZSdcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhYmNkZWZnXG5cbiAgICAgICAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJ2ogaicsIGN1cnNvcjogWzIsIDRdLCBzZWxlY3RlZFRleHQ6IFwiZGVmZ1xcblxcbmFiY2RcIlxuXG4gICAgICAgICMgW0ZJWE1FXSB0aGUgcGxhY2Ugb2YgdGhpcyBzcGVjIGlzIG5vdCBhcHByb3ByaWF0ZS5cbiAgICAgICAgaXQgXCJvcmlnaW5hbCB2aXN1YWwgbGluZSByZW1haW5zIHdoZW4gamsgYWNyb3NzIG9yaWduYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAgIGxpbmUwXG4gICAgICAgICAgICBsaW5lMVxuICAgICAgICAgICAgbGluZTJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLCAyXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMCwgMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEsIDJdKVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlLWRvd24td3JhcCwgbW92ZS11cC13cmFwXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnayc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdXAtd3JhcCdcbiAgICAgICAgICAgICdqJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS1kb3duLXdyYXAnXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgaGVsbG9cbiAgICAgICAgICBoZWxsb1xuICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgaGVsbG9cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlICdtb3ZlLWRvd24td3JhcCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJ2onLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnMiBqJywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzQgaicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgIGRlc2NyaWJlICdtb3ZlLXVwLXdyYXAnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJ2snLCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnMiBrJywgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzQgaycsIGN1cnNvcjogWzAsIDFdXG5cblxuICAgICMgW05PVEVdIFNlZSAjNTYwXG4gICAgIyBUaGlzIHNwZWMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiBsb2NhbCB0ZXN0LCBub3QgYXQgQ0kgc2VydmljZS5cbiAgICAjIFNhZmUgdG8gZXhlY3V0ZSBpZiBpdCBwYXNzZXMsIGJ1dCBmcmVlemUgZWRpdG9yIHdoZW4gaXQgZmFpbC5cbiAgICAjIFNvIGV4cGxpY2l0bHkgZGlzYWJsZWQgYmVjYXVzZSBJIGRvbid0IHdhbnQgYmUgYmFubmVkIGJ5IENJIHNlcnZpY2UuXG4gICAgIyBFbmFibGUgdGhpcyBvbiBkZW1tYW5kIHdoZW4gZnJlZXppbmcgaGFwcGVucyBhZ2FpbiFcbiAgICB4ZGVzY3JpYmUgXCJ3aXRoIGJpZyBjb3VudCB3YXMgZ2l2ZW5cIiwgLT5cbiAgICAgIEJJR19OVU1CRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxuICAgICAgZW5zdXJlQmlnQ291bnRNb3Rpb24gPSAoa2V5c3Ryb2tlcywgb3B0aW9ucykgLT5cbiAgICAgICAgY291bnQgPSBTdHJpbmcoQklHX05VTUJFUikuc3BsaXQoJycpLmpvaW4oJyAnKVxuICAgICAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5zcGxpdCgnJykuam9pbignICcpXG4gICAgICAgIGVuc3VyZShcIiN7Y291bnR9ICN7a2V5c3Ryb2tlc31cIiwgb3B0aW9ucylcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgeyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdnIH0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICcsIE4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLW51bWJlcidcbiAgICAgICAgICAgICcsIG4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtbnVtYmVyJ1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMDAwXG4gICAgICAgICAgMTExMVxuICAgICAgICAgIDIyMjJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImJ5IGBqYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdqJywgICBjdXJzb3I6IFsyLCAyXVxuICAgICAgaXQgXCJieSBga2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnaycsICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiYnkgYGhgXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2gnLCAgIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcImJ5IGBsYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdsJywgICBjdXJzb3I6IFsxLCAzXVxuICAgICAgaXQgXCJieSBgW2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnWycsICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiYnkgYF1gXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ10nLCAgIGN1cnNvcjogWzIsIDJdXG4gICAgICBpdCBcImJ5IGB3YFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICd3JywgICBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBgV2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnVycsICAgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYGJgXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2InLCAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGBCYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdCJywgICBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgZWBcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnZScsICAgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYChgXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJygnLCAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGApYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcpJywgICBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBge2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAneycsICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYH1gXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ30nLCAgIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGAtYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICctJywgICBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgX2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnXycsICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGl0IFwiYnkgYGcge2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2cgeycsIGN1cnNvcjogWzEsIDJdICMgTm8gZm9sZCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGBnIH1gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdnIH0nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGZvbGQgbm8gbW92ZSBidXQgd29uJ3QgZnJlZXplLlxuICAgICAgaXQgXCJieSBgLCBOYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnLCBOJywgY3Vyc29yOiBbMSwgMl0gIyBObyBncmFtbWFyLCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGAsIG5gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcsIG4nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGdyYW1tYXIsIG5vIG1vdmUgYnV0IHdvbid0IGZyZWV6ZS5cbiAgICAgIGl0IFwiYnkgYHkgeWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ3kgeScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICBkZXNjcmliZSBcInRoZSBrIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB1cFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdXAgYW5kIHJlbWVtYmVyIGNvbHVtbiBpdCB3YXMgaW5cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDRdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzAsIDRdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB1cCwgYnV0IG5vdCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMSAwIGsnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJrZWVwIHNhbWUgY29sdW1uKGdvYWxDb2x1bW4pIGV2ZW4gYWZ0ZXIgYWNyb3NzIHRoZSBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgYWJjZGVmZ1xuXG4gICAgICAgICAgICAgIGFiY2RlZmdcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAzXVxuICAgICAgICAgIGVuc3VyZSAndicsIGN1cnNvcjogWzIsIDRdLCBzZWxlY3RlZFRleHQ6ICdkJ1xuICAgICAgICAgIGVuc3VyZSAnayBrJywgY3Vyc29yOiBbMCwgM10sIHNlbGVjdGVkVGV4dDogXCJkZWZnXFxuXFxuYWJjZFwiXG5cbiAgICBkZXNjcmliZSBcInRoZSBqLCBrIGtleWJpbmRpbmcgaW4gaGFyZFRhYiB0ZXh0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1nbycpXG5cbiAgICAgICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1FZGl0b3JcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBncmFtbWFyOiAnc291cmNlLmdvJ1xuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgcGFja2F8Z2UgbWFpblxuXG4gICAgICAgICAgICBpbXBvcnQgXCJmbXRcIlxuXG4gICAgICAgICAgICBmdW5jIG1haW4oKSB7XG4gICAgICAgICAgICBcXHRpZiA3JTIgPT0gMCB7XG4gICAgICAgICAgICBcXHRcXHRmbXQuUHJpbnRsbihcIjcgaXMgZXZlblwiKVxuICAgICAgICAgICAgXFx0fSBlbHNlIHtcbiAgICAgICAgICAgIFxcdFxcdGZtdC5QcmludGxuKFwiNyBpcyBvZGRcIilcbiAgICAgICAgICAgIFxcdH1cbiAgICAgICAgICAgIH1cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIlt0YWJMZW5ndGggPSAyXSBtb3ZlIHVwL2Rvd24gYnVmZmVyUm93IHdpc2Ugd2l0aCBhd2FyZSBvZiB0YWJMZW5ndGhcIiwgLT5cbiAgICAgICAgZWRpdG9yLnVwZGF0ZSh0YWJMZW5ndGg6IDIpXG5cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgMF0sIGN1cnNvclNjcmVlbjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDVdLCBjdXJzb3JTY3JlZW46IFsyLCA1XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFszLCAwXSwgY3Vyc29yU2NyZWVuOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbNCwgNV0sIGN1cnNvclNjcmVlbjogWzQsIDVdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzUsIDRdLCBjdXJzb3JTY3JlZW46IFs1LCA1XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs2LCAzXSwgY3Vyc29yU2NyZWVuOiBbNiwgNV1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbNywgNF0sIGN1cnNvclNjcmVlbjogWzcsIDVdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzgsIDNdLCBjdXJzb3JTY3JlZW46IFs4LCA1XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs5LCAxXSwgY3Vyc29yU2NyZWVuOiBbOSwgMl1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMTAsIDBdLCBjdXJzb3JTY3JlZW46IFsxMCwgMF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbOSwgMV0sIGN1cnNvclNjcmVlbjogWzksIDJdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzgsIDNdLCBjdXJzb3JTY3JlZW46IFs4LCA1XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFs3LCA0XSwgY3Vyc29yU2NyZWVuOiBbNywgNV1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbNiwgM10sIGN1cnNvclNjcmVlbjogWzYsIDVdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzUsIDRdLCBjdXJzb3JTY3JlZW46IFs1LCA1XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFs0LCA1XSwgY3Vyc29yU2NyZWVuOiBbNCwgNV1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMywgMF0sIGN1cnNvclNjcmVlbjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzIsIDVdLCBjdXJzb3JTY3JlZW46IFsyLCA1XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFsxLCAwXSwgY3Vyc29yU2NyZWVuOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMCwgNV0sIGN1cnNvclNjcmVlbjogWzAsIDVdXG5cbiAgICAgIGl0IFwiW3RhYkxlbmd0aCA9IDRdIG1vdmUgdXAvZG93biBidWZmZXJSb3cgd2lzZSB3aXRoIGF3YXJlIG9mIHRhYkxlbmd0aFwiLCAtPlxuICAgICAgICBlZGl0b3IudXBkYXRlKHRhYkxlbmd0aDogNClcblxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsxLCAwXSwgY3Vyc29yU2NyZWVuOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgNV0sIGN1cnNvclNjcmVlbjogWzIsIDVdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzMsIDBdLCBjdXJzb3JTY3JlZW46IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs0LCA1XSwgY3Vyc29yU2NyZWVuOiBbNCwgNV1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbNSwgMl0sIGN1cnNvclNjcmVlbjogWzUsIDVdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzYsIDFdLCBjdXJzb3JTY3JlZW46IFs2LCA0XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs3LCAyXSwgY3Vyc29yU2NyZWVuOiBbNywgNV1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbOCwgMV0sIGN1cnNvclNjcmVlbjogWzgsIDRdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzksIDFdLCBjdXJzb3JTY3JlZW46IFs5LCA0XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsxMCwgMF0sIGN1cnNvclNjcmVlbjogWzEwLCAwXVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFs5LCAxXSwgY3Vyc29yU2NyZWVuOiBbOSwgNF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbOCwgMV0sIGN1cnNvclNjcmVlbjogWzgsIDRdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzcsIDJdLCBjdXJzb3JTY3JlZW46IFs3LCA1XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFs2LCAxXSwgY3Vyc29yU2NyZWVuOiBbNiwgNF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbNSwgMl0sIGN1cnNvclNjcmVlbjogWzUsIDVdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzQsIDVdLCBjdXJzb3JTY3JlZW46IFs0LCA1XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFszLCAwXSwgY3Vyc29yU2NyZWVuOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMiwgNV0sIGN1cnNvclNjcmVlbjogWzIsIDVdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzEsIDBdLCBjdXJzb3JTY3JlZW46IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFswLCA1XSwgY3Vyc29yU2NyZWVuOiBbMCwgNV1cblxuICAgICAgaXQgXCJbdGFiTGVuZ3RoID0gOF0gbW92ZSB1cC9kb3duIGJ1ZmZlclJvdyB3aXNlIHdpdGggYXdhcmUgb2YgdGFiTGVuZ3RoXCIsIC0+XG4gICAgICAgIGVkaXRvci51cGRhdGUodGFiTGVuZ3RoOiA4KVxuICAgICAgICBzZXQgY3Vyc29yOiBbNSwgOV1cblxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs2LCAyXSwgY3Vyc29yU2NyZWVuOiBbNiwgMTZdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzcsIDhdLCBjdXJzb3JTY3JlZW46IFs3LCAxNV1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbOCwgMl0sIGN1cnNvclNjcmVlbjogWzgsIDE2XVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs5LCAxXSwgY3Vyc29yU2NyZWVuOiBbOSwgOF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMTAsIDBdLCBjdXJzb3JTY3JlZW46IFsxMCwgMF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbOSwgMV0sIGN1cnNvclNjcmVlbjogWzksIDhdXG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzgsIDJdLCBjdXJzb3JTY3JlZW46IFs4LCAxNl1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbNywgOF0sIGN1cnNvclNjcmVlbjogWzcsIDE1XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFs2LCAyXSwgY3Vyc29yU2NyZWVuOiBbNiwgMTZdXG5cbiAgICBkZXNjcmliZSBcImdqIGdrIGluIHNvZnR3cmFwXCIsIC0+XG4gICAgICBbdGV4dF0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKVxuICAgICAgICBlZGl0b3Iuc2V0RWRpdG9yV2lkdGhJbkNoYXJzKDEwKVxuICAgICAgICBlZGl0b3Iuc2V0RGVmYXVsdENoYXJXaWR0aCgxKVxuICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDFzdCBsaW5lIG9mIGJ1ZmZlclxuICAgICAgICAgIDJuZCBsaW5lIG9mIGJ1ZmZlciwgVmVyeSBsb25nIGxpbmVcbiAgICAgICAgICAzcmQgbGluZSBvZiBidWZmZXJcblxuICAgICAgICAgIDV0aCBsaW5lIG9mIGJ1ZmZlclxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogdGV4dC5nZXRSYXcoKSwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgbm90IHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2NyZWVuIHBvc2l0aW9uIGFuZCBidWZmZXIgcG9zaXRpb24gaXMgZGlmZmVyZW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFsxLCAwXSwgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzIsIDBdLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMywgMF0sIGN1cnNvcjogWzEsIDldXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFs0LCAwXSwgY3Vyc29yOiBbMSwgMTJdXG5cbiAgICAgICAgaXQgXCJqayBtb3ZlIHNlbGVjdGlvbiBidWZmZXItbGluZSB3aXNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4wXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjFdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4zXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uM10pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjFdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4wXSkgIyBkbyBub3RoaW5nXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2NyZWVuIHBvc2l0aW9uIGFuZCBidWZmZXIgcG9zaXRpb24gaXMgZGlmZmVyZW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFsxLCAwXSwgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzIsIDBdLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMywgMF0sIGN1cnNvcjogWzEsIDldXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFs0LCAwXSwgY3Vyc29yOiBbMSwgMTJdXG5cbiAgICAgICAgaXQgXCJqayBtb3ZlIHNlbGVjdGlvbiBidWZmZXItbGluZSB3aXNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Li40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMi4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMS4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Li40XSkgIyBkbyBub3RoaW5nXG5cbiAgICBkZXNjcmliZSBcInRoZSBsIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDA6IGFhYWFcbiAgICAgICAgICAxOiBiYmJiXG4gICAgICAgICAgMjogY2NjY1xuXG4gICAgICAgICAgNDpcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB3cmFwTGVmdFJpZ2h0TW90aW9uID0gZmFsc2UoPWRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGl0IFwiW25vcm1hbF0gbW92ZSB0byByaWdodCwgY291bnQgc3VwcG9ydCwgYnV0IG5vdCB3cmFwIHRvIG5leHQtbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJzIgbCcsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgZW5zdXJlICc1IGwnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzAsIDZdICMgbm8gd3JhcFxuICAgICAgICBpdCBcIltub3JtYWw6IGF0LWJsYW5rLXJvd10gbm90IHdyYXAgdG8gbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMywgMF0sIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgaXQgXCJbdmlzdWFsOiBhdC1sYXN0LWNoYXJdIGNhbiBzZWxlY3QgbmV3bGluZSBidXQgbm90IHdyYXAgdG8gbmV4dC1saW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlIFwidlwiLCBzZWxlY3RlZFRleHQ6IFwiYVwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzAsIDddXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuaXNBdEVuZE9mTGluZSgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZW5zdXJlIFwibFwiLCBzZWxlY3RlZFRleHQ6IFwiYVxcblwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlIFwibFwiLCBzZWxlY3RlZFRleHQ6IFwiYVxcblwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiW3Zpc3VhbDogYXQtYmxhbmstcm93XSBjYW4gc2VsZWN0IG5ld2xpbmUgYnV0IG5vdCB3cmFwIHRvIG5leHQtbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSBcInZcIiwgc2VsZWN0ZWRUZXh0OiBcIlxcblwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzQsIDBdXG4gICAgICAgICAgZW5zdXJlIFwibFwiLCBzZWxlY3RlZFRleHQ6IFwiXFxuXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHdyYXBMZWZ0UmlnaHRNb3Rpb24gPSB0cnVlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuXG4gICAgICAgIGl0IFwiW25vcm1hbDogYXQtbGFzdC1jaGFyXSBtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFsxLCAwXSwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICBpdCBcIltub3JtYWw6IGF0LWJsYW5rLXJvd10gd3JhcCB0byBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFs0LCAwXSwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICBpdCBcIlt2aXN1YWw6IGF0LWxhc3QtY2hhcl0gc2VsZWN0IG5ld2xpbmUgdGhlbiBtb3ZlIHRvIG5leHQtbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIGVuc3VyZSBcInZcIiwgc2VsZWN0ZWRUZXh0OiBcImFcIiwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmlzQXRFbmRPZkxpbmUoKSkudG9CZSh0cnVlKVxuICAgICAgICAgIGVuc3VyZSBcImxcIiwgc2VsZWN0ZWRUZXh0OiBcImFcXG5cIiwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSBcImxcIiwgc2VsZWN0ZWRUZXh0OiBcImFcXG4xXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgaXQgXCJbdmlzdWFsOiBhdC1ibGFuay1yb3ddIG1vdmUgdG8gbmV4dC1saW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlIFwidlwiLCBzZWxlY3RlZFRleHQ6IFwiXFxuXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgXCJsXCIsIHNlbGVjdGVkVGV4dDogXCJcXG40XCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbNCwgMV1cblxuICAgIGRlc2NyaWJlIFwibW92ZS0odXAvZG93biktdG8tZWRnZVwiLCAtPlxuICAgICAgdGV4dCA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAwOiAgNCA2NyAgMDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICAxOiAgICAgICAgIDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICAyOiAgICA2IDg5MCAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICAzOiAgICA2IDg5MCAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA0OiAgIDU2IDg5MCAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA1OiAgICAgICAgICAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA2OiAgICAgICAgICAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA3OiAgNCA2NyAgICAgICAgICAgIDAxMjM0NTY3ODlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IHRleHQuZ2V0UmF3KCksIGN1cnNvcjogWzQsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwiZWRnZW5lc3Mgb2YgZmlyc3QtbGluZSBhbmQgbGFzdC1saW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fX190aGlzIGlzIGxpbmUgMFxuICAgICAgICAgICAgX19fX3RoaXMgaXMgdGV4dCBvZiBsaW5lIDFcbiAgICAgICAgICAgIF9fX190aGlzIGlzIHRleHQgb2YgbGluZSAyXG4gICAgICAgICAgICBfX19fX19oZWxsbyBsaW5lIDNcbiAgICAgICAgICAgIF9fX19fX2hlbGxvIGxpbmUgNFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAyXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBjb2x1bW4gaXMgbGVhZGluZyBzcGFjZXNcIiwgLT5cbiAgICAgICAgICBpdCBcIm1vdmUgY3Vyc29yIGlmIGl0J3Mgc3RvcHBhYmxlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNCwgMl1cblxuICAgICAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvciBpZiBpdCdzIE5PVCBzdG9wcGFibGVcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIF9fXG4gICAgICAgICAgICAgIF9fX190aGlzIGlzIHRleHQgb2YgbGluZSAxXG4gICAgICAgICAgICAgIF9fX190aGlzIGlzIHRleHQgb2YgbGluZSAyXG4gICAgICAgICAgICAgIF9fX19fX2hlbGxvIGxpbmUgM1xuICAgICAgICAgICAgICBfX19fX19oZWxsbyBsaW5lIDRcbiAgICAgICAgICAgICAgX19cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgMl1cblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY29sdW1uIGlzIHRyYWlsaW5nIHNwYWNlc1wiLCAtPlxuICAgICAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCAyMF1cbiAgICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzEsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMSwgMjBdXG5cbiAgICAgIGl0IFwibW92ZSB0byBub24tYmxhbmstY2hhciBvbiBib3RoIGZpcnN0IGFuZCBsYXN0IHJvd1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNF1cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgNF1cbiAgICAgIGl0IFwibW92ZSB0byB3aGl0ZSBzcGFjZSBjaGFyIHdoZW4gYm90aCBzaWRlIGNvbHVtbiBpcyBub24tYmxhbmsgY2hhclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNV1cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNCwgNV1cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgNV1cbiAgICAgIGl0IFwib25seSBzdG9wcyBvbiByb3cgb25lIG9mIFtmaXJzdCByb3csIGxhc3Qgcm93LCB1cC1vci1kb3duLXJvdyBpcyBibGFua10gY2FzZS0xXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA2XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsyLCA2XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCA2XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs0LCA2XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA2XVxuICAgICAgaXQgXCJvbmx5IHN0b3BzIG9uIHJvdyBvbmUgb2YgW2ZpcnN0IHJvdywgbGFzdCByb3csIHVwLW9yLWRvd24tcm93IGlzIGJsYW5rXSBjYXNlLTJcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDddXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzIsIDddXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDddXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzQsIDddXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzcsIDddXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDZdXG4gICAgICAgIGVuc3VyZSAnMiBbJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZW5zdXJlICczIF0nLCBjdXJzb3I6IFs3LCA2XVxuXG4gICAgICBkZXNjcmliZSAnZWRpdG9yIGZvciBoYXJkVGFiJywgLT5cbiAgICAgICAgcGFjayA9ICdsYW5ndWFnZS1nbydcbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuZ28nLCAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gc3RhdGVcbiAgICAgICAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1FZGl0b3JcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFs4LCAyXVxuICAgICAgICAgICAgIyBJbiBoYXJkVGFiIGluZGVudCBidWZmZXJQb3NpdGlvbiBpcyBub3Qgc2FtZSBhcyBzY3JlZW5Qb3NpdGlvblxuICAgICAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogWzgsIDFdXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIGl0IFwibW92ZSB1cC9kb3duIHRvIG5leHQgZWRnZSBvZiBzYW1lICpzY3JlZW4qIGNvbHVtblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzUsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMywgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzAsIDJdXG5cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzMsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbNSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFs5LCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzExLCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzE0LCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzE3LCAyXVxuXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMTQsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMTEsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbOSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFs1LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzMsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFswLCAyXVxuXG4gIGRlc2NyaWJlICdtb3ZlU3VjY2Vzc09uTGluZXdpc2UgYmVoYXZpcmFsIGNoYXJhY3RlcmlzdGljJywgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAwMFxuICAgICAgICAgIDExMVxuICAgICAgICAgIDIyMlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgb3JpZ2luYWxUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlU3VjY2Vzc09uTGluZXdpc2U9ZmFsc2UgbW90aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG1vdmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgalwiLCAtPiBlbnN1cmUgXCJkIGpcIiwgdGV4dDogXCIwMDBcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGpcIiwgLT4gICBlbnN1cmUgXCJ5IGpcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBqXCIsIC0+IGVuc3VyZSBcImMgalwiLCB0ZXh0QzogXCIwMDBcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIxMTFcXG4yMjJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgaXQgXCJkZWxldGUgYnkga1wiLCAtPiBlbnN1cmUgXCJkIGtcIiwgdGV4dDogXCIyMjJcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGtcIiwgLT4gICBlbnN1cmUgXCJ5IGtcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBrXCIsIC0+IGVuc3VyZSBcImMga1wiLCB0ZXh0QzogXCJ8XFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG4xMTFcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtdXBcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZGtcIiwgLT4gZW5zdXJlIFwiZCBrXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IHlrXCIsIC0+ICAgZW5zdXJlIFwieSBrXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBja1wiLCAtPiBlbnN1cmUgXCJjIGtcIiwgdGV4dEM6IFwifDAwMFxcbjExMVxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH0sIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtZG93blwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBkalwiLCAtPiBlbnN1cmUgXCJkIGpcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgeWpcIiwgLT4gICBlbnN1cmUgXCJ5IGpcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGNqXCIsIC0+IGVuc3VyZSBcImMgalwiLCB0ZXh0QzogXCIwMDBcXG4xMTFcXG58MjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfSwgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwibW92ZVN1Y2Nlc3NPbkxpbmV3aXNlPXRydWUgbW90aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG1vdmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgR1wiLCAtPiBlbnN1cmUgXCJkIEdcIiwgdGV4dDogXCIwMDBcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IEdcIiwgLT4gICBlbnN1cmUgXCJ5IEdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBHXCIsIC0+IGVuc3VyZSBcImMgR1wiLCB0ZXh0QzogXCIwMDBcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIxMTFcXG4yMjJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiZCBnIGdcIiwgdGV4dDogXCIyMjJcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGdnXCIsIC0+ICAgZW5zdXJlIFwieSBnIGdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBnZ1wiLCAtPiBlbnN1cmUgXCJjIGcgZ1wiLCB0ZXh0QzogXCJ8XFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG4xMTFcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtdXBcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiZCBnIGdcIiwgdGV4dDogXCIxMTFcXG4yMjJcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGdnXCIsIC0+ICAgZW5zdXJlIFwieSBnIGdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBnZ1wiLCAtPiBlbnN1cmUgXCJjIGcgZ1wiLCB0ZXh0QzogXCJ8XFxuMTExXFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLWRvd25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgR1wiLCAtPiAgZW5zdXJlIFwiZCBHXCIsIHRleHQ6IFwiMDAwXFxuMTExXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBHXCIsIC0+ICAgIGVuc3VyZSBcInkgR1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIyMjJcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IEdcIiwgLT4gIGVuc3VyZSBcImMgR1wiLCB0ZXh0QzogXCIwMDBcXG4xMTFcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIyMjJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgdyBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICB0ZXh0QzogXCJ8YWIgY2RlMSstXFxuIHh5elxcblxcbnppcFwiXG4gICAgICAgIGVuc3VyZSBcIndcIiwgdGV4dEM6IFwiYWIgfGNkZTErLVxcbiB4eXpcXG5cXG56aXBcIlxuICAgICAgICBlbnN1cmUgXCJ3XCIsIHRleHRDOiBcImFiIGNkZTF8Ky1cXG4geHl6XFxuXFxuemlwXCJcbiAgICAgICAgZW5zdXJlIFwid1wiLCB0ZXh0QzogXCJhYiBjZGUxKy1cXG4gfHh5elxcblxcbnppcFwiXG4gICAgICAgIGVuc3VyZSBcIndcIiwgdGV4dEM6IFwiYWIgY2RlMSstXFxuIHh5elxcbnxcXG56aXBcIlxuICAgICAgICBlbnN1cmUgXCJ3XCIsIHRleHRDOiBcImFiIGNkZTErLVxcbiB4eXpcXG5cXG58emlwXCJcbiAgICAgICAgZW5zdXJlIFwid1wiLCB0ZXh0QzogXCJhYiBjZGUxKy1cXG4geHl6XFxuXFxueml8cFwiXG4gICAgICAgIGVuc3VyZSBcIndcIiwgdGV4dEM6IFwiYWIgY2RlMSstXFxuIHh5elxcblxcbnppfHBcIiAjIERvIG5vdGhpbmcgYXQgdmltRU9GXG5cbiAgICAgIGl0IFwiW0NSTEZdIG1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIHRleHRDOiBcInxhYiBjZGUxKy1cXHJcXG4geHl6XFxyXFxuXFxyXFxuemlwXCJcbiAgICAgICAgZW5zdXJlIFwid1wiLCB0ZXh0QzogXCJhYiB8Y2RlMSstXFxyXFxuIHh5elxcclxcblxcclxcbnppcFwiXG4gICAgICAgIGVuc3VyZSBcIndcIiwgdGV4dEM6IFwiYWIgY2RlMXwrLVxcclxcbiB4eXpcXHJcXG5cXHJcXG56aXBcIlxuICAgICAgICBlbnN1cmUgXCJ3XCIsIHRleHRDOiBcImFiIGNkZTErLVxcclxcbiB8eHl6XFxyXFxuXFxyXFxuemlwXCJcbiAgICAgICAgZW5zdXJlIFwid1wiLCB0ZXh0QzogXCJhYiBjZGUxKy1cXHJcXG4geHl6XFxyXFxufFxcclxcbnppcFwiXG4gICAgICAgIGVuc3VyZSBcIndcIiwgdGV4dEM6IFwiYWIgY2RlMSstXFxyXFxuIHh5elxcclxcblxcclxcbnx6aXBcIlxuICAgICAgICBlbnN1cmUgXCJ3XCIsIHRleHRDOiBcImFiIGNkZTErLVxcclxcbiB4eXpcXHJcXG5cXHJcXG56aXxwXCJcbiAgICAgICAgZW5zdXJlIFwid1wiLCB0ZXh0QzogXCJhYiBjZGUxKy1cXHJcXG4geHl6XFxyXFxuXFxyXFxueml8cFwiICMgRG8gbm90aGluZyBhdCB2aW1FT0ZcblxuICAgICAgaXQgXCJtb3ZlIHRvIG5leHQgd29yZCBieSBza2lwcGluZyB0cmFpbGluZyB3aGl0ZSBzcGFjZXNcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgdGV4dEM6IFwiMDEyfCAgIFxcbiAgMjM0XCJcbiAgICAgICAgZW5zdXJlIFwid1wiLCB0ZXh0QzogXCIwMTIgICBcXG4gIHwyMzRcIlxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCB3b3JkIGZyb20gRU9MXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIHRleHRDOiBcInxcXG4gIDIzNFwiXG4gICAgICAgIGVuc3VyZSBcIndcIiwgdGV4dEM6IFwiXFxuICB8MjM0XCJcblxuICAgIGRlc2NyaWJlIFwidXNlZCBhcyBjaGFuZ2UgVEFSR0VUXCIsIC0+XG4gICAgICBpdCBcIlthdC13b3JkXSBub3QgZWF0IHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJ2fGFyMSA9IDFcIlxuICAgICAgICBlbnN1cmUgJ2MgdycsIHRleHRDOiBcInYgPSAxXCJcblxuICAgICAgaXQgXCJbYXQgd2hpdGUtc3BhY2VdIG9ubHkgZWF0IHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwifCAgdmFyMSA9IDFcIlxuICAgICAgICBlbnN1cmUgJ2MgdycsIHRleHRDOiBcInZhcjEgPSAxXCJcblxuICAgICAgaXQgXCJbYXQgdHJhaWxpbmcgd2hpdGVzcGFjZV0gZG9lc250IGVhdCBuZXcgbGluZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJhYmN8ICBcXG5kZWZcIlxuICAgICAgICBlbnN1cmUgJ2MgdycsIHRleHRDOiBcImFiY3xcXG5kZWZcIlxuXG4gICAgICB4aXQgXCJbYXQgdHJhaWxpbmcgd2hpdGVzcGFjZV0gZWF0IG5ldyBsaW5lIHdoZW4gY291bnQgaXMgc3BlY2lmaWVkXCIsIC0+ICMgVE9ETyByZS1lbmFibGUgYWZ0ZXIgYXRvbS9hdG9tIzE2OTgzIGNvbWVzIGluIHRvIFNUQUJMRVxuICAgICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwifFxcblxcblxcblxcblxcbmxpbmU2XFxuXCJcbiAgICAgICAgZW5zdXJlICc1IGMgdycsIHRleHRDOiBcInxcXG5saW5lNlxcblwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcIlt3aXRoaW4td29yZF0gc2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8YWIgY2RcIlxuICAgICAgICBlbnN1cmUgJ3kgdycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWIgJ1xuXG4gICAgICBpdCBcIltiZXR3ZWVuLXdvcmRdIHNlbGVjdHMgdGhlIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcImFifCBjZFwiXG4gICAgICAgIGVuc3VyZSAneSB3JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgJ1xuXG4gIGRlc2NyaWJlIFwidGhlIFcga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgdGV4dEM6IFwifGNkZTErLSBhYiBcXG4geHl6XFxuXFxuemlwXCJcbiAgICAgICAgZW5zdXJlIFwiV1wiLCB0ZXh0QzogXCJjZGUxKy0gfGFiIFxcbiB4eXpcXG5cXG56aXBcIlxuICAgICAgICBlbnN1cmUgXCJXXCIsIHRleHRDOiBcImNkZTErLSBhYiBcXG4gfHh5elxcblxcbnppcFwiXG4gICAgICAgIGVuc3VyZSBcIldcIiwgdGV4dEM6IFwiY2RlMSstIGFiIFxcbiB4eXpcXG58XFxuemlwXCJcbiAgICAgICAgZW5zdXJlIFwiV1wiLCB0ZXh0QzogXCJjZGUxKy0gYWIgXFxuIHh5elxcblxcbnx6aXBcIlxuICAgICAgICBlbnN1cmUgXCJXXCIsIHRleHRDOiBcImNkZTErLSBhYiBcXG4geHl6XFxuXFxueml8cFwiXG4gICAgICAgIGVuc3VyZSBcIldcIiwgdGV4dEM6IFwiY2RlMSstIGFiIFxcbiB4eXpcXG5cXG56aXxwXCIgIyBEbyBub3RoaW5nIGF0IHZpbUVPRlxuXG4gICAgICBpdCBcIlthdC10cmFpbGluZy1XU10gbW92ZXMgdGhlIGN1cnNvciB0byBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZCBhdCBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgdGV4dEM6IFwiMDEyfCAgIFxcbiAgMjM0XCJcbiAgICAgICAgZW5zdXJlICdXJywgdGV4dEM6IFwiMDEyICAgXFxuICB8MjM0XCJcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkIG9mIG5leHQgbGluZSB3aGVuIGN1cnNvciBpcyBhdCBFT0wuXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIHRleHRDOiBcInxcXG4gIDIzNFwiXG4gICAgICAgIGVuc3VyZSAnVycsIHRleHRDOiBcIlxcbiAgfDIzNFwiXG5cbiAgICAjIFRoaXMgc3BlYyBpcyByZWR1bmRhbnQgc2luY2UgVyhNb3ZlVG9OZXh0V2hvbGVXb3JkKSBpcyBjaGlsZCBvZiB3KE1vdmVUb05leHRXb3JkKS5cbiAgICBkZXNjcmliZSBcInVzZWQgYXMgY2hhbmdlIFRBUkdFVFwiLCAtPlxuICAgICAgaXQgXCJbYXQtd29yZF0gbm90IGVhdCB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwidnxhcjEgPSAxXCJcbiAgICAgICAgZW5zdXJlICdjIFcnLCB0ZXh0QzogXCJ2fCA9IDFcIlxuXG4gICAgICBpdCBcIlthdC1XU10gb25seSBlYXQgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJ8ICB2YXIxID0gMVwiXG4gICAgICAgIGVuc3VyZSAnYyBXJywgdGV4dEM6IFwidmFyMSA9IDFcIlxuXG4gICAgICBpdCBcIlthdC10cmFpbGluZy1XU10gZG9lc24ndCBlYXQgbmV3IGxpbmUgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwiYWJjfCAgXFxuZGVmXFxuXCJcbiAgICAgICAgZW5zdXJlICdjIFcnLCB0ZXh0QzogXCJhYmN8XFxuZGVmXFxuXCJcblxuICAgICAgeGl0IFwiY2FuIGVhdCBuZXcgbGluZSB3aGVuIGNvdW50IGlzIHNwZWNpZmllZFwiLCAtPiAgIyBUT0RPIHJlLWVuYWJsZSBhZnRlciBhdG9tL2F0b20jMTY5ODMgY29tZXMgaW4gdG8gU1RBQkxFXG4gICAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJ8XFxuXFxuXFxuXFxuXFxubGluZTZcXG5cIlxuICAgICAgICBlbnN1cmUgJzUgYyBXJywgdGV4dEM6IFwifFxcbmxpbmU2XFxuXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBUQVJHRVRcIiwgLT5cbiAgICAgIGl0IFwiW2F0LXdvcmRdIHlhbmtcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxjZGUxKy0gYWJcIlxuICAgICAgICBlbnN1cmUgJ3kgVycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnY2RlMSstICdcblxuICAgICAgaXQgXCJkZWxldGUgbmV3IGxpbmVcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJjZGUxKy0gYWIgXFxuIHh5elxcbnxcXG56aXBcIlxuICAgICAgICBlbnN1cmUgJ2QgVycsIHRleHRDOiBcImNkZTErLSBhYiBcXG4geHl6XFxufHppcFwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiXFxuXCJ9XG5cbiAgICAgIGl0IFwiZGVsZXRlIGxhc3Qgd29yZCBpbiBidWZmZXIgYW5kIGFkanV0IGN1cnNvciByb3cgdG8gbm90IHBhc3QgdmltTGFzdFJvd1wiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgIHRleHRDOiBcImNkZTErLSBhYiBcXG4geHl6XFxuXFxufHppcFwiXG4gICAgICAgIGVuc3VyZSAnZCBXJywgdGV4dEM6IFwiY2RlMSstIGFiIFxcbiB4eXpcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJ6aXBcIn1cblxuICBkZXNjcmliZSBcInRoZSBlIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIHRleHRDXzogXCJ8YWIgY2RlMSstX1xcbl94eXpcXG5cXG56aXBcIlxuICAgICAgICBlbnN1cmUgJ2UnLCB0ZXh0Q186IFwiYXxiIGNkZTErLV9cXG5feHl6XFxuXFxuemlwXCJcbiAgICAgICAgZW5zdXJlICdlJywgdGV4dENfOiBcImFiIGNkZXwxKy1fXFxuX3h5elxcblxcbnppcFwiXG4gICAgICAgIGVuc3VyZSAnZScsIHRleHRDXzogXCJhYiBjZGUxK3wtX1xcbl94eXpcXG5cXG56aXBcIlxuICAgICAgICBlbnN1cmUgJ2UnLCB0ZXh0Q186IFwiYWIgY2RlMSstX1xcbl94eXx6XFxuXFxuemlwXCJcbiAgICAgICAgZW5zdXJlICdlJywgdGV4dENfOiBcImFiIGNkZTErLV9cXG5feHl6XFxuXFxueml8cFwiXG5cbiAgICAgIGl0IFwic2tpcHMgd2hpdGVzcGFjZSB1bnRpbCBFT0ZcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgdGV4dEM6IFwifDAxMlxcblxcblxcbjAxMlxcblxcblwiXG4gICAgICAgIGVuc3VyZSAnZScsIHRleHRDOiBcIjAxfDJcXG5cXG5cXG4wMTJcXG5cXG5cIlxuICAgICAgICBlbnN1cmUgJ2UnLCB0ZXh0QzogXCIwMTJcXG5cXG5cXG4wMXwyXFxuXFxuXCJcbiAgICAgICAgZW5zdXJlICdlJywgdGV4dEM6IFwiMDEyXFxuXFxuXFxuMDEyXFxufFxcblwiXG5cbiAgICBkZXNjcmliZSBcImFzIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJbaW4td29yZF0gc2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDXzogXCJ8YWIgY2RlMSstX1wiXG4gICAgICAgIGVuc3VyZSAneSBlJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYidcblxuICAgICAgaXQgXCJbYmV0d2Vlbi13b3JkXSBzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dENfOiBcImFifCBjZGUxKy1fXCJcbiAgICAgICAgZW5zdXJlICd5IGUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJyBjZGUxJ1xuXG4gIGRlc2NyaWJlIFwidGhlIEUga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBhYiAgY2RlMSstX1xuICAgICAgX3h5el9cblxuICAgICAgemlwXFxuXG4gICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMywgMl1cblxuICAgIGRlc2NyaWJlIFwiYXMgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSBFJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYidcblxuICAgICAgZGVzY3JpYmUgXCJiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgRScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnICBjZGUxKy0nXG5cbiAgICAgIGRlc2NyaWJlIFwicHJlc3MgbW9yZSB0aGFuIG9uY2VcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAndiBFIEUgeScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWIgIGNkZTErLSdcblxuICBkZXNjcmliZSBcInRoZSBnZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCIxMjM0IDU2Nzggd29yZHdvfHJkXCJcbiAgICAgICAgZW5zdXJlIFwiZyBlXCIsIHRleHRDOiBcIjEyMzQgNTY3fDggd29yZHdvcmRcIlxuICAgICAgICBlbnN1cmUgXCJnIGVcIiwgdGV4dEM6IFwiMTIzfDQgNTY3OCB3b3Jkd29yZFwiXG4gICAgICAgIGVuc3VyZSBcImcgZVwiLCB0ZXh0QzogXCJ8MTIzNCA1Njc4IHdvcmR3b3JkXCJcbiAgICAgICAgZW5zdXJlIFwiZyBlXCIsIHRleHRDOiBcInwxMjM0IDU2Nzggd29yZHdvcmRcIlxuXG4gICAgICBpdCBcIm1vdmVzIGNvcnJlbnRseSB3aGVuIHN0YXJ0aW5nIGJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCIxIGxlYWRpbmcgICB8ICBlbmRcIlxuICAgICAgICBlbnN1cmUgJ2cgZScsIHRleHRDOiBcIjEgbGVhZGlufGcgICAgIGVuZFwiXG5cbiAgICAgIGl0IFwidGFrZXMgYSBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwidmltIG1vZGUgcGx1cyBpcyBnZXR0aW5nIHRoZXxyZVwiXG4gICAgICAgIGVuc3VyZSAnNSBnIGUnLCB0ZXh0QzogXCJ2aXxtIG1vZGUgcGx1cyBpcyBnZXR0aW5nIHRoZXJlXCJcblxuICAgICAgaXQgXCJoYW5kbGVzIG5vbi13b3JkcyBpbnNpZGUgd29yZHMgbGlrZSB2aW1cIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCIxMjM0IDU2Nzggd29yZC13b3J8ZFwiXG4gICAgICAgIGVuc3VyZSAnZyBlJywgdGV4dEM6IFwiMTIzNCA1Njc4IHdvcmR8LXdvcmRcIlxuICAgICAgICBlbnN1cmUgJ2cgZScsIHRleHRDOiBcIjEyMzQgNTY3OCB3b3J8ZC13b3JkXCJcbiAgICAgICAgZW5zdXJlICdnIGUnLCB0ZXh0QzogXCIxMjM0IDU2N3w4IHdvcmQtd29yZFwiXG5cbiAgICAgIHhpdCBcImhhbmRsZXMgbmV3bGluZXMgbGlrZSB2aW1cIiwgLT4gIyBUT0RPIHJlLWVuYWJsZSBhZnRlciBhdG9tL2F0b20jMTY5ODMgY29tZXMgaW4gdG8gU1RBQkxFXG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwiMTIzNFxcblxcblxcblxcbjU2fDc4XCJcbiAgICAgICAgZW5zdXJlIFwiZyBlXCIsIHRleHRDOiBcIjEyMzRcXG5cXG5cXG58XFxuNTY3OFwiXG4gICAgICAgIGVuc3VyZSBcImcgZVwiLCB0ZXh0QzogXCIxMjM0XFxuXFxufFxcblxcbjU2NzhcIlxuICAgICAgICBlbnN1cmUgXCJnIGVcIiwgdGV4dEM6IFwiMTIzNFxcbnxcXG5cXG5cXG41Njc4XCJcbiAgICAgICAgZW5zdXJlIFwiZyBlXCIsIHRleHRDOiBcIjEyM3w0XFxuXFxuXFxuXFxuNTY3OFwiXG4gICAgICAgIGVuc3VyZSBcImcgZVwiLCB0ZXh0QzogXCJ8MTIzNFxcblxcblxcblxcbjU2NzhcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZWQgYnkgQ2hhbmdlIG9wZXJhdG9yXCIsIC0+XG4gICAgICBpdCBcImNoYW5nZXMgd29yZCBmcmFnbWVudHNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiY2V0IGRvY3VtZW50XCIsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnYyBnIGUnLCBjdXJzb3I6IFswLCAyXSwgdGV4dDogXCJjZW1lbnRcIiwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgIyBUT0RPOiBJJ20gbm90IHN1cmUgaG93IHRvIGNoZWNrIHRoZSByZWdpc3RlciBhZnRlciBjaGVja2luZyB0aGUgZG9jdW1lbnRcbiAgICAgICAgIyBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICdcIicsIHRleHQ6ICd0IGRvY3UnXG5cbiAgICAgIGl0IFwiY2hhbmdlcyB3aGl0ZXNwYWNlIHByb3Blcmx5XCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImNlICAgIGRvY1wiLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ2MgZyBlJywgY3Vyc29yOiBbMCwgMV0sIHRleHQ6IFwiYyBkb2NcIiwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwiaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHdvcmQgZnJhZ21lbnRzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImNldCBkb2N1bWVudFwiLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ3YgZyBlJywgY3Vyc29yOiBbMCwgMl0sIHNlbGVjdGVkVGV4dDogXCJ0IGRvY3VcIlxuXG4gIGRlc2NyaWJlIFwidGhlIGdFIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgcHJldmlvdXMgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiMTIuNCA1fjctIHdvcmQtd3xvcmRcIlxuICAgICAgICBlbnN1cmUgJ2cgRScsIHRleHRDOiBcIjEyLjQgNX43fC0gd29yZC13b3JkXCJcbiAgICAgICAgZW5zdXJlICdnIEUnLCB0ZXh0QzogXCIxMi58NCA1fjctIHdvcmQtd29yZFwiXG4gICAgICAgIGVuc3VyZSAnZyBFJywgdGV4dEM6IFwifDEyLjQgNX43LSB3b3JkLXdvcmRcIlxuICAgICAgICBlbnN1cmUgJ2cgRScsIHRleHRDOiBcInwxMi40IDV+Ny0gd29yZC13b3JkXCJcblxuICBkZXNjcmliZSBcInRoZSAoLCkgc2VudGVuY2Uga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBzZW50ZW5jZSBvbmUuXSknXCIgICAgc2VuLnRlbmNlIC50d28uXG4gICAgICAgICAgaGVyZS4gIHNlbnRlbmNlIHRocmVlXG4gICAgICAgICAgbW9yZSB0aHJlZVxuXG4gICAgICAgICAgICAgc2VudGVuY2UgZm91clxuXG5cbiAgICAgICAgICBzZW50ZW5jZSBmaXZlLlxuICAgICAgICAgIG1vcmUgZml2ZVxuICAgICAgICAgIG1vcmUgc2l4XG5cbiAgICAgICAgICAgbGFzdCBzZW50ZW5jZVxuICAgICAgICAgIGFsbCBkb25lIHNldmVuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBzZW50ZW5jZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFswLCAyMV1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNSwgMF0gIyBib3VuZGFyeSBpcyBkaWZmZXJlbnQgYnkgZGlyZWN0aW9uXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEwLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMSwgMV1cblxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMiwgMTNdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEyLCAxM11cblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxMSwgMV1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMTAsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzYsIDBdICMgYm91bmRhcnkgaXMgZGlmZmVyZW50IGJ5IGRpcmVjdGlvblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAyMV1cblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInNraXBzIHRvIGJlZ2lubmluZyBvZiBzZW50ZW5jZVwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFs0LCAxNV1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbNCwgM11cblxuICAgICAgaXQgXCJzdXBwb3J0cyBhIGNvdW50XCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczICknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJzMgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY2FuIG1vdmUgc3RhcnQgb2YgYnVmZmVyIG9yIGVuZCBvZiBidWZmZXIgYXQgbWF4aW11bVwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcyIDAgKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgZW5zdXJlICcyIDAgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwic2VudGVuY2UgbW90aW9uIHdpdGggc2tpcC1ibGFuay1yb3dcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICAgJ2cgKSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1zZW50ZW5jZS1za2lwLWJsYW5rLXJvdydcbiAgICAgICAgICAgICAgJ2cgKCc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc2VudGVuY2Utc2tpcC1ibGFuay1yb3cnXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFswLCAyMV1cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMTEsIDFdXG5cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEyLCAxM11cblxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMTEsIDFdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzQsIDNdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzAsIDIxXVxuXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwibW92aW5nIGluc2lkZSBhIGJsYW5rIGRvY3VtZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX19fX1xuICAgICAgICAgIF9fX19fXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZXMgd2l0aG91dCBjcmFzaGluZ1wiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJzZW50ZW5jZSBvbmUuIHNlbnRlbmNlIHR3by5cXG4gIHNlbnRlbmNlIHRocmVlLlwiXG5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgc2VudGVuY2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAneSApJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiY2UgdHdvLlxcbiAgXCJcblxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY3VycmVudCBzZW50ZW5jZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICd5ICgnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJzZW50ZW5cIlxuXG4gIGRlc2NyaWJlIFwidGhlIHssfSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuXG5cblxuICAgICAgICAzOiBwYXJhZ3JhcGgtMVxuICAgICAgICA0OiBwYXJhZ3JhcGgtMVxuXG5cblxuICAgICAgICA4OiBwYXJhZ3JhcGgtMlxuXG5cblxuICAgICAgICAxMjogcGFyYWdyYXBoLTNcbiAgICAgICAgMTM6IHBhcmFncmFwaC0zXG5cblxuICAgICAgICAxNjogcGFyYWdwcmFoLTRcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzUsIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzksIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzE0LCAwXVxuICAgICAgICBlbnN1cmUgJ3snLCBjdXJzb3I6IFsxMSwgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczIH0nLCBjdXJzb3I6IFsxNCwgMF1cbiAgICAgICAgZW5zdXJlICczIHsnLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImNhbiBtb3ZlIHN0YXJ0IG9mIGJ1ZmZlciBvciBlbmQgb2YgYnVmZmVyIGF0IG1heGltdW1cIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMSAwIH0nLCBjdXJzb3I6IFsxNiwgMTRdXG4gICAgICAgIGVuc3VyZSAnMSAwIHsnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCBwYXJhZ3JhcGgnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlICd5IH0nLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJwYXJhZ3JhcGgtMVxcbjQ6IHBhcmFncmFwaC0xXFxuXCJcbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgcGFyYWdyYXBoJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdXG4gICAgICAgIGVuc3VyZSAneSB7JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiXFxuMzogcGFyYWdyYXBoLTFcXG40OiBcIlxuXG4gIGRlc2NyaWJlIFwiTW92ZVRvTmV4dERpZmZIdW5rLCBNb3ZlVG9QcmV2aW91c0RpZmZIdW5rXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAtLS0gZmlsZSAgICAgICAgMjAxNy0xMi0yNCAxNToxMTozMy4wMDAwMDAwMDAgKzA5MDBcbiAgICAgICAgKysrIGZpbGUtbmV3ICAgIDIwMTctMTItMjQgMTU6MTU6MDkuMDAwMDAwMDAwICswOTAwXG4gICAgICAgIEBAIC0xLDkgKzEsOSBAQFxuICAgICAgICAgbGluZSAwXG4gICAgICAgICtsaW5lIDAtMVxuICAgICAgICAgbGluZSAxXG4gICAgICAgIC1saW5lIDJcbiAgICAgICAgK2xpbmUgMS0xXG4gICAgICAgICBsaW5lIDNcbiAgICAgICAgLWxpbmUgNFxuICAgICAgICAgbGluZSA1XG4gICAgICAgIC1saW5lIDZcbiAgICAgICAgLWxpbmUgN1xuICAgICAgICArbGluZSA3LTFcbiAgICAgICAgK2xpbmUgNy0yXG4gICAgICAgICBsaW5lIDhcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICddJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWRpZmYtaHVuaydcbiAgICAgICAgICAgICdbJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1kaWZmLWh1bmsnXG5cbiAgICBpdCBcIm1vdmUgdG8gbmV4dCBhbmQgcHJldmlvdXMgaHVua1wiLCAtPlxuICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzQsIDBdXG4gICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs2LCAwXVxuICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgMF1cbiAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzksIDBdXG4gICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsxMSwgMF1cbiAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzEzLCAwXVxuICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMTMsIDBdXG5cbiAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzExLCAwXVxuICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbOSwgMF1cbiAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzcsIDBdXG4gICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFs2LCAwXVxuICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbNCwgMF1cbiAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzEsIDBdXG4gICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSBiIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX2FiIGNkZTErLV9cbiAgICAgICAgX3h5elxuXG4gICAgICAgIHppcCB9XG4gICAgICAgIF98bGFzdFxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiBhYiBjZGUxKy0gXFxuIHh5elxcblxcbnppcCB8fVxcbiBsYXN0XCJcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIGFiIGNkZTErLSBcXG4geHl6XFxuXFxufHppcCB9XFxuIGxhc3RcIlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgYWIgY2RlMSstIFxcbiB4eXpcXG58XFxuemlwIH1cXG4gbGFzdFwiXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiBhYiBjZGUxKy0gXFxuIHx4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIGFiIGNkZTF8Ky0gXFxuIHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgYWIgfGNkZTErLSBcXG4geHl6XFxuXFxuemlwIH1cXG4gbGFzdFwiXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiB8YWIgY2RlMSstIFxcbiB4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcblxuICAgICAgICAjIEdvIHRvIHN0YXJ0IG9mIHRoZSBmaWxlLCBhZnRlciBtb3ZpbmcgcGFzdCB0aGUgZmlyc3Qgd29yZFxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCJ8IGFiIGNkZTErLSBcXG4geHl6XFxuXFxuemlwIH1cXG4gbGFzdFwiXG4gICAgICAgICMgRG8gbm90aGluZ1xuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCJ8IGFiIGNkZTErLSBcXG4geHl6XFxuXFxuemlwIH1cXG4gbGFzdFwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgYXxiIGNkXCI7IGVuc3VyZSAneSBiJywgdGV4dEM6IFwiIHxhYiBjZFwiLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2EnXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGFzdCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIiBhYiB8Y2RcIjsgZW5zdXJlICd5IGInLCB0ZXh0QzogXCIgfGFiIGNkXCIsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWIgJ1xuXG4gIGRlc2NyaWJlIFwidGhlIEIga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBjZGUxKy0gYWJcbiAgICAgICAgICBcXHQgeHl6LTEyM1xuXG4gICAgICAgICAgIHppcFxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdCJywgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlICdCJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdCJywgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICdCJywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICdCJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSB3aG9sZSB3b3JkXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA4XVxuICAgICAgICBlbnN1cmUgJ3kgQicsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAneHl6LTEyJyAjIGJlY2F1c2UgY3Vyc29yIGlzIG9uIHRoZSBgM2BcblxuICAgICAgaXQgXCJkb2Vzbid0IGdvIHBhc3QgdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmUgJ3kgQicsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWJjJ1xuXG4gIGRlc2NyaWJlIFwidGhlIF4ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8ICBhYmNkZVwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIF4nLCB0ZXh0OiAnYWJjZGUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgSScsIHRleHQ6ICdhYmNkZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcInN0YXlzIHB1dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgXicsXG4gICAgICAgICAgICB0ZXh0OiAnICBhYmNkZSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIHdvcmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ14nLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICcgIGNkZSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBJJywgdGV4dDogJyAgY2RlJywgY3Vyc29yOiBbMCwgMl0sXG5cbiAgZGVzY3JpYmUgXCJ0aGUgMCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRDOiBcIiAgYWJ8Y2RlXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY29sdW1uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZmlyc3QgY29sdW1uIG9mIHRoZSBsaW5lJywgLT5cbiAgICAgICAgZW5zdXJlICdkIDAnLCB0ZXh0OiAnY2RlJywgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcImcgMCwgZyBeIGFuZCBnICRcIiwgLT5cbiAgICBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSA9IC0+XG4gICAgICBlZGl0b3Iuc2V0U29mdFdyYXBwZWQodHJ1ZSlcbiAgICAgIGV4cGVjdChlZGl0b3IubGluZVRleHRGb3JTY3JlZW5Sb3coMCkpLnRvQmUoXCIgMTIzNDU2N1wiKVxuICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdygxKSkudG9CZShcIiA4OUIxMjM0XCIpICMgZmlyc3Qgc3BhY2UgaXMgc29mdHdyYXAgaW5kZW50YXRpb25cbiAgICAgIGV4cGVjdChlZGl0b3IubGluZVRleHRGb3JTY3JlZW5Sb3coMikpLnRvQmUoXCIgNTY3ODlDMVwiKSAjIGZpcnN0IHNwYWNlIGlzIHNvZnR3cmFwIGluZGVudGF0aW9uXG4gICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KDMpKS50b0JlKFwiIDIzNDU2NzhcIikgIyBmaXJzdCBzcGFjZSBpcyBzb2Z0d3JhcCBpbmRlbnRhdGlvblxuICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdyg0KSkudG9CZShcIiA5XCIpICMgZmlyc3Qgc3BhY2UgaXMgc29mdHdyYXAgaW5kZW50YXRpb25cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICMgRm9yY2Ugc2Nyb2xsYmFycyB0byBiZSB2aXNpYmxlIHJlZ2FyZGxlc3Mgb2YgbG9jYWwgc3lzdGVtIGNvbmZpZ3VyYXRpb25cbiAgICAgIHNjcm9sbGJhclN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgc2Nyb2xsYmFyU3R5bGUudGV4dENvbnRlbnQgPSAnOjotd2Via2l0LXNjcm9sbGJhciB7IC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZSB9J1xuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShzY3JvbGxiYXJTdHlsZSlcblxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgIF8xMjM0NTY3ODlCMTIzNDU2Nzg5QzEyMzQ1Njc4OVxuICAgICAgXCJcIlwiXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHNldEVkaXRvcldpZHRoSW5DaGFyYWN0ZXJzKGVkaXRvciwgMTApXG5cbiAgICBkZXNjcmliZSBcInRoZSBnIDAga2V5YmluZGluZ1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbiA9IHRydWUoZGVmYXVsdClcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgdHJ1ZSlcblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgMFwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgZmlyc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gY29sdW1uIDAgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAwXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlKClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gY29sdW1uIDAgb2Ygc2NyZWVuIGxpbmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFswLCAzXTsgZW5zdXJlIFwiZyAwXCIsIGN1cnNvclNjcmVlbjogWzAsIDBdXG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMSwgM107IGVuc3VyZSBcImcgMFwiLCBjdXJzb3JTY3JlZW46IFsxLCAxXSAjIHNraXAgc29mdHdyYXAgaW5kZW50YXRpb24uXG5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSBmYWxzZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldHRpbmdzLnNldCgnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nLCBmYWxzZSlcblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgMFwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgZmlyc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgdmlzaWJsZSBjb2x1bSBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yOiBbMCwgMTBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlKClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gY29sdW1uIDAgb2Ygc2NyZWVuIGxpbmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFswLCAzXTsgZW5zdXJlIFwiZyAwXCIsIGN1cnNvclNjcmVlbjogWzAsIDBdXG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMSwgM107IGVuc3VyZSBcImcgMFwiLCBjdXJzb3JTY3JlZW46IFsxLCAxXSAjIHNraXAgc29mdHdyYXAgaW5kZW50YXRpb24uXG5cbiAgICBkZXNjcmliZSBcInRoZSBnIF4ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbiA9IHRydWUoZGVmYXVsdClcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgdHJ1ZSlcblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyBeXCIsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IGZhbHNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMTVdOyBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuQ29sdW1uKDEwKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgXlwiLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSgpXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFswLCAzXTsgZW5zdXJlIFwiZyBeXCIsIGN1cnNvclNjcmVlbjogWzAsIDFdXG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMSwgM107IGVuc3VyZSBcImcgXlwiLCBjdXJzb3JTY3JlZW46IFsxLCAxXSAjIHNraXAgc29mdHdyYXAgaW5kZW50YXRpb24uXG5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSBmYWxzZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldHRpbmdzLnNldCgnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nLCBmYWxzZSlcblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyBeXCIsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IGZhbHNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMTVdOyBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuQ29sdW1uKDEwKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgXlwiLCBjdXJzb3I6IFswLCAxMF1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gZW5hYmxlU29mdFdyYXBBbmRFbnN1cmUoKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgXlwiLCBjdXJzb3JTY3JlZW46IFswLCAxXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgZyAkIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBsYXN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAkXCIsIGN1cnNvcjogWzAsIDI5XVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgbGFzdENvbHVtbklzVmlzaWJsZSA9IGZhbHNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMTVdOyBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuQ29sdW1uKDEwKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAkXCIsIGN1cnNvcjogWzAsIDI5XVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSgpXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGxhc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzAsIDNdOyBlbnN1cmUgXCJnICRcIiwgY3Vyc29yU2NyZWVuOiBbMCwgN11cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFsxLCAzXTsgZW5zdXJlIFwiZyAkXCIsIGN1cnNvclNjcmVlbjogWzEsIDddXG5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSBmYWxzZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldHRpbmdzLnNldCgnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nLCBmYWxzZSlcblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGxhc3RDb2x1bW5Jc1Zpc2libGUgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMjddXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGxhc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnICRcIiwgY3Vyc29yOiBbMCwgMjldXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBsYXN0Q29sdW1uSXNWaXNpYmxlID0gZmFsc2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAxNV07IGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Db2x1bW4oMTApXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGxhc3QtY2hhciBpbiB2aXNpYmxlIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgJFwiLCBjdXJzb3I6IFswLCAxOF1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gZW5hYmxlU29mdFdyYXBBbmRFbnN1cmUoKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFswLCAzXTsgZW5zdXJlIFwiZyAkXCIsIGN1cnNvclNjcmVlbjogWzAsIDddXG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMSwgM107IGVuc3VyZSBcImcgJFwiLCBjdXJzb3JTY3JlZW46IFsxLCA3XVxuXG4gIGRlc2NyaWJlIFwidGhlIHwga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIiAgYWJjZGVcIiwgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbnVtYmVyIGNvbHVtblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3wnLCAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMSB8JywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczIHwnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJzQgfCcsIGN1cnNvcjogWzAsIDNdXG5cbiAgICBkZXNjcmliZSBcImFzIG9wZXJhdG9yJ3MgdGFyZ2V0XCIsIC0+XG4gICAgICBpdCAnYmVoYXZlIGV4Y2x1c2l2ZWx5JywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCA0IHwnLCB0ZXh0OiAnYmNkZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgJCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiICBhYmNkZVxcblxcbjEyMzQ1Njc4OTBcIlxuICAgICAgICBjdXJzb3I6IFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvbiBmcm9tIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAjIEZJWE1FOiBTZWUgYXRvbS92aW0tbW9kZSMyXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgICBpdCBcInNldCBnb2FsQ29sdW1uIEluZmluaXR5XCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUobnVsbClcbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcblxuICAgICAgaXQgXCJzaG91bGQgcmVtYWluIGluIHRoZSBsYXN0IGNvbHVtbiB3aGVuIG1vdmluZyBkb3duXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnJCBqJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdqJywgICBjdXJzb3I6IFsyLCA5XVxuXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgZW5zdXJlICczICQnLCBjdXJzb3I6IFsyLCA5XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAkJyxcbiAgICAgICAgICB0ZXh0OiBcIiAgYWJcXG5cXG4xMjM0NTY3ODkwXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gIGRlc2NyaWJlIFwidGhlIC0ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgIGFiY1xuICAgICAgICAgIGFiY1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBsYXN0IGNoYXJhY3RlciBvZiB0aGUgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGFuZCBwcmV2aW91cyBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIC0nLCB0ZXh0OiBcIiAgYWJjXFxuXCIsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhIGxpbmUgaW5kZW50ZWQgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIG9uZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmUgKGRpcmVjdGx5IGFib3ZlKVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmUgKGRpcmVjdGx5IGFib3ZlKVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAtJywgdGV4dDogXCJhYmNkZWZnXFxuXCJcbiAgICAgICAgICAjIEZJWE1FIGNvbW1lbnRlZCBvdXQgYmVjYXVzZSB0aGUgY29sdW1uIGlzIHdyb25nIGR1ZSB0byBhIGJ1ZyBpbiBga2A7IHJlLWVuYWJsZSB3aGVuIGBrYCBpcyBmaXhlZFxuICAgICAgICAgICMgZW5zdXJlIG51bGwsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGJlZ2lubmluZyBvZiBhIGxpbmUgcHJlY2VkZWQgYnkgYW4gaW5kZW50ZWQgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgLScsIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBjb3VudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGF0IG1hbnkgbGluZXMgcHJldmlvdXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgLScsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgcHJldmlvdXMgbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgMyAtJyxcbiAgICAgICAgICAgIHRleHQ6IFwiMVxcbjZcXG5cIixcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdLFxuXG4gIGRlc2NyaWJlIFwidGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBfX2FiY1xuICAgICAgX19hYmNcbiAgICAgIGFiY2RlZmdcXG5cbiAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBhbmQgbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkICsnLCB0ZXh0OiBcIiAgYWJjXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIGEgbGluZSBpbmRlbnRlZCB0aGUgc2FtZSBhcyB0aGUgbmV4dCBvbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmUgKGRpcmVjdGx5IGJlbG93KVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnKycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIG5leHQgbGluZSAoZGlyZWN0bHkgYmVsb3cpXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkICsnLCB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lIGZvbGxvd2VkIGJ5IGFuIGluZGVudGVkIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnKycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJyxcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhhdCBtYW55IGxpbmVzIGZvbGxvd2luZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMyArJywgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZSBwbHVzIHRoYXQgbWFueSBmb2xsb3dpbmcgbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgMyArJyxcbiAgICAgICAgICAgIHRleHQ6IFwiMVxcbjZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBfIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX2FiY1xuICAgICAgICBhYmNkZWZnXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ18nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIF8nLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX19hYmNcbiAgICAgICAgICAgIGFiY2RlZmdcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoYXQgbWFueSBsaW5lcyBmb2xsb3dpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgXycsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgZm9sbG93aW5nIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgXycsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG41XFxuNlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIGVudGVyIGtleWJpbmRpbmdcIiwgLT5cbiAgICAjIFtGSVhNRV0gRGlydHkgdGVzdCwgd2hhdHMgdGhpcyE/XG4gICAgc3RhcnRpbmdUZXh0ID0gXCIgIGFiY1xcbiAgYWJjXFxuYWJjZGVmZ1xcblwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIGxpbmVcIiwgLT5cbiAgICAgIHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb24gPSBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcImFjdHMgdGhlIHNhbWUgYXMgdGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgICMgZG8gaXQgd2l0aCArIGFuZCBzYXZlIHRoZSByZXN1bHRzXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuICAgICAgICAgIGVuc3VyZSAnKydcbiAgICAgICAgICByZWZlcmVuY2VDdXJzb3JQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuICAgICAgICAgIGVuc3VyZSAnZW50ZXInLFxuICAgICAgICAgICAgY3Vyc29yOiByZWZlcmVuY2VDdXJzb3JQb3NpdGlvblxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiYWN0cyB0aGUgc2FtZSBhcyB0aGUgKyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICAgICAgIyBkbyBpdCB3aXRoICsgYW5kIHNhdmUgdGhlIHJlc3VsdHNcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHN0YXJ0aW5nVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiBzdGFydGluZ0N1cnNvclBvc2l0aW9uXG5cbiAgICAgICAgICBlbnN1cmUgJ2QgKydcbiAgICAgICAgICByZWZlcmVuY2VUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgICAgIHJlZmVyZW5jZUN1cnNvclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcblxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBlbnN1cmUgJ2QgZW50ZXInLFxuICAgICAgICAgICAgdGV4dDogcmVmZXJlbmNlVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiByZWZlcmVuY2VDdXJzb3JQb3NpdGlvblxuXG4gIGRlc2NyaWJlIFwidGhlIGdnIGtleWJpbmRpbmcgd2l0aCBzdGF5T25WZXJ0aWNhbE1vdGlvbiA9IGZhbHNlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25WZXJ0aWNhbE1vdGlvbicsIGZhbHNlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAxYWJjXG4gICAgICAgICAgIDJcbiAgICAgICAgICAzXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImluIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBnJywgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBpdCBcIm1vdmUgdG8gc2FtZSBwb3NpdGlvbiBpZiBpdHMgb24gZmlyc3QgbGluZSBhbmQgZmlyc3QgY2hhclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBnJywgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJpbiBsaW5ld2lzZSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGZpcnN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YgZyBnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgMWFiY1xcbiAyXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgbGluZSBpbiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjFhYmNcXG4gMlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGNvdW50IHNwZWNpZmllZFwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJpbiBub3JtYWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gZmlyc3QgY2hhciBvZiBhIHNwZWNpZmllZCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIGcgZycsIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbGluZXdpc2UgdmlzdWFsIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gYSBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAnViAyIGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiIDJcXG4zXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byBhIGZpcnN0IGNoYXJhY3RlciBvZiBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIGVuc3VyZSAndiAyIGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMlxcbjNcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICBkZXNjcmliZSBcInRoZSBnXyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgICAgMV9fXG4gICAgICAgICAgICAyX19cbiAgICAgICAgIDNhYmNcbiAgICAgICAgX1xuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGFzdCBub25ibGFuayBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgXycsIGN1cnNvcjogWzEsIDRdXG5cbiAgICAgIGl0IFwid2lsbCBtb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZSBpZiBuZWNlc3NhcnlcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgXycsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgcmVwZWF0ZWQgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgZG93bndhcmQgYW5kIG91dHdhcmRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMiBnIF8nLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRoZSBjdXJyZW50IGxpbmUgZXhjbHVkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAndiAyIGcgXycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiAgMiAgXFxuIDNhYmNcIlxuXG4gIGRlc2NyaWJlIFwidGhlIEcga2V5YmluZGluZyAoc3RheU9uVmVydGljYWxNb3Rpb24gPSBmYWxzZSlcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblZlcnRpY2FsTW90aW9uJywgZmFsc2UpXG4gICAgICBzZXRcbiAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAxXG4gICAgICAgIF9fX18yXG4gICAgICAgIF8zYWJjXG4gICAgICAgIF9cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGxhc3QgbGluZSBhZnRlciB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnRycsIGN1cnNvcjogWzMsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgcmVwZWF0ZWQgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gYSBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzIgRycsIGN1cnNvcjogWzEsIDRdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGxhc3QgbGluZSBpbiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICd2IEcnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgICAgMlxcbiAzYWJjXFxuIFwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMV1cblxuICBkZXNjcmliZSBcInRoZSBOJSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFswLi45OTldLmpvaW4oXCJcXG5cIilcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwicHV0IGN1cnNvciBvbiBsaW5lIHNwZWNpZmllZCBieSBwZXJjZW50XCIsIC0+XG4gICAgICBpdCBcIjUwJVwiLCAtPiAgZW5zdXJlICc1IDAgJScsICAgY3Vyc29yOiBbNDk5LCAwXVxuICAgICAgaXQgXCIzMCVcIiwgLT4gIGVuc3VyZSAnMyAwICUnLCAgIGN1cnNvcjogWzI5OSwgMF1cbiAgICAgIGl0IFwiMTAwJVwiLCAtPiBlbnN1cmUgJzEgMCAwICUnLCBjdXJzb3I6IFs5OTksIDBdXG4gICAgICBpdCBcIjEyMCVcIiwgLT4gZW5zdXJlICcxIDIgMCAlJywgY3Vyc29yOiBbOTk5LCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIEgsIE0sIEwga2V5YmluZGluZyggc3RheU9uVmVydGljYWxNb3RpbyA9IGZhbHNlIClcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblZlcnRpY2FsTW90aW9uJywgZmFsc2UpXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxXG4gICAgICAgICAgMlxuICAgICAgICAgIDNcbiAgICAgICAgICA0XG4gICAgICAgICAgICA1XG4gICAgICAgICAgNlxuICAgICAgICAgIDdcbiAgICAgICAgICA4XG4gICAgICAgICAgfDlcbiAgICAgICAgICAgIDEwXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInRoZSBIIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oOSlcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBub24tYmxhbmstY2hhciBvbiBmaXJzdCByb3cgaWYgdmlzaWJsZVwiLCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMClcbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBub24tYmxhbmstY2hhciBvbiBmaXJzdCB2aXNpYmxlIHJvdyBwbHVzIHNjcm9sbCBvZmZzZXRcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDIpXG4gICAgICAgIGVuc3VyZSAnSCcsIGN1cnNvcjogWzQsIDJdXG5cbiAgICAgIGl0IFwicmVzcGVjdHMgY291bnRzXCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBlbnN1cmUgJzQgSCcsIGN1cnNvcjogWzMsIDBdXG5cbiAgICBkZXNjcmliZSBcInRoZSBMIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBub24tYmxhbmstY2hhciBvbiBsYXN0IHJvdyBpZiB2aXNpYmxlXCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDkpXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzksIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgdmlzaWJsZSByb3cgcGx1cyBvZmZzZXRcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oNylcbiAgICAgICAgZW5zdXJlICdMJywgY3Vyc29yOiBbNCwgMl1cblxuICAgICAgaXQgXCJyZXNwZWN0cyBjb3VudHNcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oOSlcbiAgICAgICAgZW5zdXJlICczIEwnLCBjdXJzb3I6IFs3LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgTSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5KVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG5vbi1ibGFuay1jaGFyIG9mIG1pZGRsZSBvZiBzY3JlZW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICdNJywgY3Vyc29yOiBbNCwgMl1cblxuICBkZXNjcmliZSBcInN0YXlPblZlcnRpY2FsTW90aW9uIHNldHRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblZlcnRpY2FsTW90aW9uJywgdHJ1ZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwIDAwMDAwMDAwMDAwMFxuICAgICAgICAgIDEgMTExMTExMTExMTExXG4gICAgICAgIDIgMjIyMjIyMjIyMjIyXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFsyLCAxMF1cblxuICAgIGRlc2NyaWJlIFwiZ2csIEcsIE4lXCIsIC0+XG4gICAgICBpdCBcImdvIHRvIHJvdyB3aXRoIGtlZXAgY29sdW1uIGFuZCByZXNwZWN0IGN1cnNvci5nb2FsQ29sdW1cIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIGcnLCAgICAgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgIGVuc3VyZSAnJCcsICAgICAgIGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBlbnN1cmUgJ0cnLCAgICAgICBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcbiAgICAgICAgZW5zdXJlICcxICUnLCAgICAgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnMSAwIGgnLCAgIGN1cnNvcjogWzAsIDVdXG4gICAgICAgIGVuc3VyZSAnNSAwICUnLCAgIGN1cnNvcjogWzEsIDVdXG4gICAgICAgIGVuc3VyZSAnMSAwIDAgJScsIGN1cnNvcjogWzIsIDVdXG5cbiAgICBkZXNjcmliZSBcIkgsIE0sIExcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDMpXG5cbiAgICAgIGl0IFwiZ28gdG8gcm93IHdpdGgga2VlcCBjb2x1bW4gYW5kIHJlc3BlY3QgY3Vyc29yLmdvYWxDb2x1bVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0gnLCBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgZW5zdXJlICdNJywgY3Vyc29yOiBbMSwgMTBdXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzIsIDEwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGVuc3VyZSAnTScsIGN1cnNvcjogWzEsIDE1XVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcblxuICBkZXNjcmliZSAndGhlIG1hcmsga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMlxuICAgICAgICAgICAgMzRcbiAgICAgICAgNTZcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZSBvZiBhIG1hcmsnLCAtPlxuICAgICAgcnVucyAtPiBzZXQgY3Vyc29yOiBbMSwgMV07IGVuc3VyZVdhaXQgJ20gYSdcbiAgICAgIHJ1bnMgLT4gc2V0IGN1cnNvcjogWzAsIDBdOyBlbnN1cmUgXCInIGFcIiwgY3Vyc29yOiBbMSwgNF1cblxuICAgIGl0ICdtb3ZlcyBsaXRlcmFsbHkgdG8gYSBtYXJrJywgLT5cbiAgICAgIHJ1bnMgLT4gc2V0IGN1cnNvcjogWzEsIDJdOyBlbnN1cmVXYWl0ICdtIGEnXG4gICAgICBydW5zIC0+IHNldCBjdXJzb3I6IFswLCAwXTsgZW5zdXJlICdgIGEnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgaXQgJ2RlbGV0ZXMgdG8gYSBtYXJrIGJ5IGxpbmUnLCAtPlxuICAgICAgcnVucyAtPiBzZXQgY3Vyc29yOiBbMSwgNV07IGVuc3VyZVdhaXQgJ20gYSdcbiAgICAgIHJ1bnMgLT4gc2V0IGN1cnNvcjogWzAsIDBdOyBlbnN1cmUgXCJkICcgYVwiLCB0ZXh0OiAnNTZcXG4nXG5cbiAgICBpdCAnZGVsZXRlcyBiZWZvcmUgdG8gYSBtYXJrIGxpdGVyYWxseScsIC0+XG4gICAgICBydW5zIC0+IHNldCBjdXJzb3I6IFsxLCA1XTsgZW5zdXJlV2FpdCAnbSBhJ1xuICAgICAgcnVucyAtPiBzZXQgY3Vyc29yOiBbMCwgMl07IGVuc3VyZSAnZCBgIGEnLCB0ZXh0OiAnICA0XFxuNTZcXG4nXG5cbiAgICBpdCAnZGVsZXRlcyBhZnRlciB0byBhIG1hcmsgbGl0ZXJhbGx5JywgLT5cbiAgICAgIHJ1bnMgLT4gc2V0IGN1cnNvcjogWzEsIDVdOyBlbnN1cmVXYWl0ICdtIGEnXG4gICAgICBydW5zIC0+IHNldCBjdXJzb3I6IFsyLCAxXTsgZW5zdXJlICdkIGAgYScsIHRleHQ6ICcgIDEyXFxuICAgIDM2XFxuJ1xuXG4gICAgaXQgJ21vdmVzIGJhY2sgdG8gcHJldmlvdXMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBlbnN1cmUgJ2AgYCdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgZW5zdXJlICdgIGAnLCBjdXJzb3I6IFsxLCA1XVxuXG4gIGRlc2NyaWJlIFwianVtcCBjb21tYW5kIHVwZGF0ZSBgIGFuZCAnIG1hcmtcIiwgLT5cbiAgICBlbnN1cmVKdW1wTWFyayA9ICh2YWx1ZSkgLT5cbiAgICAgIGVuc3VyZSBudWxsLCBtYXJrOiBcImBcIjogdmFsdWVcbiAgICAgIGVuc3VyZSBudWxsLCBtYXJrOiBcIidcIjogdmFsdWVcblxuICAgIGVuc3VyZUp1bXBBbmRCYWNrID0gKGtleXN0cm9rZSwgb3B0aW9uKSAtPlxuICAgICAgYWZ0ZXJNb3ZlID0gb3B0aW9uLmN1cnNvclxuICAgICAgYmVmb3JlTW92ZSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGVuc3VyZSBrZXlzdHJva2UsIGN1cnNvcjogYWZ0ZXJNb3ZlXG4gICAgICBlbnN1cmVKdW1wTWFyayhiZWZvcmVNb3ZlKVxuXG4gICAgICBleHBlY3QoYmVmb3JlTW92ZS5pc0VxdWFsKGFmdGVyTW92ZSkpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGVuc3VyZSBcImAgYFwiLCBjdXJzb3I6IGJlZm9yZU1vdmVcbiAgICAgIGVuc3VyZUp1bXBNYXJrKGFmdGVyTW92ZSlcblxuICAgIGVuc3VyZUp1bXBBbmRCYWNrTGluZXdpc2UgPSAoa2V5c3Ryb2tlLCBvcHRpb24pIC0+XG4gICAgICBhZnRlck1vdmUgPSBvcHRpb24uY3Vyc29yXG4gICAgICBiZWZvcmVNb3ZlID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgZXhwZWN0KGJlZm9yZU1vdmUuY29sdW1uKS5ub3QudG9CZSgwKVxuXG4gICAgICBlbnN1cmUga2V5c3Ryb2tlLCBjdXJzb3I6IGFmdGVyTW92ZVxuICAgICAgZW5zdXJlSnVtcE1hcmsoYmVmb3JlTW92ZSlcblxuICAgICAgZXhwZWN0KGJlZm9yZU1vdmUuaXNFcXVhbChhZnRlck1vdmUpKS50b0JlKGZhbHNlKVxuXG4gICAgICBlbnN1cmUgXCInICdcIiwgY3Vyc29yOiBbYmVmb3JlTW92ZS5yb3csIDBdXG4gICAgICBlbnN1cmVKdW1wTWFyayhhZnRlck1vdmUpXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmb3IgbWFyayBpbiBcImAnXCJcbiAgICAgICAgdmltU3RhdGUubWFyay5tYXJrc1ttYXJrXT8uZGVzdHJveSgpXG4gICAgICAgIHZpbVN0YXRlLm1hcmsubWFya3NbbWFya10gPSBudWxsXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDogb28gMFxuICAgICAgICAxOiAxMTExXG4gICAgICAgIDI6IDIyMjJcbiAgICAgICAgMzogb28gM1xuICAgICAgICA0OiA0NDQ0XG4gICAgICAgIDU6IG9vIDVcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcImluaXRpYWwgc3RhdGVcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJuIFswLCAwXVwiLCAtPlxuICAgICAgICBlbnN1cmUgbnVsbCwgbWFyazogXCInXCI6IFswLCAwXVxuICAgICAgICBlbnN1cmUgbnVsbCwgbWFyazogXCJgXCI6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJqdW1wIG1vdGlvbiBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgaW5pdGlhbCA9IFszLCAzXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKSAjIGZvciBMLCBNLCBIXG5cbiAgICAgICAgIyBUT0RPOiByZW1vdmUgd2hlbiAxLjE5IGJlY29tZSBzdGFibGVcbiAgICAgICAgaWYgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucz9cbiAgICAgICAgICB7Y29tcG9uZW50fSA9IGVkaXRvclxuICAgICAgICAgIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbXBvbmVudC5nZXRMaW5lSGVpZ2h0KCkgKiBlZGl0b3IuZ2V0TGluZUNvdW50KCkgKyAncHgnXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG5cbiAgICAgICAgZW5zdXJlIG51bGwsIG1hcms6IFwiJ1wiOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIG51bGwsIG1hcms6IFwiYFwiOiBbMCwgMF1cbiAgICAgICAgc2V0IGN1cnNvcjogaW5pdGlhbFxuXG4gICAgICBpdCBcIkcganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrICdHJywgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiZyBnIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcImcgZ1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCIxMDAgJSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCIxIDAgMCAlXCIsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIikganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCIoIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIihcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiXSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJdXCIsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIlsganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiW1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJ9IGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIn1cIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwieyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJ7XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIkwganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiTFwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJIIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIkhcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwiTSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJNXCIsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcIioganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gICAgICAjIFtCVUddIFN0cmFuZ2UgYnVnIG9mIGphc21pbmUgb3IgYXRvbSdzIGphc21pbmUgZW5oYW5jbWVudD9cbiAgICAgICMgVXNpbmcgc3ViamVjdCBcIiMganVtcCAmIGJhY2tcIiBza2lwcyBzcGVjLlxuICAgICAgIyBOb3RlIGF0IEF0b20gdjEuMTEuMlxuICAgICAgaXQgXCJTaGFycCgjKSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2soJyMnLCBjdXJzb3I6IFswLCAzXSlcblxuICAgICAgaXQgXCIvIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayAnLyBvbyBlbnRlcicsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIj8ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrICc/IG9vIGVudGVyJywgY3Vyc29yOiBbMCwgM11cblxuICAgICAgaXQgXCJuIGp1bXAmYmFja1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcvIG9vIGVudGVyJywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJuXCIsIGN1cnNvcjogWzMsIDNdXG4gICAgICAgIGVuc3VyZUp1bXBBbmRCYWNrIFwiTlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gICAgICBpdCBcIk4ganVtcCZiYWNrXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJz8gb28gZW50ZXInLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIm5cIiwgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJOXCIsIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGl0IFwiRyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSAnRycsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcImcgZyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcImcgZ1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCIxMDAgJSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIjEgMCAwICVcIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiKSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIilcIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwiKCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIihcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiXSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIl1cIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiWyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIltcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwifSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIn1cIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwieyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIntcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiTCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIkxcIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiSCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIkhcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwiTSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIk1cIiwgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiKiBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIipcIiwgY3Vyc29yOiBbNSwgM11cblxuICBkZXNjcmliZSAndGhlIFYga2V5YmluZGluZycsIC0+XG4gICAgW3RleHRdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAwMVxuICAgICAgICAwMDJcbiAgICAgICAgMDAwM1xuICAgICAgICAwMDAwNFxuICAgICAgICAwMDAwMDVcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgaXQgXCJzZWxlY3RzIGRvd24gYSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi4zXSlcblxuICAgIGl0IFwic2VsZWN0cyB1cCBhIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4xXSlcblxuICBkZXNjcmliZSAnTW92ZVRvKFByZXZpb3VzfE5leHQpRm9sZChTdGFydHxFbmQpJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAoc3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmV9ID0gdmltXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdbIFsnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLWZvbGQtc3RhcnQnXG4gICAgICAgICAgICAnXSBbJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWZvbGQtc3RhcnQnXG4gICAgICAgICAgICAnWyBdJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1mb2xkLWVuZCdcbiAgICAgICAgICAgICddIF0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtZm9sZC1lbmQnXG5cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBwcmV2aW91cyBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzIyLCA2XVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzIwLCA2XVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzE4LCA0XVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzksIDJdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbOCwgMF1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvTmV4dEZvbGRTdGFydFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIG5leHQgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzksIDJdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbMTgsIDRdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbMjAsIDZdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbMjIsIDZdXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb1ByZXZpb3VzRm9sZEVuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBwcmV2aW91cyBmb2xkIGVuZCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyOCwgMl1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyNSwgNF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyMywgOF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyMSwgOF1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvTmV4dEZvbGRFbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzIxLCA4XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzIzLCA4XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzI1LCA0XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzI4LCAyXVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClGb2xkKFN0YXJ0fEVuZClXaXRoU2FtZUluZGVudCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1cblxuICAgICAgcnVucyAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBncmFtbWFyOiBcInNvdXJjZS5qc1wiXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgY2xhc3MgVGVzdEEge1xuICAgICAgICAgICAgbWV0aEEoKSB7XG4gICAgICAgICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2xhc3MgVGVzdEIge1xuICAgICAgICAgICAgbWV0aEIoKSB7XG4gICAgICAgICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnWyBbJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1mb2xkLXN0YXJ0LXdpdGgtc2FtZS1pbmRlbnQnXG4gICAgICAgICAgICAnXSBbJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWZvbGQtc3RhcnQtd2l0aC1zYW1lLWluZGVudCdcbiAgICAgICAgICAgICdbIF0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLWZvbGQtZW5kLXdpdGgtc2FtZS1pbmRlbnQnXG4gICAgICAgICAgICAnXSBdJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWZvbGQtZW5kLXdpdGgtc2FtZS1pbmRlbnQnXG5cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50XCIsIC0+XG4gICAgICBpdCBcIltmcm9tIGxhcmdldHN0IGZvbGRdIG1vdmUgdG8gZmlyc3QgY2hhciBvZiBwcmV2aW91cyBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTQsIDBdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIltmcm9tIG91dGVyIGZvbGRdIG1vdmUgdG8gZmlyc3QgY2hhciBvZiBwcmV2aW91cyBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNywgMF0gIyBibGFuayByb3dcbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIltmcm9tIG9uZSBsZXZlbCBkZWVwZXIgZm9sZF0gbW92ZSB0byBmaXJzdCBjaGFyIG9mIHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs5LCAwXVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMSwgMl1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50XCIsIC0+XG4gICAgICBpdCBcIltmcm9tIGxhcmdldHN0IGZvbGRdIG1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgIGl0IFwiW2Zyb20gb3V0ZXIgZm9sZF0gbW92ZSB0byBmaXJzdCBjaGFyIG9mIG5leHQgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzcsIDBdICMgYmxhbmsgcm93XG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgaXQgXCJbZnJvbSBvbmUgbGV2ZWwgZGVlcGVyIGZvbGRdIG1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzksIDJdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOSwgMl1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvUHJldmlvdXNGb2xkRW5kV2l0aFNhbWVJbmRlbnRcIiwgLT5cbiAgICAgIGl0IFwiW2Zyb20gbGFyZ2V0c3QgZm9sZF0gbW92ZSB0byBmaXJzdCBjaGFyIG9mIHByZXZpb3VzIGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMTQsIDBdXG4gICAgICAgIGVuc3VyZSAnWyBdJywgY3Vyc29yOiBbNiwgMF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFs2LCAwXVxuICAgICAgaXQgXCJbZnJvbSBvdXRlciBmb2xkXSBtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgcHJldmlvdXMgZm9sZCBlbmQgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs3LCAwXSAjIGJsYW5rIHJvd1xuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzYsIDBdXG4gICAgICAgIGVuc3VyZSAnWyBdJywgY3Vyc29yOiBbNiwgMF1cbiAgICAgIGl0IFwiW2Zyb20gb25lIGxldmVsIGRlZXBlciBmb2xkXSBtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgcHJldmlvdXMgZm9sZCBlbmQgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxMywgMF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFs1LCAyXVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzUsIDJdXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb05leHRGb2xkRW5kV2l0aFNhbWVJbmRlbnRcIiwgLT5cbiAgICAgIGl0IFwiW2Zyb20gbGFyZ2V0c3QgZm9sZF0gbW92ZSB0byBmaXJzdCBjaGFyIG9mIG5leHQgZm9sZCBlbmQgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzYsIDBdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMTQsIDBdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMTQsIDBdXG4gICAgICBpdCBcIltmcm9tIG91dGVyIGZvbGRdIG1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNywgMF0gIyBibGFuayByb3dcbiAgICAgICAgZW5zdXJlICddIF0nLCBjdXJzb3I6IFsxNCwgMF1cbiAgICAgICAgZW5zdXJlICddIF0nLCBjdXJzb3I6IFsxNCwgMF1cbiAgICAgIGl0IFwiW2Zyb20gb25lIGxldmVsIGRlZXBlciBmb2xkXSBtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgbmV4dCBmb2xkIGVuZCByb3dcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdICMgYmxhbmsgcm93XG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbNSwgMl1cbiAgICAgICAgZW5zdXJlICddIF0nLCBjdXJzb3I6IFsxMywgMl1cbiAgICAgICAgZW5zdXJlICddIF0nLCBjdXJzb3I6IFsxMywgMl1cblxuICBkZXNjcmliZSAnTW92ZVRvKFByZXZpb3VzfE5leHQpU3RyaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBzJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LXN0cmluZydcbiAgICAgICAgICAnZyBTJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1zdHJpbmcnXG5cbiAgICBkZXNjcmliZSAnZWRpdG9yIGZvciBzb2Z0VGFiJywgLT5cbiAgICAgIHBhY2sgPSAnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCdcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGRpc3Bvc2FibGU/LmRpc3Bvc2UoKVxuICAgICAgICAgICAgZGlzcG9zYWJsZSA9IGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICAgICAgICdjaGVjay11cCc6IC0+IGZ1bignYmFja3dhcmQnKVxuICAgICAgICAgICAgICAnY2hlY2stZG93bic6IC0+IGZ1bignZm9yd2FyZCcpXG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5jb2ZmZWUnXG5cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFsxLCAzMV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzIsIDIxXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMywgMjNdXG4gICAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzMsIDIzXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMiwgMjFdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFsxLCAzMV1cbiAgICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczIGcgcycsIGN1cnNvcjogWzIsIDIxXVxuICAgICAgICBlbnN1cmUgJzMgZyBTJywgY3Vyc29yOiBbMSwgMzFdXG5cbiAgICBkZXNjcmliZSAnZWRpdG9yIGZvciBoYXJkVGFiJywgLT5cbiAgICAgIHBhY2sgPSAnbGFuZ3VhZ2UtZ28nXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5nbycsIChzdGF0ZSwgdmltRWRpdG9yKSAtPlxuICAgICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gc3RhdGVcbiAgICAgICAgICB7c2V0LCBlbnN1cmV9ID0gdmltRWRpdG9yXG5cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsyLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzMsIDddXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbOCwgOF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFs5LCA4XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzExLCAyMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxMiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTMsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzE1LCAxNV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxNiwgMTVdXG4gICAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFsxOCwgMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxNiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTUsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzEzLCAxNV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxMiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTEsIDIwXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzksIDhdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbOCwgOF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFszLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzIsIDddXG5cbiAgZGVzY3JpYmUgJ01vdmVUbyhQcmV2aW91c3xOZXh0KU51bWJlcicsIC0+XG4gICAgcGFjayA9ICdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0J1xuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIG4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtbnVtYmVyJ1xuICAgICAgICAgICdnIE4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLW51bWJlcidcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGdyYW1tYXI6ICdzb3VyY2UuY29mZmVlJ1xuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG51bTEgPSAxXG4gICAgICAgIGFycjEgPSBbMSwgMTAxLCAxMDAxXVxuICAgICAgICBhcnIyID0gW1wiMVwiLCBcIjJcIiwgXCIzXCJdXG4gICAgICAgIG51bTIgPSAyXG4gICAgICAgIGZ1bihcIjFcIiwgMiwgMylcbiAgICAgICAgXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICBpdCBcIm1vdmUgdG8gbmV4dCBudW1iZXJcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFswLCA3XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFsxLCA4XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFsxLCAxMV1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgMTZdXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzQsIDldXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzQsIDEyXVxuICAgIGl0IFwibW92ZSB0byBwcmV2aW91cyBudW1iZXJcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs1LCAwXVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFs0LCAxMl1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbNCwgOV1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMywgN11cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMSwgMTZdXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzEsIDExXVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFsxLCA4XVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFswLCA3XVxuICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJzUgZyBuJywgY3Vyc29yOiBbMywgN11cbiAgICAgIGVuc3VyZSAnMyBnIE4nLCBjdXJzb3I6IFsxLCA4XVxuXG4gIGRlc2NyaWJlICdzdWJ3b3JkIG1vdGlvbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ3EnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtc3Vid29yZCdcbiAgICAgICAgICAnUSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc3Vid29yZCdcbiAgICAgICAgICAnY3RybC1lJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1lbmQtb2Ytc3Vid29yZCdcblxuICAgIGl0IFwibW92ZSB0byBuZXh0L3ByZXZpb3VzIHN1YndvcmRcIiwgLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsfENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlfCA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT58ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAofHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHxzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSB8Q2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYXxSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUnxBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJ8UnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxufGRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtfGNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxufHNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZXxfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2V8X3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3J8ZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlfF93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlfF9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxufHNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLXxjYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2h8LWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxufGRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyfFJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSfEFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYXxSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgfENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsfCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHxzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHx3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PnwgKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlfCA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbHxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcInxjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgIGl0IFwibW92ZS10by1lbmQtb2Ytc3Vid29yZFwiLCAtPlxuICAgICAgc2V0IHRleHRDOiBcInxjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lfGxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXN8ZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9fD4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gfCh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXR8aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWF8bCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENofGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGV8clJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJ8c1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc3xoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXN8ZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWt8ZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXN8ZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3J8ZFxcblwiXG4iXX0=
