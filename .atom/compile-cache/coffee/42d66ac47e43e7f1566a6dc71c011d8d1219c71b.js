(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Occurrence", function() {
    var classList, dispatchSearchCommand, editor, editorElement, ensure, ensureWait, inputSearchText, ref1, ref2, searchEditor, searchEditorElement, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], classList = ref1[6];
    ref2 = [], searchEditor = ref2[0], searchEditorElement = ref2[1];
    inputSearchText = function(text) {
      return searchEditor.insertText(text);
    };
    dispatchSearchCommand = function(name) {
      return dispatch(searchEditorElement, name);
    };
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait;
        classList = editorElement.classList;
        searchEditor = vimState.searchInput.editor;
        return searchEditorElement = vimState.searchInput.editorElement;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("operator-modifier-occurrence", function() {
      beforeEach(function() {
        return set({
          text: "\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
        });
      });
      describe("o modifier", function() {
        return it("change occurrence of cursor word in inner-paragraph", function() {
          set({
            cursor: [1, 0]
          });
          ensure("c o i p", {
            mode: 'insert',
            textC: "\n!: xxx: |:\n---: |: xxx: |:\n|: xxx: ---: xxx: |:\nxxx: ---: |: |:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          editor.insertText('===');
          ensure("escape", {
            mode: 'normal',
            textC: "\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          return ensure("} j .", {
            mode: 'normal',
            textC: "\n===: xxx: ===:\n---: ===: xxx: ===:\n===: xxx: ---: xxx: ===:\nxxx: ---: ===: ===:\n\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n"
          });
        });
      });
      describe("O modifier", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return it("delete subword-occurrence in paragraph and repeatable", function() {
          ensure("d O p", {
            textC: "\ncamel| Cases\n\"Study\" Snake\nUP_CASE\n\nother ParagraphCase"
          });
          return ensure("G .", {
            textC: "\ncamel Cases\n\"Study\" Snake\nUP_CASE\n\nother| Paragraph"
          });
        });
      });
      describe("apply various operator to occurrence in various target", function() {
        beforeEach(function() {
          return set({
            textC: "ooo: xxx: o!oo:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
        });
        it("upper case inner-word", function() {
          ensure("g U o i l", {
            textC: "OOO: xxx: O!OO:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
          ensure("2 j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: =!==: xxx: OOO:\nxxx: ===: ooo: ooo:"
          });
          return ensure("j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: ===: xxx: OOO:\nxxx: ===: O!OO: OOO:"
          });
        });
        return describe("clip to mutation end behavior", function() {
          beforeEach(function() {
            return set({
              textC: "\noo|o:xxx:ooo:\nxxx:ooo:xxx\n\n"
            });
          });
          it("[d o p] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o p", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          it("[d o j] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o j", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          return it("not clip if original cursor not intersects any occurence-marker", function() {
            ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo'],
              cursor: [1, 2]
            });
            ensure('j', {
              cursor: [2, 2]
            });
            return ensure("d p", {
              textC: "\n:xxx::\nxx|x::xxx\n\n"
            });
          });
        });
      });
      describe("auto extend target range to include occurrence", function() {
        var textFinal, textOriginal;
        textOriginal = "This text have 3 instance of 'text' in the whole text.\n";
        textFinal = textOriginal.replace(/text/g, '');
        beforeEach(function() {
          return set({
            text: textOriginal
          });
        });
        it("[from start of 1st]", function() {
          set({
            cursor: [0, 5]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from middle of 1st]", function() {
          set({
            cursor: [0, 7]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from end of last]", function() {
          set({
            cursor: [0, 52]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
        return it("[from middle of last]", function() {
          set({
            cursor: [0, 51]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
      });
      return describe("select-occurrence", function() {
        beforeEach(function() {
          return set({
            text: "vim-mode-plus vim-mode-plus"
          });
        });
        return describe("what the cursor-word", function() {
          var ensureCursorWord;
          ensureCursorWord = function(initialPoint, arg) {
            var selectedText;
            selectedText = arg.selectedText;
            set({
              cursor: initialPoint
            });
            ensure("g cmd-d i p", {
              selectedText: selectedText,
              mode: ['visual', 'characterwise']
            });
            return ensure("escape", {
              mode: "normal"
            });
          };
          describe("cursor is on normal word", function() {
            return it("pick word but not pick partially matched one [by select]", function() {
              ensureCursorWord([0, 0], {
                selectedText: ['vim', 'vim']
              });
              ensureCursorWord([0, 3], {
                selectedText: ['-', '-', '-', '-']
              });
              ensureCursorWord([0, 4], {
                selectedText: ['mode', 'mode']
              });
              return ensureCursorWord([0, 9], {
                selectedText: ['plus', 'plus']
              });
            });
          });
          describe("cursor is at single white space [by delete]", function() {
            return it("pick single white space only", function() {
              set({
                text: "ooo ooo ooo\n ooo ooo ooo",
                cursor: [0, 3]
              });
              return ensure("d o i p", {
                text: "ooooooooo\nooooooooo"
              });
            });
          });
          return describe("cursor is at sequnce of space [by delete]", function() {
            return it("select sequnce of white spaces including partially mached one", function() {
              set({
                cursor: [0, 3],
                text_: "ooo___ooo ooo\n ooo ooo____ooo________ooo"
              });
              return ensure("d o i p", {
                text_: "oooooo ooo\n ooo ooo ooo  ooo"
              });
            });
          });
        });
      });
    });
    describe("stayOnOccurrence settings", function() {
      beforeEach(function() {
        return set({
          textC: "\naaa, bbb, ccc\nbbb, a|aa, aaa\n"
        });
      });
      describe("when true (= default)", function() {
        return it("keep cursor position after operation finished", function() {
          return ensure('g U o p', {
            textC: "\nAAA, bbb, ccc\nbbb, A|AA, AAA\n"
          });
        });
      });
      return describe("when false", function() {
        beforeEach(function() {
          return settings.set('stayOnOccurrence', false);
        });
        return it("move cursor to start of target as like non-ocurrence operator", function() {
          return ensure('g U o p', {
            textC: "\n|AAA, bbb, ccc\nbbb, AAA, AAA\n"
          });
        });
      });
    });
    describe("from visual-mode.is-narrowed", function() {
      beforeEach(function() {
        return set({
          text: "ooo: xxx: ooo\n|||: ooo: xxx: ooo\nooo: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
          cursor: [0, 0]
        });
      });
      describe("[vC] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("v 2 j cmd-d", {
            selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "OOO: xxx: OOO\n|||: OOO: xxx: OOO\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 5,
            mode: 'normal'
          });
        });
      });
      describe("[vL] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("5 l V 2 j cmd-d", {
            selectedText: ['xxx', 'xxx', 'xxx', 'xxx'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "ooo: XXX: ooo\n|||: ooo: XXX: ooo\nooo: XXX: |||: XXX: ooo\nxxx: |||: ooo: ooo",
            numCursors: 4,
            mode: 'normal'
          });
        });
      });
      return describe("[vB] select-occurrence", function() {
        it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("W ctrl-v 2 j $ h cmd-d U", {
            text: "ooo: xxx: OOO\n|||: OOO: xxx: OOO\nooo: xxx: |||: xxx: OOO\nxxx: |||: ooo: ooo",
            numCursors: 4
          });
        });
        return it("pick cursor-word from vB range", function() {
          return ensure("ctrl-v 7 l 2 j o cmd-d U", {
            text: "OOO: xxx: ooo\n|||: OOO: xxx: ooo\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 3
          });
        });
      });
    });
    describe("incremental search integration: change-occurrence-from-search, select-occurrence-from-search", function() {
      beforeEach(function() {
        settings.set('incrementalSearch', true);
        return set({
          text: "ooo: xxx: ooo: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:",
          cursor: [0, 0]
        });
      });
      describe("from normal mode", function() {
        it("select occurrence by pattern match", function() {
          ensure('/');
          inputSearchText('\\d{3,4}');
          dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
          return ensure('i e', {
            selectedText: ['3333', '444', '0000'],
            mode: ['visual', 'characterwise']
          });
        });
        return it("change occurrence by pattern match", function() {
          ensure('/');
          inputSearchText('^\\w+:');
          dispatchSearchCommand('vim-mode-plus:change-occurrence-from-search');
          ensure('i e', {
            mode: 'insert'
          });
          editor.insertText('hello');
          return ensure(null, {
            text: "hello xxx: ooo: 0000\nhello ooo: 22: ooo:\nhello xxx: |||: xxx: 3333:\nhello |||: ooo: ooo:"
          });
        });
      });
      describe("from visual mode", function() {
        describe("visual characterwise", function() {
          return it("change occurrence in narrowed selection", function() {
            ensure('v j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        describe("visual linewise", function() {
          return it("change occurrence in narrowed selection", function() {
            ensure('V j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        return describe("visual blockwise", function() {
          return it("change occurrence in narrowed selection", function() {
            set({
              cursor: [0, 5]
            });
            ensure('ctrl-v 2 j 1 0 l /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
      });
      describe("persistent-selection is exists", function() {
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:create-persistent-selection'
            }
          });
          set({
            text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n",
            cursor: [0, 0]
          });
          return ensure('V j m G m m', {
            persistentSelectionBufferRange: [[[0, 0], [2, 0]], [[3, 0], [4, 0]]]
          });
        });
        describe("when no selection is exists", function() {
          return it("select occurrence in all persistent-selection", function() {
            set({
              cursor: [0, 0]
            });
            ensure('/');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: xxx: |||: xxx: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
        return describe("when both exits, operator applied to both", function() {
          return it("select all occurrence in selection", function() {
            set({
              cursor: [0, 0]
            });
            ensure('V 2 j /');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: XXX: |||: XXX: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
      });
      return describe("demonstrate persistent-selection's practical scenario", function() {
        var oldGrammar;
        oldGrammar = [][0];
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:toggle-persistent-selection'
            }
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          runs(function() {
            oldGrammar = editor.getGrammar();
            return editor.setGrammar(atom.grammars.grammarForScopeName('source.coffee'));
          });
          return set({
            text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement = @editor.element\n  @emitter = new Emitter\n  @subscriptions = new CompositeDisposable\n  @modeManager = new ModeManager(this)\n  @mark = new MarkManager(this)\n  @register = new RegisterManager(this)\n  @persistentSelections = []\n\n  @highlightSearchSubscription = @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack = new OperationStack(this)\n  @cursorStyleManager = new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
          });
        });
        return it('change all assignment("=") of current-function to "?="', function() {
          set({
            cursor: [0, 0]
          });
          ensure('j f =', {
            cursor: [1, 17]
          });
          runs(function() {
            var _keystroke, textsInBufferRange, textsInBufferRangeIsAllEqualChar;
            _keystroke = ['g cmd-d', 'i f', 'm'].join(" ");
            ensure(_keystroke);
            textsInBufferRange = vimState.persistentSelection.getMarkerBufferRanges().map(function(range) {
              return editor.getTextInBufferRange(range);
            });
            textsInBufferRangeIsAllEqualChar = textsInBufferRange.every(function(text) {
              return text === '=';
            });
            expect(textsInBufferRangeIsAllEqualChar).toBe(true);
            expect(vimState.persistentSelection.getMarkers()).toHaveLength(11);
            ensure('2 l');
            ensure('/ => enter', {
              cursor: [9, 69]
            });
            ensure("m");
            return expect(vimState.persistentSelection.getMarkers()).toHaveLength(10);
          });
          waitsFor(function() {
            return classList.contains('has-persistent-selection');
          });
          return runs(function() {
            ensure("ctrl-cmd-g I");
            editor.insertText('?');
            return ensure('escape', {
              text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement ?= @editor.element\n  @emitter ?= new Emitter\n  @subscriptions ?= new CompositeDisposable\n  @modeManager ?= new ModeManager(this)\n  @mark ?= new MarkManager(this)\n  @register ?= new RegisterManager(this)\n  @persistentSelections ?= []\n\n  @highlightSearchSubscription ?= @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack ?= new OperationStack(this)\n  @cursorStyleManager ?= new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
            });
          });
        });
      });
    });
    describe("preset occurrence marker", function() {
      beforeEach(function() {
        return set({
          text: "This text have 3 instance of 'text' in the whole text",
          cursor: [0, 0]
        });
      });
      describe("toggle-preset-occurrence commands", function() {
        describe("in normal-mode", function() {
          describe("add preset occurrence", function() {
            return it('set cursor-ward as preset occurrence marker and not move cursor', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              return ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
            });
          });
          describe("remove preset occurrence", function() {
            it('removes occurrence one by one separately', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('b g o', {
                occurrenceText: ['text', 'text'],
                cursor: [0, 0]
              });
            });
            it('removes all occurrence in this editor by escape', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('escape', {
                occurrenceCount: 0
              });
            });
            return it('can recall previously set occurence pattern by `g .`', function() {
              ensure('w v l g o', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 6]
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
              ensure('w', {
                cursor: [0, 10]
              });
              ensure('g .', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 10]
              });
              ensure('g U o $', {
                textC: "This text |HAVE 3 instance of 'text' in the whole text"
              });
              return expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
            });
          });
          describe("restore last occurrence marker by add-preset-occurrence-from-last-occurrence-pattern", function() {
            beforeEach(function() {
              return set({
                textC: "camel\ncamelCase\ncamels\ncamel"
              });
            });
            it("can restore occurrence-marker added by `g o` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel']
              });
            });
            it("can restore occurrence-marker added by `g o` in visual-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("v i w", {
                selectedText: "camel"
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
            });
            return it("can restore occurrence-marker added by `g O` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g O", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
            });
          });
          return describe("css class has-occurrence", function() {
            describe("manually toggle by toggle-preset-occurrence command", function() {
              return it('is auto-set/unset wheter at least one preset-occurrence was exists or not', function() {
                expect(classList.contains('has-occurrence')).toBe(false);
                ensure('g o', {
                  occurrenceText: 'This',
                  cursor: [0, 0]
                });
                expect(classList.contains('has-occurrence')).toBe(true);
                ensure('g o', {
                  occurrenceCount: 0,
                  cursor: [0, 0]
                });
                return expect(classList.contains('has-occurrence')).toBe(false);
              });
            });
            return describe("change 'INSIDE' of marker", function() {
              var markerLayerUpdated;
              markerLayerUpdated = null;
              beforeEach(function() {
                return markerLayerUpdated = false;
              });
              return it('destroy marker and reflect to "has-occurrence" CSS', function() {
                runs(function() {
                  expect(classList.contains('has-occurrence')).toBe(false);
                  ensure('g o', {
                    occurrenceText: 'This',
                    cursor: [0, 0]
                  });
                  expect(classList.contains('has-occurrence')).toBe(true);
                  ensure('l i', {
                    mode: 'insert'
                  });
                  vimState.occurrenceManager.markerLayer.onDidUpdate(function() {
                    return markerLayerUpdated = true;
                  });
                  editor.insertText('--');
                  return ensure("escape", {
                    textC: "T-|-his text have 3 instance of 'text' in the whole text",
                    mode: 'normal'
                  });
                });
                waitsFor(function() {
                  return markerLayerUpdated;
                });
                return runs(function() {
                  ensure(null, {
                    occurrenceCount: 0
                  });
                  return expect(classList.contains('has-occurrence')).toBe(false);
                });
              });
            });
          });
        });
        describe("in visual-mode", function() {
          describe("add preset occurrence", function() {
            return it('set selected-text as preset occurrence marker and not move cursor', function() {
              ensure('w v l', {
                mode: ['visual', 'characterwise'],
                selectedText: 'te'
              });
              return ensure('g o', {
                mode: 'normal',
                occurrenceText: ['te', 'te', 'te']
              });
            });
          });
          return describe("is-narrowed selection", function() {
            var textOriginal;
            textOriginal = [][0];
            beforeEach(function() {
              textOriginal = "This text have 3 instance of 'text' in the whole text\nThis text have 3 instance of 'text' in the whole text\n";
              return set({
                cursor: [0, 0],
                text: textOriginal
              });
            });
            return it("pick ocurrence-word from cursor position and continue visual-mode", function() {
              ensure('w V j', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal
              });
              ensure('g o', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal,
                occurrenceText: ['text', 'text', 'text', 'text', 'text', 'text']
              });
              return ensureWait('r !', {
                mode: 'normal',
                text: "This !!!! have 3 instance of '!!!!' in the whole !!!!\nThis !!!! have 3 instance of '!!!!' in the whole !!!!\n"
              });
            });
          });
        });
        return describe("in incremental-search", function() {
          beforeEach(function() {
            return settings.set('incrementalSearch', true);
          });
          return describe("add-occurrence-pattern-from-search", function() {
            return it('mark as occurrence which matches regex entered in search-ui', function() {
              ensure('/');
              inputSearchText('\\bt\\w+');
              dispatchSearchCommand('vim-mode-plus:add-occurrence-pattern-from-search');
              return ensure(null, {
                occurrenceText: ['text', 'text', 'the', 'text']
              });
            });
          });
        });
      });
      describe("mutate preset occurrence", function() {
        beforeEach(function() {
          set({
            text: "ooo: xxx: ooo xxx: ooo:\n!!!: ooo: xxx: ooo xxx: ooo:"
          });
          return {
            cursor: [0, 0]
          };
        });
        describe("normal-mode", function() {
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            return ensure('l g o D', {
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[upcase] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l g o g U j', {
              text: "ooo: XXX: ooo XXX: ooo:\n!!!: ooo: XXX: ooo XXX: ooo:"
            });
          });
          it('[upcase exclude] won\'t mutate removed marker', function() {
            set({
              cursor: [0, 0]
            });
            ensure('g o', {
              occurrenceCount: 6
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('g U j', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: OOO: xxx: OOO xxx: OOO:"
            });
          });
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 10]
            });
            return ensure('g o g U $', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[change] apply operation to preset-marker intersecting selected target', function() {
            ensure('l g o C', {
              mode: 'insert',
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
            editor.insertText('YYY');
            return ensure('l g o C', {
              mode: 'insert',
              text: "YYY: xxx: YYY xxx: YYY:\n!!!: ooo: xxx: ooo xxx: ooo:",
              numCursors: 3
            });
          });
          return describe("predefined keymap on when has-occurrence", function() {
            beforeEach(function() {
              return set({
                textC: "Vim is editor I used before\nV|im is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            it('[insert-at-start] apply operation to preset-marker intersecting selected target', function() {
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v k I', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText("pure-");
              return ensure('escape', {
                mode: 'normal',
                textC: "pure!-Vim is editor I used before\npure|-Vim is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            return it('[insert-after-start] apply operation to preset-marker intersecting selected target', function() {
              set({
                cursor: [1, 1]
              });
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v j A', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText(" and Emacs");
              return ensure('escape', {
                mode: 'normal',
                textC: "Vim is editor I used before\nVim and Emac|s is editor I used before\nVim and Emac!s is editor I used before\nVim is editor I used before"
              });
            });
          });
        });
        describe("visual-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              textC: "ooo: x|xx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('v j U', {
              text: "ooo: XXX: ooo XXX: ooo:\nXXX: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        describe("visual-linewise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('V U', {
              text: "ooo: XXX: ooo XXX: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        return describe("visual-blockwise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('ctrl-v j 2 w U', {
              text: "ooo: XXX: ooo xxx: ooo:\nxxx: ooo: XXX: ooo xxx: ooo:"
            });
          });
        });
      });
      describe("MoveToNextOccurrence, MoveToPreviousOccurrence", function() {
        beforeEach(function() {
          set({
            textC: "|ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
          });
          return ensure('g o', {
            occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo']
          });
        });
        describe("tab, shift-tab", function() {
          describe("cursor is at start of occurrence", function() {
            return it("search next/previous occurrence marker", function() {
              ensure('tab tab', {
                cursor: [1, 5]
              });
              ensure('2 tab', {
                cursor: [2, 10]
              });
              ensure('2 shift-tab', {
                cursor: [1, 5]
              });
              return ensure('2 shift-tab', {
                cursor: [0, 0]
              });
            });
          });
          return describe("when cursor is inside of occurrence", function() {
            beforeEach(function() {
              ensure("escape", {
                occurrenceCount: 0
              });
              set({
                textC: "oooo oo|oo oooo"
              });
              return ensure('g o', {
                occurrenceCount: 3
              });
            });
            describe("tab", function() {
              return it("move to next occurrence", function() {
                return ensure('tab', {
                  textC: 'oooo oooo |oooo'
                });
              });
            });
            return describe("shift-tab", function() {
              return it("move to previous occurrence", function() {
                return ensure('shift-tab', {
                  textC: '|oooo oooo oooo'
                });
              });
            });
          });
        });
        describe("as operator's target", function() {
          describe("tab", function() {
            it("operate on next occurrence and repeatable", function() {
              ensure("g U tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
            return it("[o-modifier] operate on next occurrence and repeatable", function() {
              ensure("escape", {
                mode: 'normal',
                occurrenceCount: 0
              });
              ensure("g U o tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              return ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
            });
          });
          return describe("shift-tab", function() {
            return it("operate on next previous and repeatable", function() {
              set({
                cursor: [2, 10]
              });
              ensure("g U shift-tab", {
                text: "ooo: xxx: ooo\n___: ooo: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "ooo: xxx: ooo\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
          });
        });
        describe("excude particular occurence by `.` repeat", function() {
          it("clear preset-occurrence and move to next", function() {
            return ensure('2 tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: |ooo: xxx:\nOOO: xxx: OOO:"
            });
          });
          return it("clear preset-occurrence and move to previous", function() {
            return ensure('2 shift-tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: OOO: xxx:\n|ooo: xxx: OOO:"
            });
          });
        });
        return describe("when multiple preset-occurrence created at different timing", function() {
          beforeEach(function() {
            set({
              cursor: [0, 5]
            });
            return ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'xxx', 'xxx', 'xxx']
            });
          });
          return it("visit occurrences ordered by buffer position", function() {
            ensure("tab", {
              textC: "ooo: xxx: |ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: |ooo: xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: |xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\n|ooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: |xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: |ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: |xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\n|ooo: xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: |xxx:\nooo: xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: |ooo: xxx:\nooo: xxx: ooo:"
            });
            return ensure("shift-tab", {
              textC: "ooo: xxx: |ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
            });
          });
        });
      });
      describe("explict operator-modifier o and preset-marker", function() {
        beforeEach(function() {
          return set({
            textC: "|ooo: xxx: ooo xxx: ooo:\n___: ooo: xxx: ooo xxx: ooo:"
          });
        });
        describe("'o' modifier when preset occurrence already exists", function() {
          return it("'o' always pick cursor-word and overwrite existing preset marker)", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w d o", {
              occurrenceText: ["xxx", "xxx", "xxx", "xxx"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              text: "ooo: : ooo : ooo:\n___: ooo: : ooo : ooo:",
              mode: 'normal'
            });
          });
        });
        return describe("occurrence bound operator don't overwite pre-existing preset marker", function() {
          return it("'o' always pick cursor-word and clear existing preset marker", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w g cmd-d", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              selectedText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
          });
        });
      });
      return describe("toggle-preset-subword-occurrence commands", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return describe("add preset subword-occurrence", function() {
          return it("mark subword under cursor", function() {
            return ensure('g O', {
              occurrenceText: ['Case', 'Case', 'Case', 'Case']
            });
          });
        });
      });
    });
    describe("linewise-bound-operation in occurrence operation", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage("language-javascript");
        });
        return runs(function() {
          return set({
            grammar: 'source.js',
            textC: "function hello(name) {\n  console.log(\"debug-1\")\n  |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  console.log(\"debug-3\")\n\n  console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      describe("with preset-occurrence", function() {
        it("works characterwise for `delete` operator", function() {
          ensure("g o v i f", {
            mode: ['visual', 'linewise']
          });
          return ensure("d", {
            textC: "function hello(name) {\n  |.log(\"debug-1\")\n  .log(\"debug-2\")\n\n  const greeting = \"hello\"\n  .log(\"debug-3\")\n\n  .log(\"debug-4, includ `` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
        return it("works linewise for `delete-line` operator", function() {
          return ensure("g o v i f D", {
            textC: "function hello(name) {\n|\n  const greeting = \"hello\"\n\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      describe("when specified both o and V operator-modifier", function() {
        it("delete `console` including line by `V` modifier", function() {
          return ensure("d o V f", {
            textC: "function hello(name) {\n|\n  const greeting = \"hello\"\n\n  returrn name + \" \" + greeting\n}"
          });
        });
        return it("upper-case `console` including line by `V` modifier", function() {
          return ensure("g U o V f", {
            textC: "function hello(name) {\n  CONSOLE.LOG(\"DEBUG-1\")\n  |CONSOLE.LOG(\"DEBUG-2\")\n\n  const greeting = \"hello\"\n  CONSOLE.LOG(\"DEBUG-3\")\n\n  CONSOLE.LOG(\"DEBUG-4, INCLUD `CONSOLE` WORD\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      return describe("with o operator-modifier", function() {
        return it("toggle-line-comments of `occurrence` inclding **lines**", function() {
          ensure("g / o f", {
            textC: "function hello(name) {\n  // console.log(\"debug-1\")\n  // |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  // console.log(\"debug-3\")\n\n  // console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
          return ensure('.', {
            textC: "function hello(name) {\n  console.log(\"debug-1\")\n  |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  console.log(\"debug-3\")\n\n  console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
    });
    return describe("confirmThresholdOnOccurrenceOperation config", function() {
      beforeEach(function() {
        set({
          textC: "|oo oo oo oo oo\n"
        });
        return spyOn(atom, 'confirm');
      });
      describe("when under threshold", function() {
        beforeEach(function() {
          return settings.set("confirmThresholdOnOccurrenceOperation", 100);
        });
        it("does not ask confirmation on o-modifier", function() {
          ensure("c o", {
            mode: "operator-pending",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
        it("does not ask confirmation on O-modifier", function() {
          ensure("c O", {
            mode: "operator-pending",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
        it("does not ask confirmation on `g o`", function() {
          ensure("g o", {
            mode: "normal",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
        return it("does not ask confirmation on `g O`", function() {
          ensure("g O", {
            mode: "normal",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
      });
      return describe("when exceeding threshold", function() {
        beforeEach(function() {
          return settings.set("confirmThresholdOnOccurrenceOperation", 2);
        });
        it("ask confirmation on o-modifier", function() {
          ensure("c o", {
            mode: "operator-pending",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        it("ask confirmation on O-modifier", function() {
          ensure("c O", {
            mode: "operator-pending",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        it("can cancel and confirm on o-modifier", function() {
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Cancel");
          });
          ensure("c o", {
            mode: "operator-pending",
            occurrenceText: []
          });
          ensure(null, {
            mode: "operator-pending",
            occurrenceText: []
          });
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Continue");
          });
          return ensure("o", {
            mode: "operator-pending",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
        });
        it("ask confirmation on `g o`", function() {
          ensure("g o", {
            mode: "normal",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        it("ask confirmation on `g O`", function() {
          ensure("g O", {
            mode: "normal",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        return it("can cancel and confirm on `g o`", function() {
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Cancel");
          });
          ensure("g o", {
            mode: "normal",
            occurrenceText: []
          });
          ensure(null, {
            mode: "normal",
            occurrenceText: []
          });
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Continue");
          });
          return ensure("g o", {
            mode: "normal",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vY2N1cnJlbmNlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsZUFBUixDQUE3QyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDOztFQUNsQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUE7QUFDckIsUUFBQTtJQUFBLE9BQXdFLEVBQXhFLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsb0JBQWQsRUFBMEIsZ0JBQTFCLEVBQWtDLHVCQUFsQyxFQUFpRCxrQkFBakQsRUFBMkQ7SUFDM0QsT0FBc0MsRUFBdEMsRUFBQyxzQkFBRCxFQUFlO0lBQ2YsZUFBQSxHQUFrQixTQUFDLElBQUQ7YUFDaEIsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsSUFBeEI7SUFEZ0I7SUFFbEIscUJBQUEsR0FBd0IsU0FBQyxJQUFEO2FBQ3RCLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixJQUE5QjtJQURzQjtJQUd4QixVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjO1FBQ2QsU0FBQSxHQUFZLGFBQWEsQ0FBQztRQUMxQixZQUFBLEdBQWUsUUFBUSxDQUFDLFdBQVcsQ0FBQztlQUNwQyxtQkFBQSxHQUFzQixRQUFRLENBQUMsV0FBVyxDQUFDO01BTmpDLENBQVo7YUFRQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO01BREcsQ0FBTDtJQVRTLENBQVg7SUFZQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQTtNQUN2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Q0FBRyxpQ0FBSCxFQUFzQyxTQUFBO1VBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBYixDQUF5QixTQUFDLEdBQUQ7QUFBZSxnQkFBQTtZQUFiLFVBQUQ7bUJBQWMsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEI7VUFBZixDQUF6QjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxJQUFBLEVBQU0sUUFBTjtZQUFnQixjQUFBLEVBQWdCLEVBQWhDO1dBQWQ7VUFDQSxNQUFBLENBQU8sSUFBUCxFQUFhO1lBQUEsSUFBQSxFQUFNLFFBQU47WUFBZ0IsY0FBQSxFQUFnQixFQUFoQztXQUFiO1VBQ0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFiLENBQXlCLFNBQUMsR0FBRDtBQUFlLGdCQUFBO1lBQWIsVUFBRDttQkFBYyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQjtVQUFmLENBQXpCO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxJQUFBLEVBQU0sUUFBTjtZQUFnQixjQUFBLEVBQWdCLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCLElBQXpCLENBQWhDO1dBQWQ7UUFMb0MsQ0FBdEM7TUEzQm1DLENBQXJDO0lBekJ1RCxDQUF6RDtFQXRuQ3FCLENBQXZCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlld30gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT2NjdXJyZW5jZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVuc3VyZVdhaXQsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGUsIGNsYXNzTGlzdF0gPSBbXVxuICBbc2VhcmNoRWRpdG9yLCBzZWFyY2hFZGl0b3JFbGVtZW50XSA9IFtdXG4gIGlucHV0U2VhcmNoVGV4dCA9ICh0ZXh0KSAtPlxuICAgIHNlYXJjaEVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCA9IChuYW1lKSAtPlxuICAgIGRpc3BhdGNoKHNlYXJjaEVkaXRvckVsZW1lbnQsIG5hbWUpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0fSA9IHZpbVxuICAgICAgY2xhc3NMaXN0ID0gZWRpdG9yRWxlbWVudC5jbGFzc0xpc3RcbiAgICAgIHNlYXJjaEVkaXRvciA9IHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvclxuICAgICAgc2VhcmNoRWRpdG9yRWxlbWVudCA9IHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvckVsZW1lbnRcblxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICBkZXNjcmliZSBcIm9wZXJhdG9yLW1vZGlmaWVyLW9jY3VycmVuY2VcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG5cbiAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICBvb286IHh4eDogLS0tOiB4eHg6IG9vbzpcbiAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwibyBtb2RpZmllclwiLCAtPlxuICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBvZiBjdXJzb3Igd29yZCBpbiBpbm5lci1wYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSBcImMgbyBpIHBcIixcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICE6IHh4eDogfDpcbiAgICAgICAgICAtLS06IHw6IHh4eDogfDpcbiAgICAgICAgICB8OiB4eHg6IC0tLTogeHh4OiB8OlxuICAgICAgICAgIHh4eDogLS0tOiB8OiB8OlxuXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc9PT0nKVxuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgID09IT06IHh4eDogPT18PTpcbiAgICAgICAgICAtLS06ID09fD06IHh4eDogPT18PTpcbiAgICAgICAgICA9PXw9OiB4eHg6IC0tLTogeHh4OiA9PXw9OlxuICAgICAgICAgIHh4eDogLS0tOiA9PXw9OiA9PXw9OlxuXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiAtLS06IG9vbzogb29vOlxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlIFwifSBqIC5cIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgID09PTogeHh4OiA9PT06XG4gICAgICAgICAgLS0tOiA9PT06IHh4eDogPT09OlxuICAgICAgICAgID09PTogeHh4OiAtLS06IHh4eDogPT09OlxuICAgICAgICAgIHh4eDogLS0tOiA9PT06ID09PTpcblxuICAgICAgICAgID09IT06IHh4eDogPT18PTpcbiAgICAgICAgICAtLS06ID09fD06IHh4eDogPT18PTpcbiAgICAgICAgICA9PXw9OiB4eHg6IC0tLTogeHh4OiA9PXw9OlxuICAgICAgICAgIHh4eDogLS0tOiA9PXw9OiA9PXw9OlxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIk8gbW9kaWZpZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWxDYXxzZSBDYXNlc1xuICAgICAgICAgIFwiQ2FzZVN0dWR5XCIgU25ha2VDYXNlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXIgUGFyYWdyYXBoQ2FzZVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJkZWxldGUgc3Vid29yZC1vY2N1cnJlbmNlIGluIHBhcmFncmFwaCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIE8gcFwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsfCBDYXNlc1xuICAgICAgICAgIFwiU3R1ZHlcIiBTbmFrZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiRyAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgY2FtZWwgQ2FzZXNcbiAgICAgICAgICBcIlN0dWR5XCIgU25ha2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICBvdGhlcnwgUGFyYWdyYXBoXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFwcGx5IHZhcmlvdXMgb3BlcmF0b3IgdG8gb2NjdXJyZW5jZSBpbiB2YXJpb3VzIHRhcmdldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IG8hb286XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiA9PT06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogPT09OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwidXBwZXIgY2FzZSBpbm5lci13b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgVSBvIGkgbFwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogTyFPTzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6ID09PTogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiA9PT06IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCIyIGogLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBPT086IHh4eDogPSE9PTogeHh4OiBPT086XG4gICAgICAgICAgeHh4OiA9PT06IG9vbzogb29vOlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJqIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgT09POiB4eHg6ID09PTogeHh4OiBPT086XG4gICAgICAgICAgeHh4OiA9PT06IE8hT086IE9PTzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJjbGlwIHRvIG11dGF0aW9uIGVuZCBiZWhhdmlvclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIG9vfG86eHh4Om9vbzpcbiAgICAgICAgICAgIHh4eDpvb286eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltkIG8gcF0gZGVsZXRlIG9jY3VycmVuY2UgYW5kIGN1cnNvciBpcyBhdCBtdXRhdGlvbiBlbmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIG8gcFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICB8Onh4eDo6XG4gICAgICAgICAgICB4eHg6Onh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbZCBvIGpdIGRlbGV0ZSBvY2N1cnJlbmNlIGFuZCBjdXJzb3IgaXMgYXQgbXV0YXRpb24gZW5kXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBvIGpcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgfDp4eHg6OlxuICAgICAgICAgICAgeHh4Ojp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwibm90IGNsaXAgaWYgb3JpZ2luYWwgY3Vyc29yIG5vdCBpbnRlcnNlY3RzIGFueSBvY2N1cmVuY2UtbWFya2VyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydvb28nLCAnb29vJywgJ29vbyddLCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlIFwiZCBwXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIDp4eHg6OlxuICAgICAgICAgICAgeHh8eDo6eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhdXRvIGV4dGVuZCB0YXJnZXQgcmFuZ2UgdG8gaW5jbHVkZSBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICB0ZXh0T3JpZ2luYWwgPSBcIlRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0LlxcblwiXG4gICAgICB0ZXh0RmluYWwgPSB0ZXh0T3JpZ2luYWwucmVwbGFjZSgvdGV4dC9nLCAnJylcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogdGV4dE9yaWdpbmFsXG5cbiAgICAgIGl0IFwiW2Zyb20gc3RhcnQgb2YgMXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgNV07IGVuc3VyZSAnZCBvICQnLCB0ZXh0OiB0ZXh0RmluYWxcbiAgICAgIGl0IFwiW2Zyb20gbWlkZGxlIG9mIDFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDddOyBlbnN1cmUgJ2QgbyAkJywgdGV4dDogdGV4dEZpbmFsXG4gICAgICBpdCBcIltmcm9tIGVuZCBvZiBsYXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgNTJdOyBlbnN1cmUgJ2QgbyAwJywgdGV4dDogdGV4dEZpbmFsXG4gICAgICBpdCBcIltmcm9tIG1pZGRsZSBvZiBsYXN0XVwiLCAtPiBzZXQgY3Vyc29yOiBbMCwgNTFdOyBlbnN1cmUgJ2QgbyAwJywgdGV4dDogdGV4dEZpbmFsXG5cbiAgICBkZXNjcmliZSBcInNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIHZpbS1tb2RlLXBsdXMgdmltLW1vZGUtcGx1c1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ3aGF0IHRoZSBjdXJzb3Itd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmVDdXJzb3JXb3JkID0gKGluaXRpYWxQb2ludCwge3NlbGVjdGVkVGV4dH0pIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogaW5pdGlhbFBvaW50XG4gICAgICAgICAgZW5zdXJlIFwiZyBjbWQtZCBpIHBcIixcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIG9uIG5vcm1hbCB3b3JkXCIsIC0+XG4gICAgICAgICAgaXQgXCJwaWNrIHdvcmQgYnV0IG5vdCBwaWNrIHBhcnRpYWxseSBtYXRjaGVkIG9uZSBbYnkgc2VsZWN0XVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgMF0sIHNlbGVjdGVkVGV4dDogWyd2aW0nLCAndmltJ10pXG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCAzXSwgc2VsZWN0ZWRUZXh0OiBbJy0nLCAnLScsICctJywgJy0nXSlcbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDRdLCBzZWxlY3RlZFRleHQ6IFsnbW9kZScsICdtb2RlJ10pXG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCA5XSwgc2VsZWN0ZWRUZXh0OiBbJ3BsdXMnLCAncGx1cyddKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHNpbmdsZSB3aGl0ZSBzcGFjZSBbYnkgZGVsZXRlXVwiLCAtPlxuICAgICAgICAgIGl0IFwicGljayBzaW5nbGUgd2hpdGUgc3BhY2Ugb25seVwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb28gb29vIG9vb1xuICAgICAgICAgICAgICAgb29vIG9vbyBvb29cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgICBlbnN1cmUgXCJkIG8gaSBwXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb29vb29vb29cbiAgICAgICAgICAgICAgb29vb29vb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGRlc2NyaWJlIFwiY3Vyc29yIGlzIGF0IHNlcXVuY2Ugb2Ygc3BhY2UgW2J5IGRlbGV0ZV1cIiwgLT5cbiAgICAgICAgICBpdCBcInNlbGVjdCBzZXF1bmNlIG9mIHdoaXRlIHNwYWNlcyBpbmNsdWRpbmcgcGFydGlhbGx5IG1hY2hlZCBvbmVcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIG9vb19fX29vbyBvb29cbiAgICAgICAgICAgICAgIG9vbyBvb29fX19fb29vX19fX19fX19vb29cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIG8gaSBwXCIsXG4gICAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vb29vIG9vb1xuICAgICAgICAgICAgICAgb29vIG9vbyBvb28gIG9vb1xuICAgICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInN0YXlPbk9jY3VycmVuY2Ugc2V0dGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgIGFhYSwgYmJiLCBjY2NcbiAgICAgICAgYmJiLCBhfGFhLCBhYWFcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0cnVlICg9IGRlZmF1bHQpXCIsIC0+XG4gICAgICBpdCBcImtlZXAgY3Vyc29yIHBvc2l0aW9uIGFmdGVyIG9wZXJhdGlvbiBmaW5pc2hlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgVSBvIHAnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIEFBQSwgYmJiLCBjY2NcbiAgICAgICAgICBiYmIsIEF8QUEsIEFBQVxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZmFsc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25PY2N1cnJlbmNlJywgZmFsc2UpXG5cbiAgICAgIGl0IFwibW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0IGFzIGxpa2Ugbm9uLW9jdXJyZW5jZSBvcGVyYXRvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgVSBvIHAnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIHxBQUEsIGJiYiwgY2NjXG4gICAgICAgICAgYmJiLCBBQUEsIEFBQVxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJmcm9tIHZpc3VhbC1tb2RlLmlzLW5hcnJvd2VkXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vXG4gICAgICAgIHx8fDogb29vOiB4eHg6IG9vb1xuICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vb1xuICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIlt2Q10gc2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnNvci13b3JkIHdoaWNoIGludGVyc2VjdGluZyBzZWxlY3Rpb24gdGhlbiBhcHBseSB1cHBlci1jYXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgMiBqIGNtZC1kXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICdvb28nXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGVuc3VyZSBcIlVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogT09PXG4gICAgICAgICAgT09POiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA1XG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiW3ZMXSBzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY3Vyc29yLXdvcmQgd2hpY2ggaW50ZXJzZWN0aW5nIHNlbGVjdGlvbiB0aGVuIGFwcGx5IHVwcGVyLWNhc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiNSBsIFYgMiBqIGNtZC1kXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJ3h4eCcsICd4eHgnLCAneHh4JywgJ3h4eCddXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgZW5zdXJlIFwiVVwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIG9vbzogWFhYOiBvb29cbiAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb29cbiAgICAgICAgICBvb286IFhYWDogfHx8OiBYWFg6IG9vb1xuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG51bUN1cnNvcnM6IDRcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJbdkJdIHNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjdXJzb3Itd29yZCB3aGljaCBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uIHRoZW4gYXBwbHkgdXBwZXItY2FzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJXIGN0cmwtdiAyIGogJCBoIGNtZC1kIFVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IHh4eDogT09PXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogT09PXG4gICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBPT09cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA0XG5cbiAgICAgIGl0IFwicGljayBjdXJzb3Itd29yZCBmcm9tIHZCIHJhbmdlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiA3IGwgMiBqIG8gY21kLWQgVVwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBvb29cbiAgICAgICAgICB8fHw6IE9PTzogeHh4OiBvb29cbiAgICAgICAgICBPT086IHh4eDogfHx8OiB4eHg6IG9vb1xuICAgICAgICAgIHh4eDogfHx8OiBvb286IG9vb1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG51bUN1cnNvcnM6IDNcblxuICBkZXNjcmliZSBcImluY3JlbWVudGFsIHNlYXJjaCBpbnRlZ3JhdGlvbjogY2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2gsIHNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdpbmNyZW1lbnRhbFNlYXJjaCcsIHRydWUpXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG9vbzogeHh4OiBvb286IDAwMDBcbiAgICAgICAgMTogb29vOiAyMjogb29vOlxuICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImZyb20gbm9ybWFsIG1vZGVcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgYnkgcGF0dGVybiBtYXRjaFwiLCAtPlxuICAgICAgICBlbnN1cmUgJy8nXG4gICAgICAgIGlucHV0U2VhcmNoVGV4dCgnXFxcXGR7Myw0fScpXG4gICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgIGVuc3VyZSAnaSBlJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnMzMzMycsICc0NDQnLCAnMDAwMCddICMgV2h5ICcwMDAwJyBjb21lcyBsYXN0IGlzICcwMDAwJyBiZWNvbWUgbGFzdCBzZWxlY3Rpb24uXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgYnkgcGF0dGVybiBtYXRjaFwiLCAtPlxuICAgICAgICBlbnN1cmUgJy8nXG4gICAgICAgIGlucHV0U2VhcmNoVGV4dCgnXlxcXFx3KzonKVxuICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6Y2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICBlbnN1cmUgJ2kgZScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdoZWxsbycpXG4gICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGhlbGxvIHh4eDogb29vOiAwMDAwXG4gICAgICAgICAgaGVsbG8gb29vOiAyMjogb29vOlxuICAgICAgICAgIGhlbGxvIHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgICAgaGVsbG8gfHx8OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwgY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGluIG5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBqIC8nXG4gICAgICAgICAgaW5wdXRTZWFyY2hUZXh0KCdvKycpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09POiAwMDAwXG4gICAgICAgICAgICAxOiBvb286IDIyOiBvb286XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IDMzMzM6XG4gICAgICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwgbGluZXdpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1YgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogT09POiAyMjogT09POlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGJsb2Nrd2lzZVwiLCAtPlxuICAgICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGluIG5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgIGVuc3VyZSAnY3RybC12IDIgaiAxIDAgbCAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogT09POiAyMjogT09POlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGV4aXN0c1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwiY3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnbSc6ICd2aW0tbW9kZS1wbHVzOmNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvbidcblxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIHx8fDogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb286XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBlbnN1cmUgJ1YgaiBtIEcgbSBtJyxcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMF0sIFsyLCAwXV1cbiAgICAgICAgICAgIFtbMywgMF0sIFs0LCAwXV1cbiAgICAgICAgICBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBubyBzZWxlY3Rpb24gaXMgZXhpc3RzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICcvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgneHh4JylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICBvb286IHh4eDogfHx8OiB4eHg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBib3RoIGV4aXRzLCBvcGVyYXRvciBhcHBsaWVkIHRvIGJvdGhcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3QgYWxsIG9jY3VycmVuY2UgaW4gc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIDIgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgneHh4JylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICB8fHw6IG9vbzogWFhYOiBvb286XG4gICAgICAgICAgICBvb286IFhYWDogfHx8OiBYWFg6IG9vbzpcbiAgICAgICAgICAgIFhYWDogfHx8OiBvb286IG9vbzpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG5cbiAgICBkZXNjcmliZSBcImRlbW9uc3RyYXRlIHBlcnNpc3RlbnQtc2VsZWN0aW9uJ3MgcHJhY3RpY2FsIHNjZW5hcmlvXCIsIC0+XG4gICAgICBbb2xkR3JhbW1hcl0gPSBbXVxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKG9sZEdyYW1tYXIpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20nOiAndmltLW1vZGUtcGx1czp0b2dnbGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBvbGRHcmFtbWFyID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmNvZmZlZScpKVxuXG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoQG1haW4sIEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyKSAtPlxuICAgICAgICAgICAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgICAgICAgICAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgICAgICAgICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgICAgICAgICAgQG1vZGVNYW5hZ2VyID0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBtYXJrID0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEByZWdpc3RlciA9IG5ldyBSZWdpc3Rlck1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25zID0gW11cblxuICAgICAgICAgICAgICBAaGlnaGxpZ2h0U2VhcmNoU3Vic2NyaXB0aW9uID0gQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AgPT5cbiAgICAgICAgICAgICAgICBAcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCgpXG5cbiAgICAgICAgICAgICAgQG9wZXJhdGlvblN0YWNrID0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgICAgICAgICAgIEBjdXJzb3JTdHlsZU1hbmFnZXIgPSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG5cbiAgICAgICAgICAgIGFub3RoZXJGdW5jOiAtPlxuICAgICAgICAgICAgICBAaGVsbG8gPSBbXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0ICdjaGFuZ2UgYWxsIGFzc2lnbm1lbnQoXCI9XCIpIG9mIGN1cnJlbnQtZnVuY3Rpb24gdG8gXCI/PVwiJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnaiBmID0nLCBjdXJzb3I6IFsxLCAxN11cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgX2tleXN0cm9rZSA9IFtcbiAgICAgICAgICAgICdnIGNtZC1kJyAjIHNlbGVjdC1vY2N1cnJlbmNlXG4gICAgICAgICAgICAnaSBmJyAgICAgIyBpbm5lci1mdW5jdGlvbi10ZXh0LW9iamVjdFxuICAgICAgICAgICAgJ20nICAgICAgICMgdG9nZ2xlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXG4gICAgICAgICAgXS5qb2luKFwiIFwiKVxuICAgICAgICAgIGVuc3VyZShfa2V5c3Ryb2tlKVxuXG4gICAgICAgICAgdGV4dHNJbkJ1ZmZlclJhbmdlID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKS5tYXAgKHJhbmdlKSAtPlxuICAgICAgICAgICAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIHRleHRzSW5CdWZmZXJSYW5nZUlzQWxsRXF1YWxDaGFyID0gdGV4dHNJbkJ1ZmZlclJhbmdlLmV2ZXJ5KCh0ZXh0KSAtPiB0ZXh0IGlzICc9JylcbiAgICAgICAgICBleHBlY3QodGV4dHNJbkJ1ZmZlclJhbmdlSXNBbGxFcXVhbENoYXIpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJzKCkpLnRvSGF2ZUxlbmd0aCgxMSlcblxuICAgICAgICAgIGVuc3VyZSAnMiBsJyAjIHRvIG1vdmUgdG8gb3V0LXNpZGUgb2YgcmFuZ2UtbXJrZXJcbiAgICAgICAgICBlbnN1cmUgJy8gPT4gZW50ZXInLCBjdXJzb3I6IFs5LCA2OV1cbiAgICAgICAgICBlbnN1cmUgXCJtXCIgIyBjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIGF0IGN1cnNvciB3aGljaCBpcyA9IHNpZ24gcGFydCBvZiBmYXQgYXJyb3cuXG4gICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VycygpKS50b0hhdmVMZW5ndGgoMTApXG5cbiAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICBjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1wZXJzaXN0ZW50LXNlbGVjdGlvbicpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtY21kLWcgSVwiICMgXCJzZWxlY3QtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiB0aGVuIFwiSW5zZXJ0IGF0IHN0YXJ0IG9mIHNlbGVjdGlvblwiXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPycpXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKEBtYWluLCBAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlcikgLT5cbiAgICAgICAgICAgICAgQGVkaXRvckVsZW1lbnQgPz0gQGVkaXRvci5lbGVtZW50XG4gICAgICAgICAgICAgIEBlbWl0dGVyID89IG5ldyBFbWl0dGVyXG4gICAgICAgICAgICAgIEBzdWJzY3JpcHRpb25zID89IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICAgICAgICAgIEBtb2RlTWFuYWdlciA/PSBuZXcgTW9kZU1hbmFnZXIodGhpcylcbiAgICAgICAgICAgICAgQG1hcmsgPz0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEByZWdpc3RlciA/PSBuZXcgUmVnaXN0ZXJNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9ucyA/PSBbXVxuXG4gICAgICAgICAgICAgIEBoaWdobGlnaHRTZWFyY2hTdWJzY3JpcHRpb24gPz0gQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AgPT5cbiAgICAgICAgICAgICAgICBAcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCgpXG5cbiAgICAgICAgICAgICAgQG9wZXJhdGlvblN0YWNrID89IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgICAgICAgICAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyID89IG5ldyBDdXJzb3JTdHlsZU1hbmFnZXIodGhpcylcblxuICAgICAgICAgICAgYW5vdGhlckZ1bmM6IC0+XG4gICAgICAgICAgICAgIEBoZWxsbyA9IFtdXG4gICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInByZXNldCBvY2N1cnJlbmNlIG1hcmtlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInRvZ2dsZS1wcmVzZXQtb2NjdXJyZW5jZSBjb21tYW5kc1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImFkZCBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0ICdzZXQgY3Vyc29yLXdhcmQgYXMgcHJlc2V0IG9jY3VycmVuY2UgbWFya2VyIGFuZCBub3QgbW92ZSBjdXJzb3InLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuXG4gICAgICAgIGRlc2NyaWJlIFwicmVtb3ZlIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgJ3JlbW92ZXMgb2NjdXJyZW5jZSBvbmUgYnkgb25lIHNlcGFyYXRlbHknLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdiIGcgbycsIG9jY3VycmVuY2VUZXh0OiBbJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGl0ICdyZW1vdmVzIGFsbCBvY2N1cnJlbmNlIGluIHRoaXMgZWRpdG9yIGJ5IGVzY2FwZScsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydUaGlzJywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J10sIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgaXQgJ2NhbiByZWNhbGwgcHJldmlvdXNseSBzZXQgb2NjdXJlbmNlIHBhdHRlcm4gYnkgYGcgLmAnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3IHYgbCBnIG8nLCBvY2N1cnJlbmNlVGV4dDogWyd0ZScsICd0ZScsICd0ZSddLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpKS50b0VxdWFsKC90ZS9nKVxuXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCAxMF0gIyB0byBtb3ZlIGN1cnNvciB0byB0ZXh0IGBoYXZlYFxuICAgICAgICAgICAgZW5zdXJlICdnIC4nLCBvY2N1cnJlbmNlVGV4dDogWyd0ZScsICd0ZScsICd0ZSddLCBjdXJzb3I6IFswLCAxMF1cblxuICAgICAgICAgICAgIyBCdXQgb3BlcmF0b3IgbW9kaWZpZXIgbm90IHVwZGF0ZSBsYXN0T2NjdXJyZW5jZVBhdHRlcm5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBVIG8gJCcsIHRleHRDOiBcIlRoaXMgdGV4dCB8SEFWRSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFwiXG4gICAgICAgICAgICBleHBlY3QodmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKSkudG9FcXVhbCgvdGUvZylcblxuICAgICAgICBkZXNjcmliZSBcInJlc3RvcmUgbGFzdCBvY2N1cnJlbmNlIG1hcmtlciBieSBhZGQtcHJlc2V0LW9jY3VycmVuY2UtZnJvbS1sYXN0LW9jY3VycmVuY2UtcGF0dGVyblwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIGNhbWVsXG4gICAgICAgICAgICAgIGNhbWVsQ2FzZVxuICAgICAgICAgICAgICBjYW1lbHNcbiAgICAgICAgICAgICAgY2FtZWxcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgaXQgXCJjYW4gcmVzdG9yZSBvY2N1cnJlbmNlLW1hcmtlciBhZGRlZCBieSBgZyBvYCBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgXCJnIG9cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnXVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGVuc3VyZSBcImcgLlwiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCddXG5cbiAgICAgICAgICBpdCBcImNhbiByZXN0b3JlIG9jY3VycmVuY2UtbWFya2VyIGFkZGVkIGJ5IGBnIG9gIGluIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSBcInYgaSB3XCIsIHNlbGVjdGVkVGV4dDogXCJjYW1lbFwiXG4gICAgICAgICAgICBlbnN1cmUgXCJnIG9cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGVuc3VyZSBcImcgLlwiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG5cbiAgICAgICAgICBpdCBcImNhbiByZXN0b3JlIG9jY3VycmVuY2UtbWFya2VyIGFkZGVkIGJ5IGBnIE9gIGluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgT1wiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG4gICAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZW5zdXJlIFwiZyAuXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cblxuICAgICAgICBkZXNjcmliZSBcImNzcyBjbGFzcyBoYXMtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGRlc2NyaWJlIFwibWFudWFsbHkgdG9nZ2xlIGJ5IHRvZ2dsZS1wcmVzZXQtb2NjdXJyZW5jZSBjb21tYW5kXCIsIC0+XG4gICAgICAgICAgICBpdCAnaXMgYXV0by1zZXQvdW5zZXQgd2hldGVyIGF0IGxlYXN0IG9uZSBwcmVzZXQtb2NjdXJyZW5jZSB3YXMgZXhpc3RzIG9yIG5vdCcsIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG4gICAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZSh0cnVlKVxuICAgICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogMCwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgICAgIGRlc2NyaWJlIFwiY2hhbmdlICdJTlNJREUnIG9mIG1hcmtlclwiLCAtPlxuICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkID0gbnVsbFxuICAgICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgICAgICAgICBpdCAnZGVzdHJveSBtYXJrZXIgYW5kIHJlZmxlY3QgdG8gXCJoYXMtb2NjdXJyZW5jZVwiIENTUycsIC0+XG4gICAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuICAgICAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKHRydWUpXG5cbiAgICAgICAgICAgICAgICBlbnN1cmUgJ2wgaScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgICAgdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIubWFya2VyTGF5ZXIub25EaWRVcGRhdGUgLT5cbiAgICAgICAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZCA9IHRydWVcblxuICAgICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCctLScpXG4gICAgICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgICAgICAgICB0ZXh0QzogXCJULXwtaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dFwiXG4gICAgICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkXG5cbiAgICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICAgIGVuc3VyZSBudWxsLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcImluIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiYWRkIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgJ3NldCBzZWxlY3RlZC10ZXh0IGFzIHByZXNldCBvY2N1cnJlbmNlIG1hcmtlciBhbmQgbm90IG1vdmUgY3Vyc29yJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndyB2IGwnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIHNlbGVjdGVkVGV4dDogJ3RlJ1xuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBtb2RlOiAnbm9ybWFsJywgb2NjdXJyZW5jZVRleHQ6IFsndGUnLCAndGUnLCAndGUnXVxuICAgICAgICBkZXNjcmliZSBcImlzLW5hcnJvd2VkIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIFt0ZXh0T3JpZ2luYWxdID0gW11cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICB0ZXh0T3JpZ2luYWwgPSBcIlwiXCJcbiAgICAgICAgICAgICAgVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcbiAgICAgICAgICAgICAgVGhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgICAgdGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgICAgaXQgXCJwaWNrIG9jdXJyZW5jZS13b3JkIGZyb20gY3Vyc29yIHBvc2l0aW9uIGFuZCBjb250aW51ZSB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3IFYgaicsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ10sIHNlbGVjdGVkVGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsXG4gICAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0T3JpZ2luYWxcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0JywgJ3RleHQnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXVxuICAgICAgICAgICAgZW5zdXJlV2FpdCAnciAhJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIFRoaXMgISEhISBoYXZlIDMgaW5zdGFuY2Ugb2YgJyEhISEnIGluIHRoZSB3aG9sZSAhISEhXG4gICAgICAgICAgICAgIFRoaXMgISEhISBoYXZlIDMgaW5zdGFuY2Ugb2YgJyEhISEnIGluIHRoZSB3aG9sZSAhISEhXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImluIGluY3JlbWVudGFsLXNlYXJjaFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdpbmNyZW1lbnRhbFNlYXJjaCcsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJhZGQtb2NjdXJyZW5jZS1wYXR0ZXJuLWZyb20tc2VhcmNoXCIsIC0+XG4gICAgICAgICAgaXQgJ21hcmsgYXMgb2NjdXJyZW5jZSB3aGljaCBtYXRjaGVzIHJlZ2V4IGVudGVyZWQgaW4gc2VhcmNoLXVpJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnLydcbiAgICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnXFxcXGJ0XFxcXHcrJylcbiAgICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czphZGQtb2NjdXJyZW5jZS1wYXR0ZXJuLWZyb20tc2VhcmNoJylcbiAgICAgICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWyd0ZXh0JywgJ3RleHQnLCAndGhlJywgJ3RleHQnXVxuXG4gICAgZGVzY3JpYmUgXCJtdXRhdGUgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIm5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbZGVsZXRlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEQnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICA6IHh4eDogIHh4eDogOlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIGcgVSBqJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgICEhITogb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW3VwY2FzZSBleGNsdWRlXSB3b25cXCd0IG11dGF0ZSByZW1vdmVkIG1hcmtlcicsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDZcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAnZyBVIGonLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogT09PIHh4eDogT09POlxuICAgICAgICAgICAgISEhOiBPT086IHh4eDogT09PIHh4eDogT09POlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbZGVsZXRlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgICAgZW5zdXJlICdnIG8gZyBVICQnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogT09PIHh4eDogT09POlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0ICdbY2hhbmdlXSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEMnLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgOiB4eHg6ICB4eHg6IDpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdZWVknKVxuICAgICAgICAgIGVuc3VyZSAnbCBnIG8gQycsXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBZWVk6IHh4eDogWVlZIHh4eDogWVlZOlxuICAgICAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBudW1DdXJzb3JzOiAzXG4gICAgICAgIGRlc2NyaWJlIFwicHJlZGVmaW5lZCBrZXltYXAgb24gd2hlbiBoYXMtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWfGltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCAnW2luc2VydC1hdC1zdGFydF0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1ZpbScsICdWaW0nLCAnVmltJywgJ1ZpbSddXG4gICAgICAgICAgICBjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJylcbiAgICAgICAgICAgIGVuc3VyZSAndiBrIEknLCBtb2RlOiAnaW5zZXJ0JywgbnVtQ3Vyc29yczogMlxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJwdXJlLVwiKVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHB1cmUhLVZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBwdXJlfC1WaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGl0ICdbaW5zZXJ0LWFmdGVyLXN0YXJ0XSBhcHBseSBvcGVyYXRpb24gdG8gcHJlc2V0LW1hcmtlciBpbnRlcnNlY3Rpbmcgc2VsZWN0ZWQgdGFyZ2V0JywgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydWaW0nLCAnVmltJywgJ1ZpbScsICdWaW0nXVxuICAgICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpXG4gICAgICAgICAgICBlbnN1cmUgJ3YgaiBBJywgbW9kZTogJ2luc2VydCcsIG51bUN1cnNvcnM6IDJcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiIGFuZCBFbWFjc1wiKVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gYW5kIEVtYWN8cyBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gYW5kIEVtYWMhcyBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh8eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA1XG4gICAgICAgICAgZW5zdXJlICd2IGogVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICBYWFg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwtbGluZXdpc2UtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgdG8gcHJlc2V0LW1hcmtlciBhcyBsb25nIGFzIGl0IGludGVyc2VjdHMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAnViBVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyBYWFg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1ibG9ja3dpc2UtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgdG8gcHJlc2V0LW1hcmtlciBhcyBsb25nIGFzIGl0IGludGVyc2VjdHMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAnY3RybC12IGogMiB3IFUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IFhYWDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb05leHRPY2N1cnJlbmNlLCBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxvb286IHh4eDogb29vXG4gICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSAnZyBvJyxcbiAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJ11cblxuICAgICAgZGVzY3JpYmUgXCJ0YWIsIHNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzdGFydCBvZiBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgaXQgXCJzZWFyY2ggbmV4dC9wcmV2aW91cyBvY2N1cnJlbmNlIG1hcmtlclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd0YWIgdGFiJywgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnMiB0YWInLCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnMiBzaGlmdC10YWInLCBjdXJzb3I6IFsxLCA1XVxuICAgICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBpbnNpZGUgb2Ygb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJvb29vIG9vfG9vIG9vb29cIlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDNcblxuICAgICAgICAgIGRlc2NyaWJlIFwidGFiXCIsIC0+XG4gICAgICAgICAgICBpdCBcIm1vdmUgdG8gbmV4dCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICAgIGVuc3VyZSAndGFiJywgdGV4dEM6ICdvb29vIG9vb28gfG9vb28nXG5cbiAgICAgICAgICBkZXNjcmliZSBcInNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgICAgZW5zdXJlICdzaGlmdC10YWInLCB0ZXh0QzogJ3xvb29vIG9vb28gb29vbydcblxuICAgICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvcidzIHRhcmdldFwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcInRhYlwiLCAtPlxuICAgICAgICAgIGl0IFwib3BlcmF0ZSBvbiBuZXh0IG9jY3VycmVuY2UgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSB0YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogM1xuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAyXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgICAgIGl0IFwiW28tbW9kaWZpZXJdIG9wZXJhdGUgb24gbmV4dCBvY2N1cnJlbmNlIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIixcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSBvIHRhYlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgICBfX186IG9vbzogeHh4OlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAwXG5cbiAgICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgIGRlc2NyaWJlIFwic2hpZnQtdGFiXCIsIC0+XG4gICAgICAgICAgaXQgXCJvcGVyYXRlIG9uIG5leHQgcHJldmlvdXMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSBcImcgVSBzaGlmdC10YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb29cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogM1xuICAgICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICAgICAgICBfX186IE9PTzogeHh4OlxuICAgICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZUNvdW50OiAyXG4gICAgICAgICAgICBlbnN1cmUgXCIyIC5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgZGVzY3JpYmUgXCJleGN1ZGUgcGFydGljdWxhciBvY2N1cmVuY2UgYnkgYC5gIHJlcGVhdFwiLCAtPlxuICAgICAgICBpdCBcImNsZWFyIHByZXNldC1vY2N1cnJlbmNlIGFuZCBtb3ZlIHRvIG5leHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgdGFiIC4gZyBVIGkgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICBfX186IHxvb286IHh4eDpcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImNsZWFyIHByZXNldC1vY2N1cnJlbmNlIGFuZCBtb3ZlIHRvIHByZXZpb3VzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIHNoaWZ0LXRhYiAuIGcgVSBpIHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgIHxvb286IHh4eDogT09POlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBtdWx0aXBsZSBwcmVzZXQtb2NjdXJyZW5jZSBjcmVhdGVkIGF0IGRpZmZlcmVudCB0aW1pbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBlbnN1cmUgJ2cgbycsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ3h4eCcsICd4eHgnLCAneHh4J11cblxuICAgICAgICBpdCBcInZpc2l0IG9jY3VycmVuY2VzIG9yZGVyZWQgYnkgYnVmZmVyIHBvc2l0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwidGFiXCIsICAgICAgIHRleHRDOiBcIm9vbzogeHh4OiB8b29vXFxuX19fOiBvb286IHh4eDpcXG5vb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwidGFiXCIsICAgICAgIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IHxvb286IHh4eDpcXG5vb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwidGFiXCIsICAgICAgIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogfHh4eDpcXG5vb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwidGFiXCIsICAgICAgIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogeHh4Olxcbnxvb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwidGFiXCIsICAgICAgIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogeHh4Olxcbm9vbzogfHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwidGFiXCIsICAgICAgIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogeHh4Olxcbm9vbzogeHh4OiB8b29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwic2hpZnQtdGFiXCIsIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogeHh4Olxcbm9vbzogfHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwic2hpZnQtdGFiXCIsIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogeHh4Olxcbnxvb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwic2hpZnQtdGFiXCIsIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IG9vbzogfHh4eDpcXG5vb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwic2hpZnQtdGFiXCIsIHRleHRDOiBcIm9vbzogeHh4OiBvb29cXG5fX186IHxvb286IHh4eDpcXG5vb286IHh4eDogb29vOlwiXG4gICAgICAgICAgZW5zdXJlIFwic2hpZnQtdGFiXCIsIHRleHRDOiBcIm9vbzogeHh4OiB8b29vXFxuX19fOiBvb286IHh4eDpcXG5vb286IHh4eDogb29vOlwiXG5cbiAgICBkZXNjcmliZSBcImV4cGxpY3Qgb3BlcmF0b3ItbW9kaWZpZXIgbyBhbmQgcHJlc2V0LW1hcmtlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgX19fOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIidvJyBtb2RpZmllciB3aGVuIHByZXNldCBvY2N1cnJlbmNlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgIGl0IFwiJ28nIGFsd2F5cyBwaWNrIGN1cnNvci13b3JkIGFuZCBvdmVyd3JpdGUgZXhpc3RpbmcgcHJlc2V0IG1hcmtlcilcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJnIG9cIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBlbnN1cmUgXCIyIHcgZCBvXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wieHh4XCIsIFwieHh4XCIsIFwieHh4XCIsIFwieHh4XCJdXG4gICAgICAgICAgICBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgICBlbnN1cmUgXCJqXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogOiBvb28gOiBvb286XG4gICAgICAgICAgICBfX186IG9vbzogOiBvb28gOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwib2NjdXJyZW5jZSBib3VuZCBvcGVyYXRvciBkb24ndCBvdmVyd2l0ZSBwcmUtZXhpc3RpbmcgcHJlc2V0IG1hcmtlclwiLCAtPlxuICAgICAgICBpdCBcIidvJyBhbHdheXMgcGljayBjdXJzb3Itd29yZCBhbmQgY2xlYXIgZXhpc3RpbmcgcHJlc2V0IG1hcmtlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIGVuc3VyZSBcIjIgdyBnIGNtZC1kXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgICBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgICBlbnN1cmUgXCJqXCIsXG4gICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG5cbiAgICBkZXNjcmliZSBcInRvZ2dsZS1wcmVzZXQtc3Vid29yZC1vY2N1cnJlbmNlIGNvbW1hbmRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsQ2F8c2UgQ2FzZXNcbiAgICAgICAgICBcIkNhc2VTdHVkeVwiIFNuYWtlQ2FzZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IHN1YndvcmQtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICBpdCBcIm1hcmsgc3Vid29yZCB1bmRlciBjdXJzb3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgTycsIG9jY3VycmVuY2VUZXh0OiBbJ0Nhc2UnLCAnQ2FzZScsICdDYXNlJywgJ0Nhc2UnXVxuXG4gIGRlc2NyaWJlIFwibGluZXdpc2UtYm91bmQtb3BlcmF0aW9uIGluIG9jY3VycmVuY2Ugb3BlcmF0aW9uXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwibGFuZ3VhZ2UtamF2YXNjcmlwdFwiKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuanMnXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVidWctMVwiKVxuICAgICAgICAgICAgfGNvbnNvbGUubG9nKFwiZGVidWctMlwiKVxuXG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWJ1Zy0zXCIpXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVidWctNCwgaW5jbHVkIGBjb25zb2xlYCB3b3JkXCIpXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIHByZXNldC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcIndvcmtzIGNoYXJhY3Rlcndpc2UgZm9yIGBkZWxldGVgIG9wZXJhdG9yXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgbyB2IGkgZlwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgIGVuc3VyZSBcImRcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgICAgfC5sb2coXCJkZWJ1Zy0xXCIpXG4gICAgICAgICAgICAubG9nKFwiZGVidWctMlwiKVxuXG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuICAgICAgICAgICAgLmxvZyhcImRlYnVnLTNcIilcblxuICAgICAgICAgICAgLmxvZyhcImRlYnVnLTQsIGluY2x1ZCBgYCB3b3JkXCIpXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ3b3JrcyBsaW5ld2lzZSBmb3IgYGRlbGV0ZS1saW5lYCBvcGVyYXRvclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIG8gdiBpIGYgRFwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgfFxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcblxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcIndoZW4gc3BlY2lmaWVkIGJvdGggbyBhbmQgViBvcGVyYXRvci1tb2RpZmllclwiLCAtPlxuICAgICAgaXQgXCJkZWxldGUgYGNvbnNvbGVgIGluY2x1ZGluZyBsaW5lIGJ5IGBWYCBtb2RpZmllclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJkIG8gViBmXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICB8XG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ1cHBlci1jYXNlIGBjb25zb2xlYCBpbmNsdWRpbmcgbGluZSBieSBgVmAgbW9kaWZpZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBVIG8gViBmXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICAgIENPTlNPTEUuTE9HKFwiREVCVUctMVwiKVxuICAgICAgICAgICAgfENPTlNPTEUuTE9HKFwiREVCVUctMlwiKVxuXG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuICAgICAgICAgICAgQ09OU09MRS5MT0coXCJERUJVRy0zXCIpXG5cbiAgICAgICAgICAgIENPTlNPTEUuTE9HKFwiREVCVUctNCwgSU5DTFVEIGBDT05TT0xFYCBXT1JEXCIpXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwid2l0aCBvIG9wZXJhdG9yLW1vZGlmaWVyXCIsIC0+XG4gICAgICBpdCBcInRvZ2dsZS1saW5lLWNvbW1lbnRzIG9mIGBvY2N1cnJlbmNlYCBpbmNsZGluZyAqKmxpbmVzKipcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyAvIG8gZlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImRlYnVnLTFcIilcbiAgICAgICAgICAgIC8vIHxjb25zb2xlLmxvZyhcImRlYnVnLTJcIilcblxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZGVidWctM1wiKVxuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImRlYnVnLTQsIGluY2x1ZCBgY29uc29sZWAgd29yZFwiKVxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWJ1Zy0xXCIpXG4gICAgICAgICAgICB8Y29uc29sZS5sb2coXCJkZWJ1Zy0yXCIpXG5cbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlYnVnLTNcIilcblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWJ1Zy00LCBpbmNsdWQgYGNvbnNvbGVgIHdvcmRcIilcbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJjb25maXJtVGhyZXNob2xkT25PY2N1cnJlbmNlT3BlcmF0aW9uIGNvbmZpZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8b28gb28gb28gb28gb29cXG5cIlxuICAgICAgc3B5T24oYXRvbSwgJ2NvbmZpcm0nKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVuZGVyIHRocmVzaG9sZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJjb25maXJtVGhyZXNob2xkT25PY2N1cnJlbmNlT3BlcmF0aW9uXCIsIDEwMClcblxuICAgICAgaXQgXCJkb2VzIG5vdCBhc2sgY29uZmlybWF0aW9uIG9uIG8tbW9kaWZpZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiYyBvXCIsIG1vZGU6IFwib3BlcmF0b3ItcGVuZGluZ1wiLCBvY2N1cnJlbmNlVGV4dDogWydvbycsICdvbycsICdvbycsICdvbycsICdvbyddXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJkb2VzIG5vdCBhc2sgY29uZmlybWF0aW9uIG9uIE8tbW9kaWZpZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiYyBPXCIsIG1vZGU6IFwib3BlcmF0b3ItcGVuZGluZ1wiLCBvY2N1cnJlbmNlVGV4dDogWydvbycsICdvbycsICdvbycsICdvbycsICdvbyddXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJkb2VzIG5vdCBhc2sgY29uZmlybWF0aW9uIG9uIGBnIG9gXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgb1wiLCBtb2RlOiBcIm5vcm1hbFwiLCBvY2N1cnJlbmNlVGV4dDogWydvbycsICdvbycsICdvbycsICdvbycsICdvbyddXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJkb2VzIG5vdCBhc2sgY29uZmlybWF0aW9uIG9uIGBnIE9gXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgT1wiLCBtb2RlOiBcIm5vcm1hbFwiLCBvY2N1cnJlbmNlVGV4dDogWydvbycsICdvbycsICdvbycsICdvbycsICdvbyddXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwid2hlbiBleGNlZWRpbmcgdGhyZXNob2xkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcImNvbmZpcm1UaHJlc2hvbGRPbk9jY3VycmVuY2VPcGVyYXRpb25cIiwgMilcblxuICAgICAgaXQgXCJhc2sgY29uZmlybWF0aW9uIG9uIG8tbW9kaWZpZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiYyBvXCIsIG1vZGU6IFwib3BlcmF0b3ItcGVuZGluZ1wiLCBvY2N1cnJlbmNlVGV4dDogW11cbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlybSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwiYXNrIGNvbmZpcm1hdGlvbiBvbiBPLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImMgT1wiLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFtdXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcImNhbiBjYW5jZWwgYW5kIGNvbmZpcm0gb24gby1tb2RpZmllclwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpcm0uYW5kQ2FsbEZha2UgKHtidXR0b25zfSkgLT4gYnV0dG9ucy5pbmRleE9mKFwiQ2FuY2VsXCIpXG4gICAgICAgIGVuc3VyZSBcImMgb1wiLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFtdXG4gICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFtdXG4gICAgICAgIGF0b20uY29uZmlybS5hbmRDYWxsRmFrZSAoe2J1dHRvbnN9KSAtPiBidXR0b25zLmluZGV4T2YoXCJDb250aW51ZVwiKVxuICAgICAgICBlbnN1cmUgXCJvXCIsIG1vZGU6IFwib3BlcmF0b3ItcGVuZGluZ1wiLCBvY2N1cnJlbmNlVGV4dDogWydvbycsICdvbycsICdvbycsICdvbycsICdvbyddXG5cbiAgICAgIGl0IFwiYXNrIGNvbmZpcm1hdGlvbiBvbiBgZyBvYFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIG9cIiwgbW9kZTogXCJub3JtYWxcIiwgb2NjdXJyZW5jZVRleHQ6IFtdXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcImFzayBjb25maXJtYXRpb24gb24gYGcgT2BcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBPXCIsIG1vZGU6IFwibm9ybWFsXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJjYW4gY2FuY2VsIGFuZCBjb25maXJtIG9uIGBnIG9gXCIsIC0+XG4gICAgICAgIGF0b20uY29uZmlybS5hbmRDYWxsRmFrZSAoe2J1dHRvbnN9KSAtPiBidXR0b25zLmluZGV4T2YoXCJDYW5jZWxcIilcbiAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG1vZGU6IFwibm9ybWFsXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBlbnN1cmUgbnVsbCwgbW9kZTogXCJub3JtYWxcIiwgb2NjdXJyZW5jZVRleHQ6IFtdXG4gICAgICAgIGF0b20uY29uZmlybS5hbmRDYWxsRmFrZSAoe2J1dHRvbnN9KSAtPiBidXR0b25zLmluZGV4T2YoXCJDb250aW51ZVwiKVxuICAgICAgICBlbnN1cmUgXCJnIG9cIiwgbW9kZTogXCJub3JtYWxcIiwgb2NjdXJyZW5jZVRleHQ6IFsnb28nLCAnb28nLCAnb28nLCAnb28nLCAnb28nXVxuIl19
