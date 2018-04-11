(function() {
  var TextData, _, dispatch, getVimState, ref, settings, withMockPlatform;

  _ = require('underscore-plus');

  ref = require('./spec-helper'), getVimState = ref.getVimState, TextData = ref.TextData, withMockPlatform = ref.withMockPlatform, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("VimState", function() {
    var editor, editorElement, ensure, ensureWait, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, vim;
      });
    });
    describe("initialization", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure(null, {
          mode: 'normal'
        });
      });
      return it("puts the editor in insert-mode if startInInsertMode is true", function() {
        settings.set('startInInsertMode', true);
        return getVimState(function(state, vim) {
          return vim.ensure(null, {
            mode: 'insert'
          });
        });
      });
    });
    describe("::destroy", function() {
      it("re-enables text input on the editor", function() {
        expect(editorElement.component.isInputEnabled()).toBeFalsy();
        vimState.destroy();
        return expect(editorElement.component.isInputEnabled()).toBeTruthy();
      });
      it("removes the mode classes from the editor", function() {
        ensure(null, {
          mode: 'normal'
        });
        vimState.destroy();
        return expect(editorElement.classList.contains("normal-mode")).toBeFalsy();
      });
      return it("is a noop when the editor is already destroyed", function() {
        editorElement.getModel().destroy();
        return vimState.destroy();
      });
    });
    describe("normal-mode", function() {
      describe("when entering an insertable character", function() {
        beforeEach(function() {
          return ensure('\\');
        });
        return it("stops propagation", function() {
          return ensure(null, {
            text: ''
          });
        });
      });
      describe("when entering an operator", function() {
        beforeEach(function() {
          return ensure('d');
        });
        describe("with an operator that can't be composed", function() {
          beforeEach(function() {
            return ensure('x');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        describe("the escape keybinding", function() {
          beforeEach(function() {
            return ensure('escape');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        return describe("the ctrl-c keybinding", function() {
          beforeEach(function() {
            return ensure('ctrl-c');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
      });
      describe("the escape keybinding", function() {
        return it("clears any extra cursors", function() {
          set({
            text: "one-two-three",
            addCursor: [0, 3]
          });
          ensure(null, {
            numCursors: 2
          });
          return ensure('escape', {
            numCursors: 1
          });
        });
      });
      describe("the v keybinding", function() {
        beforeEach(function() {
          set({
            text: "abc",
            cursor: [0, 0]
          });
          return ensure('v');
        });
        return it("puts the editor into visual characterwise mode", function() {
          return ensure(null, {
            mode: ['visual', 'characterwise']
          });
        });
      });
      describe("the V keybinding", function() {
        beforeEach(function() {
          return set({
            text: "012345\nabcdef",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual linewise mode", function() {
          return ensure('V', {
            mode: ['visual', 'linewise']
          });
        });
        return it("selects the current line", function() {
          return ensure('V', {
            selectedText: '012345\n'
          });
        });
      });
      describe("the ctrl-v keybinding", function() {
        return it("puts the editor into visual blockwise mode", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('ctrl-v', {
            mode: ['visual', 'blockwise']
          });
        });
      });
      describe("selecting text", function() {
        beforeEach(function() {
          spyOn(_._, "now").andCallFake(function() {
            return window.now;
          });
          return set({
            text: "abc def",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual mode", function() {
          ensure(null, {
            mode: 'normal'
          });
          advanceClock(200);
          atom.commands.dispatch(editorElement, "core:select-right");
          return ensure(null, {
            mode: ['visual', 'characterwise'],
            selectedBufferRange: [[0, 0], [0, 1]]
          });
        });
        it("handles the editor being destroyed shortly after selecting text", function() {
          set({
            selectedBufferRange: [[0, 0], [0, 3]]
          });
          editor.destroy();
          vimState.destroy();
          return advanceClock(100);
        });
        return it('handles native selection such as core:select-all', function() {
          atom.commands.dispatch(editorElement, 'core:select-all');
          return ensure(null, {
            selectedBufferRange: [[0, 0], [0, 7]]
          });
        });
      });
      describe("the i keybinding", function() {
        return it("puts the editor into insert mode", function() {
          return ensure('i', {
            mode: 'insert'
          });
        });
      });
      describe("the R keybinding", function() {
        return it("puts the editor into replace mode", function() {
          return ensure('R', {
            mode: ['insert', 'replace']
          });
        });
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
        });
        describe("on a line with content", function() {
          return it("[Changed] won't adjust cursor position if outer command place the cursor on end of line('\\n') character", function() {
            ensure(null, {
              mode: 'normal'
            });
            atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
            return ensure(null, {
              cursor: [0, 6]
            });
          });
        });
        return describe("on an empty line", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [1, 0]
            });
            return ensure(null, {
              cursor: [1, 0]
            });
          });
        });
      });
      return describe('with character-input operations', function() {
        beforeEach(function() {
          return set({
            text: '012345\nabcdef'
          });
        });
        return it('properly clears the operations', function() {
          ensure('d', {
            mode: 'operator-pending'
          });
          expect(vimState.operationStack.isEmpty()).toBe(false);
          ensure('r', {
            mode: 'normal'
          });
          expect(vimState.operationStack.isEmpty()).toBe(true);
          ensure('d', {
            mode: 'operator-pending'
          });
          expect(vimState.operationStack.isEmpty()).toBe(false);
          ensure('escape', {
            mode: 'normal',
            text: '012345\nabcdef'
          });
          return expect(vimState.operationStack.isEmpty()).toBe(true);
        });
      });
    });
    describe("activate-normal-mode-once command", function() {
      beforeEach(function() {
        set({
          text: "0 23456\n1 23456",
          cursor: [0, 2]
        });
        return ensure('i', {
          mode: 'insert',
          cursor: [0, 2]
        });
      });
      return it("activate normal mode without moving cursors left, then back to insert-mode once some command executed", function() {
        ensure('ctrl-o', {
          cursor: [0, 2],
          mode: 'normal'
        });
        return ensure('l', {
          cursor: [0, 3],
          mode: 'insert'
        });
      });
    });
    describe("insert-mode", function() {
      beforeEach(function() {
        return ensure('i');
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting insert mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [0, 6]
            });
            return ensure(null, {
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return escape('escape', {
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('ctrl-c', {
            mode: 'normal'
          });
        });
      });
      describe("clearMultipleCursorsOnEscapeInsertMode setting", function() {
        beforeEach(function() {
          return set({
            text: 'abc',
            cursor: [[0, 1], [0, 2]]
          });
        });
        describe("when enabled, clear multiple cursors on escaping insert-mode", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', true);
          });
          it("clear multiple cursors by respecting last cursor's position", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1,
              cursor: [0, 1]
            });
          });
          return it("clear multiple cursors by respecting last cursor's position", function() {
            set({
              cursor: [[0, 2], [0, 1]]
            });
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1,
              cursor: [0, 0]
            });
          });
        });
        return describe("when disabled", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', false);
          });
          return it("keep multiple cursors", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 2,
              cursor: [[0, 0], [0, 1]]
            });
          });
        });
      });
      return describe("automaticallyEscapeInsertModeOnActivePaneItemChange setting", function() {
        var otherEditor, otherVim, pane, ref2;
        ref2 = [], otherVim = ref2[0], otherEditor = ref2[1], pane = ref2[2];
        beforeEach(function() {
          getVimState(function(otherVimState, _other) {
            otherVim = _other;
            return otherEditor = otherVimState.editor;
          });
          return runs(function() {
            pane = atom.workspace.getActivePane();
            pane.activateItem(editor);
            set({
              textC: "|editor-1"
            });
            otherVim.set({
              textC: "|editor-2"
            });
            ensure('i', {
              mode: 'insert'
            });
            otherVim.ensure('i', {
              mode: 'insert'
            });
            return expect(pane.getActiveItem()).toBe(editor);
          });
        });
        describe("default behavior", function() {
          return it("remain in insert-mode on paneItem change by default", function() {
            pane.activateItem(otherEditor);
            expect(pane.getActiveItem()).toBe(otherEditor);
            ensure(null, {
              mode: 'insert'
            });
            return otherVim.ensure(null, {
              mode: 'insert'
            });
          });
        });
        return describe("automaticallyEscapeInsertModeOnActivePaneItemChange = true", function() {
          beforeEach(function() {
            settings.set('automaticallyEscapeInsertModeOnActivePaneItemChange', true);
            return jasmine.useRealClock();
          });
          return it("automatically shift to normal mode except new active editor", function() {
            var called;
            called = false;
            runs(function() {
              atom.workspace.onDidStopChangingActivePaneItem(function() {
                return called = true;
              });
              return pane.activateItem(otherEditor);
            });
            waitsFor(function() {
              return called;
            });
            return runs(function() {
              expect(pane.getActiveItem()).toBe(otherEditor);
              ensure(null, {
                mode: 'normal'
              });
              return otherVim.ensure(null, {
                mode: 'insert'
              });
            });
          });
        });
      });
    });
    describe("replace-mode", function() {
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting replace mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('R escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {});
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('R escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            ensure('R');
            set({
              cursor: [0, 6]
            });
            return ensure(null, {
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('R escape', {
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('R ctrl-c', {
            mode: 'normal'
          });
        });
      });
      return describe("shift between insert and replace", function() {
        var startInsertMode, startReplaceMode;
        startReplaceMode = function() {
          return dispatch(editorElement, "vim-mode-plus:activate-replace-mode");
        };
        startInsertMode = function() {
          return dispatch(editorElement, "vim-mode-plus:activate-insert-mode");
        };
        it("move left on escape since replace mode is submode of insert-mode", function() {
          set({
            textC: "01234|5"
          });
          ensure('R escape', {
            textC: "0123|45",
            mode: "normal"
          });
          ensure('R escape', {
            textC: "012|345",
            mode: "normal"
          });
          ensure('R escape', {
            textC: "01|2345",
            mode: "normal"
          });
          return ensure('R escape', {
            textC: "0|12345",
            mode: "normal"
          });
        });
        it("can activate replace multiple times but move left once on escape", function() {
          set({
            textC: "01234|5"
          });
          ensure('R', {
            mode: ["insert", "replace"]
          });
          startReplaceMode();
          ensure(null, {
            mode: ["insert", "replace"]
          });
          startReplaceMode();
          ensure(null, {
            mode: ["insert", "replace"]
          });
          return ensure('escape', {
            textC: "0123|45",
            mode: "normal"
          });
        });
        it("can toggle between insert and replace", function() {
          set({
            textC: "012|345"
          });
          startReplaceMode();
          editor.insertText("r");
          ensure(null, {
            textC: "012r|45",
            mode: ["insert", "replace"]
          });
          startInsertMode();
          editor.insertText("i");
          ensure(null, {
            textC: "012ri|45",
            mode: ["insert", void 0]
          });
          startReplaceMode();
          editor.insertText("r");
          return ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
        });
        return it("can toggle between insert and replace by toggle-replace-mode command", function() {
          var insertText, toggle;
          toggle = function() {
            return dispatch(editorElement, 'vim-mode-plus:toggle-replace-mode');
          };
          insertText = function(text) {
            return editor.insertText(text);
          };
          set({
            textC: "012|345"
          });
          startInsertMode();
          ensure(null, {
            textC: "012|345",
            mode: "insert"
          });
          toggle();
          insertText("r");
          ensure(null, {
            textC: "012r|45",
            mode: ["insert", "replace"]
          });
          toggle();
          insertText("i");
          ensure(null, {
            textC: "012ri|45",
            mode: ["insert", void 0]
          });
          toggle();
          insertText("r");
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", void 0]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", void 0]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
          ensure("escape", {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          return ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
        });
      });
    });
    describe("visual-mode", function() {
      beforeEach(function() {
        set({
          text: "one two three",
          cursor: [0, 4]
        });
        return ensure('v');
      });
      it("selects the character under the cursor", function() {
        return ensure(null, {
          selectedBufferRange: [[0, 4], [0, 5]],
          selectedText: 't'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('escape', {
          cursor: [0, 4],
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed on selection is reversed", function() {
        ensure(null, {
          selectedText: 't'
        });
        ensure('h h', {
          selectedText: 'e t',
          selectionIsReversed: true
        });
        return ensure('escape', {
          mode: 'normal',
          cursor: [0, 2]
        });
      });
      describe("motions", function() {
        it("transforms the selection", function() {
          return ensure('w', {
            selectedText: 'two t'
          });
        });
        return it("always leaves the initially selected character selected", function() {
          ensure('h', {
            selectedText: ' t'
          });
          ensure('l', {
            selectedText: 't'
          });
          return ensure('l', {
            selectedText: 'tw'
          });
        });
      });
      describe("operators", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('V d', {
            text: "\nabcdef"
          });
        });
      });
      describe("returning to normal-mode", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef"
          });
          return ensure('V escape', {
            selectedText: ''
          });
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          set({
            addCursor: [0, 12]
          });
          ensure('i w', {
            selectedText: ["two", "three"],
            selectionIsReversed: false
          });
          return ensure('o', {
            selectionIsReversed: true
          });
        });
        return xit("harmonizes selection directions", function() {
          set({
            cursor: [0, 0]
          });
          ensure('e e');
          set({
            addCursor: [0, 2e308]
          });
          ensure('h h', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursor: [[0, 5], [0, 11]]
          });
          return ensure('o', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursor: [[0, 5], [0, 13]]
          });
        });
      });
      describe("activate visualmode within visualmode", function() {
        var cursorPosition;
        cursorPosition = null;
        beforeEach(function() {
          cursorPosition = [0, 4];
          set({
            text: "line one\nline two\nline three\n",
            cursor: cursorPosition
          });
          return ensure('escape', {
            mode: 'normal'
          });
        });
        describe("restore characterwise from linewise", function() {
          beforeEach(function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('2 j V', {
              selectedText: "line one\nline two\nline three\n",
              mode: ['visual', 'linewise'],
              selectionIsReversed: false
            });
            return ensure('o', {
              selectedText: "line one\nline two\nline three\n",
              mode: ['visual', 'linewise'],
              selectionIsReversed: true
            });
          });
          it("v after o", function() {
            return ensure('v', {
              selectedText: " one\nline two\nline ",
              mode: ['visual', 'characterwise'],
              selectionIsReversed: true
            });
          });
          return it("escape after o", function() {
            return ensure('escape', {
              cursor: [0, 4],
              mode: 'normal'
            });
          });
        });
        describe("activateVisualMode with same type puts the editor into normal mode", function() {
          describe("characterwise: vv", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('v', {
                mode: ['visual', 'characterwise']
              });
              return ensure('v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          describe("linewise: VV", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('V', {
                mode: ['visual', 'linewise']
              });
              return ensure('V', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          return describe("blockwise: ctrl-v twice", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('ctrl-v', {
                mode: ['visual', 'blockwise']
              });
              return ensure('ctrl-v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
        });
        describe("change submode within visualmode", function() {
          beforeEach(function() {
            return set({
              text: "line one\nline two\nline three\n",
              cursor: [[0, 5], [2, 5]]
            });
          });
          it("can change submode within visual mode", function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('V', {
              mode: ['visual', 'linewise']
            });
            ensure('ctrl-v', {
              mode: ['visual', 'blockwise']
            });
            return ensure('v', {
              mode: ['visual', 'characterwise']
            });
          });
          return it("recover original range when shift from linewise to characterwise", function() {
            ensure('v i w', {
              selectedText: ['one', 'three']
            });
            ensure('V', {
              selectedText: ["line one\n", "line three\n"]
            });
            return ensure('v', {
              selectedText: ["one", "three"]
            });
          });
        });
        return describe("keep goalColum when submode change in visual-mode", function() {
          var text;
          text = null;
          beforeEach(function() {
            text = new TextData("0_34567890ABCDEF\n1_34567890\n2_34567\n3_34567890A\n4_34567890ABCDEF\n");
            return set({
              text: text.getRaw(),
              cursor: [0, 0]
            });
          });
          return it("keep goalColumn when shift linewise to characterwise", function() {
            ensure('V', {
              selectedText: text.getLines([0]),
              propertyHead: [0, 0],
              mode: ['visual', 'linewise']
            });
            ensure('$', {
              selectedText: text.getLines([0]),
              propertyHead: [0, 16],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1]),
              propertyHead: [1, 10],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2]),
              propertyHead: [2, 7],
              mode: ['visual', 'linewise']
            });
            ensure('v', {
              selectedText: text.getLines([0, 1, 2]),
              propertyHead: [2, 7],
              mode: ['visual', 'characterwise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3]),
              propertyHead: [3, 11],
              mode: ['visual', 'characterwise']
            });
            ensure('v', {
              cursor: [3, 10],
              mode: 'normal'
            });
            return ensure('j', {
              cursor: [4, 15],
              mode: 'normal'
            });
          });
        });
      });
      describe("deactivating visual mode", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "line one\nline two\nline three\n",
            cursor: [0, 7]
          });
        });
        it("can put cursor at in visual char mode", function() {
          return ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [0, 8]
          });
        });
        it("adjust cursor position 1 column left when deactivated", function() {
          return ensure('v escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
        return it("can select new line in visual mode", function() {
          ensure('v', {
            cursor: [0, 8],
            propertyHead: [0, 7]
          });
          ensure('l', {
            cursor: [1, 0],
            propertyHead: [0, 8]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
      });
      return describe("deactivating visual mode on blank line", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "0: abc\n\n2: abc",
            cursor: [1, 0]
          });
        });
        it("v case-1", function() {
          ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("v case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('v j', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0],
            selectedText: ": abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-1", function() {
          ensure('V', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('V j', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0],
            selectedText: "0: abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("ctrl-v", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRange: [[1, 0], [1, 0]]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        return it("ctrl-v and move over empty line", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          ensure('k', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[0, 0], [0, 1]], [[1, 0], [1, 0]]]
          });
          ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          return ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[1, 0], [1, 0]], [[2, 0], [2, 1]]]
          });
        });
      });
    });
    describe("marks", function() {
      beforeEach(function() {
        return set({
          text: "text in line 1\ntext in line 2\ntext in line 3"
        });
      });
      it("basic marking functionality", function() {
        runs(function() {
          set({
            cursor: [1, 1]
          });
          return ensureWait('m t');
        });
        return runs(function() {
          set({
            cursor: [2, 2]
          });
          return ensure('` t', {
            cursor: [1, 1]
          });
        });
      });
      it("real (tracking) marking functionality", function() {
        runs(function() {
          set({
            cursor: [2, 2]
          });
          return ensureWait('m q');
        });
        return runs(function() {
          set({
            cursor: [1, 2]
          });
          return ensure('o escape ` q', {
            cursor: [3, 2]
          });
        });
      });
      return it("real (tracking) marking functionality", function() {
        runs(function() {
          set({
            cursor: [2, 2]
          });
          return ensureWait('m q');
        });
        return runs(function() {
          set({
            cursor: [1, 2]
          });
          return ensure('d d escape ` q', {
            cursor: [1, 2]
          });
        });
      });
    });
    return describe("is-narrowed attribute", function() {
      var ensureNormalModeState;
      ensureNormalModeState = function() {
        return ensure("escape", {
          mode: 'normal',
          selectedText: '',
          selectionIsNarrowed: false
        });
      };
      beforeEach(function() {
        return set({
          text: "1:-----\n2:-----\n3:-----\n4:-----",
          cursor: [0, 0]
        });
      });
      describe("normal-mode", function() {
        return it("is not narrowed", function() {
          return ensure(null, {
            mode: ['normal'],
            selectionIsNarrowed: false
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        it("[single row] is narrowed", function() {
          ensure('v $', {
            selectedText: '1:-----\n',
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('v j', {
            selectedText: "1:-----\n2",
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      describe("visual-mode.linewise", function() {
        it("[single row] is narrowed", function() {
          ensure('V', {
            selectedText: "1:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('V j', {
            selectedText: "1:-----\n2:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      return describe("visual-mode.blockwise", function() {
        it("[single row] is narrowed", function() {
          ensure('ctrl-v l', {
            selectedText: "1:",
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('ctrl-v l j', {
            selectedText: ["1:", "2:"],
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tc3RhdGUtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBc0QsT0FBQSxDQUFRLGVBQVIsQ0FBdEQsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVDQUF4QixFQUEwQzs7RUFDMUMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0FBQ25CLFFBQUE7SUFBQSxPQUE2RCxFQUE3RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG9CQUFkLEVBQTBCLGdCQUExQixFQUFrQyx1QkFBbEMsRUFBaUQ7SUFFakQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYywyQkFBZCxFQUE0QjtNQUhsQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO01BQ3pCLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO2VBQ3hELE1BQUEsQ0FBTyxJQUFQLEVBQWE7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUFiO01BRHdELENBQTFEO2FBR0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUE7UUFDaEUsUUFBUSxDQUFDLEdBQVQsQ0FBYSxtQkFBYixFQUFrQyxJQUFsQztlQUNBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO2lCQUNWLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBWCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO1FBRFUsQ0FBWjtNQUZnRSxDQUFsRTtJQUp5QixDQUEz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QixLQUZyQjtXQURGO2lCQUlBLHFCQUFBLENBQUE7UUFMNkIsQ0FBL0I7ZUFNQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtVQUM1QixNQUFBLENBQU8sWUFBUCxFQUNFO1lBQUEsWUFBQSxFQUFjLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBZDtZQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxXQUFYLENBRE47WUFFQSxtQkFBQSxFQUFxQixJQUZyQjtXQURGO2lCQUlBLHFCQUFBLENBQUE7UUFMNEIsQ0FBOUI7TUFQZ0MsQ0FBbEM7SUFyRGdDLENBQWxDO0VBaG5CbUIsQ0FBckI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57Z2V0VmltU3RhdGUsIFRleHREYXRhLCB3aXRoTW9ja1BsYXRmb3JtLCBkaXNwYXRjaH0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiVmltU3RhdGVcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0LCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0fSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiaW5pdGlhbGl6YXRpb25cIiwgLT5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbiBub3JtYWwtbW9kZSBpbml0aWFsbHkgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgZW5zdXJlIG51bGwsIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbiBpbnNlcnQtbW9kZSBpZiBzdGFydEluSW5zZXJ0TW9kZSBpcyB0cnVlXCIsIC0+XG4gICAgICBzZXR0aW5ncy5zZXQgJ3N0YXJ0SW5JbnNlcnRNb2RlJywgdHJ1ZVxuICAgICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICAgIHZpbS5lbnN1cmUgbnVsbCwgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcIjo6ZGVzdHJveVwiLCAtPlxuICAgIGl0IFwicmUtZW5hYmxlcyB0ZXh0IGlucHV0IG9uIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5pc0lucHV0RW5hYmxlZCgpKS50b0JlRmFsc3koKVxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQuaXNJbnB1dEVuYWJsZWQoKSkudG9CZVRydXRoeSgpXG5cbiAgICBpdCBcInJlbW92ZXMgdGhlIG1vZGUgY2xhc3NlcyBmcm9tIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJub3JtYWwtbW9kZVwiKSkudG9CZUZhbHN5KClcblxuICAgIGl0IFwiaXMgYSBub29wIHdoZW4gdGhlIGVkaXRvciBpcyBhbHJlYWR5IGRlc3Ryb3llZFwiLCAtPlxuICAgICAgZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmRlc3Ryb3koKVxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgXCJub3JtYWwtbW9kZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBlbnRlcmluZyBhbiBpbnNlcnRhYmxlIGNoYXJhY3RlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmUgJ1xcXFwnXG5cbiAgICAgIGl0IFwic3RvcHMgcHJvcGFnYXRpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlIG51bGwsIHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZW50ZXJpbmcgYW4gb3BlcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlICdkJ1xuXG4gICAgICBkZXNjcmliZSBcIndpdGggYW4gb3BlcmF0b3IgdGhhdCBjYW4ndCBiZSBjb21wb3NlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZW5zdXJlICd4J1xuXG4gICAgICAgIGl0IFwiY2xlYXJzIHRoZSBvcGVyYXRvciBzdGFja1wiLCAtPlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICAgICAgZGVzY3JpYmUgXCJ0aGUgZXNjYXBlIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJ1xuXG4gICAgICAgIGl0IFwiY2xlYXJzIHRoZSBvcGVyYXRvciBzdGFja1wiLCAtPlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICAgICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1jIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC1jJ1xuXG4gICAgICAgIGl0IFwiY2xlYXJzIHRoZSBvcGVyYXRvciBzdGFja1wiLCAtPlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICAgIGRlc2NyaWJlIFwidGhlIGVzY2FwZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcImNsZWFycyBhbnkgZXh0cmEgY3Vyc29yc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIm9uZS10d28tdGhyZWVcIlxuICAgICAgICAgIGFkZEN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSBudWxsLCBudW1DdXJzb3JzOiAyXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbnVtQ3Vyc29yczogMVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgdiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ3YnXG5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIGNoYXJhY3Rlcndpc2UgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgIGRlc2NyaWJlIFwidGhlIFYga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjAxMjM0NVxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byB2aXN1YWwgbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG5cbiAgICAgIGl0IFwic2VsZWN0cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnVicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnMDEyMzQ1XFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC12IGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIGJsb2Nrd2lzZSBtb2RlXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG5cbiAgICBkZXNjcmliZSBcInNlbGVjdGluZyB0ZXh0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKF8uXywgXCJub3dcIikuYW5kQ2FsbEZha2UgLT4gd2luZG93Lm5vd1xuICAgICAgICBzZXQgdGV4dDogXCJhYmMgZGVmXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIG51bGwsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgYWR2YW5jZUNsb2NrKDIwMClcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCBcImNvcmU6c2VsZWN0LXJpZ2h0XCIpXG4gICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFswLCAxXV1cblxuICAgICAgaXQgXCJoYW5kbGVzIHRoZSBlZGl0b3IgYmVpbmcgZGVzdHJveWVkIHNob3J0bHkgYWZ0ZXIgc2VsZWN0aW5nIHRleHRcIiwgLT5cbiAgICAgICAgc2V0IHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFswLCAzXV1cbiAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICAgICAgYWR2YW5jZUNsb2NrKDEwMClcblxuICAgICAgaXQgJ2hhbmRsZXMgbmF0aXZlIHNlbGVjdGlvbiBzdWNoIGFzIGNvcmU6c2VsZWN0LWFsbCcsIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2NvcmU6c2VsZWN0LWFsbCcpXG4gICAgICAgIGVuc3VyZSBudWxsLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMCwgN11dXG5cbiAgICBkZXNjcmliZSBcInRoZSBpIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwidGhlIFIga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byByZXBsYWNlIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG5cbiAgICBkZXNjcmliZSBcIndpdGggY29udGVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICAgIGl0IFwiW0NoYW5nZWRdIHdvbid0IGFkanVzdCBjdXJzb3IgcG9zaXRpb24gaWYgb3V0ZXIgY29tbWFuZCBwbGFjZSB0aGUgY3Vyc29yIG9uIGVuZCBvZiBsaW5lKCdcXFxcbicpIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgXCJlZGl0b3I6bW92ZS10by1lbmQtb2YtbGluZVwiKVxuICAgICAgICAgIGVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgICBkZXNjcmliZSBcIm9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJhbGxvd3MgdGhlIGN1cnNvciB0byBiZSBwbGFjZWQgb24gdGhlIFxcbiBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlICd3aXRoIGNoYXJhY3Rlci1pbnB1dCBvcGVyYXRpb25zJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICcwMTIzNDVcXG5hYmNkZWYnXG5cbiAgICAgIGl0ICdwcm9wZXJseSBjbGVhcnMgdGhlIG9wZXJhdGlvbnMnLCAtPlxuXG4gICAgICAgIGVuc3VyZSAnZCcsIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ3InLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKHRydWUpXG5cbiAgICAgICAgZW5zdXJlICdkJywgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUoZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIHRleHQ6ICcwMTIzNDVcXG5hYmNkZWYnXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICBkZXNjcmliZSBcImFjdGl2YXRlLW5vcm1hbC1tb2RlLW9uY2UgY29tbWFuZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMCAyMzQ1NlxuICAgICAgICAxIDIzNDU2XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcImFjdGl2YXRlIG5vcm1hbCBtb2RlIHdpdGhvdXQgbW92aW5nIGN1cnNvcnMgbGVmdCwgdGhlbiBiYWNrIHRvIGluc2VydC1tb2RlIG9uY2Ugc29tZSBjb21tYW5kIGV4ZWN1dGVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtbycsIGN1cnNvcjogWzAsIDJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMCwgM10sIG1vZGU6ICdpbnNlcnQnXG5cbiAgZGVzY3JpYmUgXCJpbnNlcnQtbW9kZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gZW5zdXJlICdpJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGVmdCB3aGVuIGV4aXRpbmcgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgYXQgdGhlIGJlZ2lubmluZyBvZiBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwibGVhdmVzIHRoZSBjdXJzb3IgYXQgdGhlIGJlZ2lubmluZyBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIGEgbGluZSB3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgaXQgXCJhbGxvd3MgdGhlIGN1cnNvciB0byBiZSBwbGFjZWQgb24gdGhlIFxcbiBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gbm9ybWFsIG1vZGUgd2hlbiA8ZXNjYXBlPiBpcyBwcmVzc2VkXCIsIC0+XG4gICAgICBlc2NhcGUgJ2VzY2FwZScsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGN0cmwtYz4gaXMgcHJlc3NlZFwiLCAtPlxuICAgICAgd2l0aE1vY2tQbGF0Zm9ybSBlZGl0b3JFbGVtZW50LCAncGxhdGZvcm0tZGFyd2luJyAsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1jJywgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUgc2V0dGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnYWJjJ1xuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzAsIDJdXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gZW5hYmxlZCwgY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBvbiBlc2NhcGluZyBpbnNlcnQtbW9kZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScsIHRydWUpXG4gICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBieSByZXNwZWN0aW5nIGxhc3QgY3Vyc29yJ3MgcG9zaXRpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBudW1DdXJzb3JzOiAxLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBieSByZXNwZWN0aW5nIGxhc3QgY3Vyc29yJ3MgcG9zaXRpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbWzAsIDJdLCBbMCwgMV1dXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgbnVtQ3Vyc29yczogMSwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGRpc2FibGVkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJywgZmFsc2UpXG4gICAgICAgIGl0IFwia2VlcCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgbnVtQ3Vyc29yczogMiwgY3Vyc29yOiBbWzAsIDBdLCBbMCwgMV1dXG5cbiAgICBkZXNjcmliZSBcImF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZSBzZXR0aW5nXCIsIC0+XG4gICAgICBbb3RoZXJWaW0sIG90aGVyRWRpdG9yLCBwYW5lXSA9IFtdXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZ2V0VmltU3RhdGUgKG90aGVyVmltU3RhdGUsIF9vdGhlcikgLT5cbiAgICAgICAgICBvdGhlclZpbSA9IF9vdGhlclxuICAgICAgICAgIG90aGVyRWRpdG9yID0gb3RoZXJWaW1TdGF0ZS5lZGl0b3JcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcblxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8ZWRpdG9yLTFcIlxuICAgICAgICAgIG90aGVyVmltLnNldCB0ZXh0QzogXCJ8ZWRpdG9yLTJcIlxuXG4gICAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBvdGhlclZpbS5lbnN1cmUgJ2knLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW0oKSkudG9CZShlZGl0b3IpXG5cbiAgICAgIGRlc2NyaWJlIFwiZGVmYXVsdCBiZWhhdmlvclwiLCAtPlxuICAgICAgICBpdCBcInJlbWFpbiBpbiBpbnNlcnQtbW9kZSBvbiBwYW5lSXRlbSBjaGFuZ2UgYnkgZGVmYXVsdFwiLCAtPlxuXG4gICAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbSgpKS50b0JlKG90aGVyRWRpdG9yKVxuXG4gICAgICAgICAgZW5zdXJlIG51bGwsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgb3RoZXJWaW0uZW5zdXJlIG51bGwsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwiYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlID0gdHJ1ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2UnLCB0cnVlKVxuICAgICAgICAgIGphc21pbmUudXNlUmVhbENsb2NrKClcblxuICAgICAgICBpdCBcImF1dG9tYXRpY2FsbHkgc2hpZnQgdG8gbm9ybWFsIG1vZGUgZXhjZXB0IG5ldyBhY3RpdmUgZWRpdG9yXCIsIC0+XG4gICAgICAgICAgY2FsbGVkID0gZmFsc2VcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gLT4gY2FsbGVkID0gdHJ1ZVxuICAgICAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgY2FsbGVkXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QocGFuZS5nZXRBY3RpdmVJdGVtKCkpLnRvQmUob3RoZXJFZGl0b3IpXG4gICAgICAgICAgICBlbnN1cmUgbnVsbCwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIG90aGVyVmltLmVuc3VyZSBudWxsLCBtb2RlOiAnaW5zZXJ0J1xuXG4gIGRlc2NyaWJlIFwicmVwbGFjZS1tb2RlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGVmdCB3aGVuIGV4aXRpbmcgcmVwbGFjZSBtb2RlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdSIGVzY2FwZScsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgYXQgdGhlIGJlZ2lubmluZyBvZiBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cblxuICAgICAgICBpdCBcImxlYXZlcyB0aGUgY3Vyc29yIGF0IHRoZSBiZWdpbm5pbmcgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIGEgbGluZSB3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgaXQgXCJhbGxvd3MgdGhlIGN1cnNvciB0byBiZSBwbGFjZWQgb24gdGhlIFxcbiBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1InXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGVzY2FwZT4gaXMgcHJlc3NlZFwiLCAtPlxuICAgICAgZW5zdXJlICdSIGVzY2FwZScsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGN0cmwtYz4gaXMgcHJlc3NlZFwiLCAtPlxuICAgICAgd2l0aE1vY2tQbGF0Zm9ybSBlZGl0b3JFbGVtZW50LCAncGxhdGZvcm0tZGFyd2luJyAsIC0+XG4gICAgICAgIGVuc3VyZSAnUiBjdHJsLWMnLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJzaGlmdCBiZXR3ZWVuIGluc2VydCBhbmQgcmVwbGFjZVwiLCAtPlxuICAgICAgc3RhcnRSZXBsYWNlTW9kZSA9IC0+IGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsIFwidmltLW1vZGUtcGx1czphY3RpdmF0ZS1yZXBsYWNlLW1vZGVcIilcbiAgICAgIHN0YXJ0SW5zZXJ0TW9kZSA9IC0+IGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsIFwidmltLW1vZGUtcGx1czphY3RpdmF0ZS1pbnNlcnQtbW9kZVwiKVxuXG4gICAgICBpdCBcIm1vdmUgbGVmdCBvbiBlc2NhcGUgc2luY2UgcmVwbGFjZSBtb2RlIGlzIHN1Ym1vZGUgb2YgaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgIHRleHRDOiBcIjAxMjM0fDVcIlxuICAgICAgICBlbnN1cmUgJ1IgZXNjYXBlJywgdGV4dEM6IFwiMDEyM3w0NVwiLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLCB0ZXh0QzogXCIwMTJ8MzQ1XCIsIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgZW5zdXJlICdSIGVzY2FwZScsIHRleHRDOiBcIjAxfDIzNDVcIiwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICBlbnN1cmUgJ1IgZXNjYXBlJywgdGV4dEM6IFwiMHwxMjM0NVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICAgIGl0IFwiY2FuIGFjdGl2YXRlIHJlcGxhY2UgbXVsdGlwbGUgdGltZXMgYnV0IG1vdmUgbGVmdCBvbmNlIG9uIGVzY2FwZVwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICB0ZXh0QzogXCIwMTIzNHw1XCJcbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogW1wiaW5zZXJ0XCIsIFwicmVwbGFjZVwiXVxuICAgICAgICBzdGFydFJlcGxhY2VNb2RlKClcbiAgICAgICAgZW5zdXJlIG51bGwsIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cbiAgICAgICAgc3RhcnRSZXBsYWNlTW9kZSgpXG4gICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiBbXCJpbnNlcnRcIiwgXCJyZXBsYWNlXCJdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dEM6IFwiMDEyM3w0NVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgICAgIGl0IFwiY2FuIHRvZ2dsZSBiZXR3ZWVuIGluc2VydCBhbmQgcmVwbGFjZVwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiMDEyfDM0NVwiXG5cbiAgICAgICAgc3RhcnRSZXBsYWNlTW9kZSgpOyBlZGl0b3IuaW5zZXJ0VGV4dChcInJcIik7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyfDQ1XCIsIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cbiAgICAgICAgc3RhcnRJbnNlcnRNb2RlKCk7IGVkaXRvci5pbnNlcnRUZXh0KFwiaVwiKTsgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpfDQ1XCIsIG1vZGU6IFtcImluc2VydFwiLCB1bmRlZmluZWRdXG4gICAgICAgIHN0YXJ0UmVwbGFjZU1vZGUoKTsgZWRpdG9yLmluc2VydFRleHQoXCJyXCIpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycmlyfDVcIiwgbW9kZTogW1wiaW5zZXJ0XCIsIFwicmVwbGFjZVwiXVxuXG4gICAgICBpdCBcImNhbiB0b2dnbGUgYmV0d2VlbiBpbnNlcnQgYW5kIHJlcGxhY2UgYnkgdG9nZ2xlLXJlcGxhY2UtbW9kZSBjb21tYW5kXCIsIC0+XG4gICAgICAgIHRvZ2dsZSA9IC0+IGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1yZXBsYWNlLW1vZGUnKVxuICAgICAgICBpbnNlcnRUZXh0ID0gKHRleHQpIC0+IGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbiAgICAgICAgc2V0IHRleHRDOiBcIjAxMnwzNDVcIlxuICAgICAgICBzdGFydEluc2VydE1vZGUoKVxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEyfDM0NVwiLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgICAgdG9nZ2xlKCk7IGluc2VydFRleHQoXCJyXCIpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycnw0NVwiLCAgbW9kZTogW1wiaW5zZXJ0XCIsIFwicmVwbGFjZVwiXVxuICAgICAgICB0b2dnbGUoKTsgaW5zZXJ0VGV4dChcImlcIik7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXw0NVwiLCBtb2RlOiBbXCJpbnNlcnRcIiwgdW5kZWZpbmVkXVxuICAgICAgICB0b2dnbGUoKTsgaW5zZXJ0VGV4dChcInJcIik7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXJ8NVwiLCBtb2RlOiBbXCJpbnNlcnRcIiwgXCJyZXBsYWNlXCJdXG4gICAgICAgIHRvZ2dsZSgpOyAgICAgICAgICAgICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXJ8NVwiLCBtb2RlOiBbXCJpbnNlcnRcIiwgdW5kZWZpbmVkXVxuICAgICAgICB0b2dnbGUoKTsgICAgICAgICAgICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycmlyfDVcIiwgbW9kZTogW1wiaW5zZXJ0XCIsIFwicmVwbGFjZVwiXVxuICAgICAgICB0b2dnbGUoKTsgICAgICAgICAgICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycmlyfDVcIiwgbW9kZTogW1wiaW5zZXJ0XCIsIHVuZGVmaW5lZF1cbiAgICAgICAgdG9nZ2xlKCk7ICAgICAgICAgICAgICAgICAgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpcnw1XCIsIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cblxuICAgICAgICAjIERvIG5vdGhpbmcgaWYgbm90IGFscmVhZHkgaW4gaW5zZXJ0LW1vZGVcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHRDOiBcIjAxMnJpfHI1XCIsIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgdG9nZ2xlKCk7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXxyNVwiLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIHRvZ2dsZSgpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycml8cjVcIiwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICB0b2dnbGUoKTsgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpfHI1XCIsIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgdG9nZ2xlKCk7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXxyNVwiLCBtb2RlOiBcIm5vcm1hbFwiXG5cbiAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb25lIHR3byB0aHJlZVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAndidcblxuICAgIGl0IFwic2VsZWN0cyB0aGUgY2hhcmFjdGVyIHVuZGVyIHRoZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDRdLCBbMCwgNV1dXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJ3QnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGVzY2FwZT4gaXMgcHJlc3NlZFwiLCAtPlxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxlc2NhcGU+IGlzIHByZXNzZWQgb24gc2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICBlbnN1cmUgbnVsbCwgc2VsZWN0ZWRUZXh0OiAndCdcbiAgICAgIGVuc3VyZSAnaCBoJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiAnZSB0J1xuICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcIm1vdGlvbnNcIiwgLT5cbiAgICAgIGl0IFwidHJhbnNmb3JtcyB0aGUgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndycsIHNlbGVjdGVkVGV4dDogJ3R3byB0J1xuXG4gICAgICBpdCBcImFsd2F5cyBsZWF2ZXMgdGhlIGluaXRpYWxseSBzZWxlY3RlZCBjaGFyYWN0ZXIgc2VsZWN0ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdoJywgc2VsZWN0ZWRUZXh0OiAnIHQnXG4gICAgICAgIGVuc3VyZSAnbCcsIHNlbGVjdGVkVGV4dDogJ3QnXG4gICAgICAgIGVuc3VyZSAnbCcsIHNlbGVjdGVkVGV4dDogJ3R3J1xuXG4gICAgZGVzY3JpYmUgXCJvcGVyYXRvcnNcIiwgLT5cbiAgICAgIGl0IFwib3BlcmF0ZSBvbiB0aGUgY3VycmVudCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnViBkJywgdGV4dDogXCJcXG5hYmNkZWZcIlxuXG4gICAgZGVzY3JpYmUgXCJyZXR1cm5pbmcgdG8gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgIGl0IFwib3BlcmF0ZSBvbiB0aGUgY3VycmVudCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCJcbiAgICAgICAgZW5zdXJlICdWIGVzY2FwZScsIHNlbGVjdGVkVGV4dDogJydcblxuICAgIGRlc2NyaWJlIFwidGhlIG8ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJyZXZlcnNlZCBlYWNoIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgYWRkQ3Vyc29yOiBbMCwgMTJdXG4gICAgICAgIGVuc3VyZSAnaSB3JyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcInR3b1wiLCBcInRocmVlXCJdXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgZW5zdXJlICdvJyxcbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG5cbiAgICAgIHhpdCBcImhhcm1vbml6ZXMgc2VsZWN0aW9uIGRpcmVjdGlvbnNcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZSBlJ1xuICAgICAgICBzZXQgYWRkQ3Vyc29yOiBbMCwgSW5maW5pdHldXG4gICAgICAgIGVuc3VyZSAnaCBoJyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDBdLCBbMCwgNV1dLFxuICAgICAgICAgICAgW1swLCAxMV0sIFswLCAxM11dXG4gICAgICAgICAgXVxuICAgICAgICAgIGN1cnNvcjogW1xuICAgICAgICAgICAgWzAsIDVdXG4gICAgICAgICAgICBbMCwgMTFdXG4gICAgICAgICAgXVxuXG4gICAgICAgIGVuc3VyZSAnbycsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1xuICAgICAgICAgICAgW1swLCAwXSwgWzAsIDVdXSxcbiAgICAgICAgICAgIFtbMCwgMTFdLCBbMCwgMTNdXVxuICAgICAgICAgIF1cbiAgICAgICAgICBjdXJzb3I6IFtcbiAgICAgICAgICAgIFswLCA1XVxuICAgICAgICAgICAgWzAsIDEzXVxuICAgICAgICAgIF1cblxuICAgIGRlc2NyaWJlIFwiYWN0aXZhdGUgdmlzdWFsbW9kZSB3aXRoaW4gdmlzdWFsbW9kZVwiLCAtPlxuICAgICAgY3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGN1cnNvclBvc2l0aW9uID0gWzAsIDRdXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgbGluZSBvbmVcbiAgICAgICAgICAgIGxpbmUgdHdvXG4gICAgICAgICAgICBsaW5lIHRocmVlXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IGN1cnNvclBvc2l0aW9uXG5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcInJlc3RvcmUgY2hhcmFjdGVyd2lzZSBmcm9tIGxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJzIgaiBWJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGxpbmUgb25lXG4gICAgICAgICAgICAgIGxpbmUgdHdvXG4gICAgICAgICAgICAgIGxpbmUgdGhyZWVcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiBmYWxzZVxuICAgICAgICAgIGVuc3VyZSAnbycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBsaW5lIG9uZVxuICAgICAgICAgICAgICBsaW5lIHR3b1xuICAgICAgICAgICAgICBsaW5lIHRocmVlXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICAgIGl0IFwidiBhZnRlciBvXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgb25lXFxubGluZSB0d29cXG5saW5lIFwiXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgICAgaXQgXCJlc2NhcGUgYWZ0ZXIgb1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcImFjdGl2YXRlVmlzdWFsTW9kZSB3aXRoIHNhbWUgdHlwZSBwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZVwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImNoYXJhY3Rlcndpc2U6IHZ2XCIsIC0+XG4gICAgICAgICAgaXQgXCJhY3RpdmF0aW5nIHR3aWNlIG1ha2UgZWRpdG9yIHJldHVybiB0byBub3JtYWwgbW9kZSBcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgICAgZW5zdXJlICd2JywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogY3Vyc29yUG9zaXRpb25cblxuICAgICAgICBkZXNjcmliZSBcImxpbmV3aXNlOiBWVlwiLCAtPlxuICAgICAgICAgIGl0IFwiYWN0aXZhdGluZyB0d2ljZSBtYWtlIGVkaXRvciByZXR1cm4gdG8gbm9ybWFsIG1vZGUgXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ1YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgICBlbnN1cmUgJ1YnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBjdXJzb3JQb3NpdGlvblxuXG4gICAgICAgIGRlc2NyaWJlIFwiYmxvY2t3aXNlOiBjdHJsLXYgdHdpY2VcIiwgLT5cbiAgICAgICAgICBpdCBcImFjdGl2YXRpbmcgdHdpY2UgbWFrZSBlZGl0b3IgcmV0dXJuIHRvIG5vcm1hbCBtb2RlIFwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBjdXJzb3JQb3NpdGlvblxuXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSBzdWJtb2RlIHdpdGhpbiB2aXN1YWxtb2RlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwibGluZSBvbmVcXG5saW5lIHR3b1xcbmxpbmUgdGhyZWVcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbWzAsIDVdLCBbMiwgNV1dXG5cbiAgICAgICAgaXQgXCJjYW4gY2hhbmdlIHN1Ym1vZGUgd2l0aGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2JyAgICAgICAgLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ1YnICAgICAgICAsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgZW5zdXJlICd2JyAgICAgICAgLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBpdCBcInJlY292ZXIgb3JpZ2luYWwgcmFuZ2Ugd2hlbiBzaGlmdCBmcm9tIGxpbmV3aXNlIHRvIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgaSB3Jywgc2VsZWN0ZWRUZXh0OiBbJ29uZScsICd0aHJlZSddXG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiBbXCJsaW5lIG9uZVxcblwiLCBcImxpbmUgdGhyZWVcXG5cIl1cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBzZWxlY3RlZFRleHQ6IFtcIm9uZVwiLCBcInRocmVlXCJdXG5cbiAgICAgIGRlc2NyaWJlIFwia2VlcCBnb2FsQ29sdW0gd2hlbiBzdWJtb2RlIGNoYW5nZSBpbiB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICB0ZXh0ID0gbnVsbFxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAwXzM0NTY3ODkwQUJDREVGXG4gICAgICAgICAgMV8zNDU2Nzg5MFxuICAgICAgICAgIDJfMzQ1NjdcbiAgICAgICAgICAzXzM0NTY3ODkwQVxuICAgICAgICAgIDRfMzQ1Njc4OTBBQkNERUZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHRleHQuZ2V0UmF3KClcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgaXQgXCJrZWVwIGdvYWxDb2x1bW4gd2hlbiBzaGlmdCBsaW5ld2lzZSB0byBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdWJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswXSksIHByb3BlcnR5SGVhZDogWzAsIDBdLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICckJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswXSksIHByb3BlcnR5SGVhZDogWzAsIDE2XSwgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMCwgMV0pLCBwcm9wZXJ0eUhlYWQ6IFsxLCAxMF0sIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKSwgcHJvcGVydHlIZWFkOiBbMiwgN10sIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKSwgcHJvcGVydHlIZWFkOiBbMiwgN10sIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uM10pLCBwcm9wZXJ0eUhlYWQ6IFszLCAxMV0sIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSAndicsIGN1cnNvcjogWzMsIDEwXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFs0LCAxNV0sIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcImRlYWN0aXZhdGluZyB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgbGluZSBvbmVcbiAgICAgICAgICAgIGxpbmUgdHdvXG4gICAgICAgICAgICBsaW5lIHRocmVlXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA3XVxuICAgICAgaXQgXCJjYW4gcHV0IGN1cnNvciBhdCBpbiB2aXN1YWwgY2hhciBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGl0IFwiYWRqdXN0IGN1cnNvciBwb3NpdGlvbiAxIGNvbHVtbiBsZWZ0IHdoZW4gZGVhY3RpdmF0ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGVzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgaXQgXCJjYW4gc2VsZWN0IG5ldyBsaW5lIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndicsIGN1cnNvcjogWzAsIDhdLCBwcm9wZXJ0eUhlYWQ6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFsxLCAwXSwgcHJvcGVydHlIZWFkOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMCwgN11cblxuICAgIGRlc2NyaWJlIFwiZGVhY3RpdmF0aW5nIHZpc3VhbCBtb2RlIG9uIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDA6IGFiY1xuXG4gICAgICAgICAgICAyOiBhYmNcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcInYgY2FzZS0xXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwidiBjYXNlLTIgc2VsZWN0aW9uIGhlYWQgaXMgYmxhbmsgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICd2IGonLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzIsIDBdLCBzZWxlY3RlZFRleHQ6IFwiOiBhYmNcXG5cXG5cIlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJWIGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJWIGNhc2UtMiBzZWxlY3Rpb24gaGVhZCBpcyBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ1YgaicsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ10sIGN1cnNvcjogWzIsIDBdLCBzZWxlY3RlZFRleHQ6IFwiMDogYWJjXFxuXFxuXCJcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwiY3RybC12XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC12JywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ10sIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMSwgMF0sIFsxLCAwXV1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwiY3RybC12IGFuZCBtb3ZlIG92ZXIgZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddLCBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1sxLCAwXSwgWzEsIDBdXVxuICAgICAgICBlbnN1cmUgJ2snLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXSwgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtbWzAsIDBdLCBbMCwgMV1dLCBbWzEsIDBdLCBbMSwgMF1dXVxuICAgICAgICBlbnN1cmUgJ2onLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXSwgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtbMSwgMF0sIFsxLCAwXV1cbiAgICAgICAgZW5zdXJlICdqJywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ10sIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiBbW1sxLCAwXSwgWzEsIDBdXSwgW1syLCAwXSwgWzIsIDFdXV1cblxuICBkZXNjcmliZSBcIm1hcmtzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBzZXQgdGV4dDogXCJ0ZXh0IGluIGxpbmUgMVxcbnRleHQgaW4gbGluZSAyXFxudGV4dCBpbiBsaW5lIDNcIlxuXG4gICAgaXQgXCJiYXNpYyBtYXJraW5nIGZ1bmN0aW9uYWxpdHlcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZVdhaXQgJ20gdCdcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGVuc3VyZSAnYCB0JywgY3Vyc29yOiBbMSwgMV1cblxuICAgIGl0IFwicmVhbCAodHJhY2tpbmcpIG1hcmtpbmcgZnVuY3Rpb25hbGl0eVwiLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZW5zdXJlV2FpdCAnbSBxJ1xuICAgICAgcnVucyAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICdvIGVzY2FwZSBgIHEnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgaXQgXCJyZWFsICh0cmFja2luZykgbWFya2luZyBmdW5jdGlvbmFsaXR5XCIsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBlbnN1cmVXYWl0ICdtIHEnXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ2QgZCBlc2NhcGUgYCBxJywgY3Vyc29yOiBbMSwgMl1cblxuICBkZXNjcmliZSBcImlzLW5hcnJvd2VkIGF0dHJpYnV0ZVwiLCAtPlxuICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSA9IC0+XG4gICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiBmYWxzZVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMTotLS0tLVxuICAgICAgICAyOi0tLS0tXG4gICAgICAgIDM6LS0tLS1cbiAgICAgICAgNDotLS0tLVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwibm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgIGl0IFwiaXMgbm90IG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgIG1vZGU6IFsnbm9ybWFsJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiBmYWxzZVxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgaXQgXCJbc2luZ2xlIHJvd10gaXMgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2ICQnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJzE6LS0tLS1cXG4nXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogZmFsc2VcbiAgICAgICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlKClcbiAgICAgIGl0IFwiW211bHRpLXJvd10gaXMgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGonLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgMTotLS0tLVxuICAgICAgICAgIDJcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiB0cnVlXG4gICAgICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSgpXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5saW5ld2lzZVwiLCAtPlxuICAgICAgaXQgXCJbc2luZ2xlIHJvd10gaXMgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdWJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMTotLS0tLVxcblwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IGZhbHNlXG4gICAgICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSgpXG4gICAgICBpdCBcIlttdWx0aS1yb3ddIGlzIG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnViBqJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDE6LS0tLS1cbiAgICAgICAgICAyOi0tLS0tXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IHRydWVcbiAgICAgICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlKClcbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmJsb2Nrd2lzZVwiLCAtPlxuICAgICAgaXQgXCJbc2luZ2xlIHJvd10gaXMgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLXYgbCcsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjE6XCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IGZhbHNlXG4gICAgICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSgpXG4gICAgICBpdCBcIlttdWx0aS1yb3ddIGlzIG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC12IGwgaicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCIxOlwiLCBcIjI6XCJdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiB0cnVlXG4gICAgICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSgpXG4iXX0=
