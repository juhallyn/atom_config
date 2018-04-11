(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, ensureWait, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], ensureWait = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, vim;
      });
    });
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      beforeEach(function() {
        return vimState.globalState.reset('register');
      });
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("with yank command", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "aaa bbb ccc"
          });
        });
        it("save to pre specified register", function() {
          ensure('" a y i w', {
            register: {
              a: {
                text: 'aaa'
              }
            }
          });
          ensure('w " b y i w', {
            register: {
              b: {
                text: 'bbb'
              }
            }
          });
          return ensure('w " c y i w', {
            register: {
              c: {
                text: 'ccc'
              }
            }
          });
        });
        return it("work with motion which also require input such as 't'", function() {
          return ensure('" a y t c', {
            register: {
              a: {
                text: 'aaa bbb '
              }
            }
          });
        });
      });
      describe("With p command", function() {
        beforeEach(function() {
          vimState.globalState.reset('register');
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return set({
            text: "abc\ndef",
            cursor: [0, 0]
          });
        });
        describe("when specified register have no text", function() {
          it("can paste from a register", function() {
            ensure(null, {
              mode: "normal"
            });
            return ensure('" a p', {
              textC: "anew conten|tbc\ndef"
            });
          });
          return it("but do nothing for z register", function() {
            return ensure('" z p', {
              textC: "|abc\ndef"
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure('ctrl-v j " a p', {
              textC: "|new contentbc\nnew contentef"
            });
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure(null, {
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure(null, {
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure(null, {
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure(null, {
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure(null, {
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure(null, {
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure(null, {
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the numbered 0-9 register", function() {
        describe("0", function() {
          return it("keep most recent yank-ed text", function() {
            ensure(null, {
              register: {
                '"': {
                  text: 'initial clipboard content'
                },
                '0': {
                  text: void 0
                }
              }
            });
            set({
              textC: "|000"
            });
            ensure("y w", {
              register: {
                '"': {
                  text: "000"
                },
                '0': {
                  text: "000"
                }
              }
            });
            return ensure("y l", {
              register: {
                '"': {
                  text: "0"
                },
                '0': {
                  text: "0"
                }
              }
            });
          });
        });
        return describe("1-9 and small-delete(-) register", function() {
          beforeEach(function() {
            return set({
              textC: "|0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            });
          });
          it("keep deleted text", function() {
            ensure("d d", {
              textC: "|1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '1\n'
                },
                '2': {
                  text: '0\n'
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '2\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '2\n'
                },
                '2': {
                  text: '1\n'
                },
                '3': {
                  text: '0\n'
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '3\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '3\n'
                },
                '2': {
                  text: '2\n'
                },
                '3': {
                  text: '1\n'
                },
                '4': {
                  text: '0\n'
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '4\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '4\n'
                },
                '2': {
                  text: '3\n'
                },
                '3': {
                  text: '2\n'
                },
                '4': {
                  text: '1\n'
                },
                '5': {
                  text: '0\n'
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '5\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '5\n'
                },
                '2': {
                  text: '4\n'
                },
                '3': {
                  text: '3\n'
                },
                '4': {
                  text: '2\n'
                },
                '5': {
                  text: '1\n'
                },
                '6': {
                  text: '0\n'
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '6\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '6\n'
                },
                '2': {
                  text: '5\n'
                },
                '3': {
                  text: '4\n'
                },
                '4': {
                  text: '3\n'
                },
                '5': {
                  text: '2\n'
                },
                '6': {
                  text: '1\n'
                },
                '7': {
                  text: '0\n'
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|8\n9\n10\n",
              register: {
                '"': {
                  text: '7\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '7\n'
                },
                '2': {
                  text: '6\n'
                },
                '3': {
                  text: '5\n'
                },
                '4': {
                  text: '4\n'
                },
                '5': {
                  text: '3\n'
                },
                '6': {
                  text: '2\n'
                },
                '7': {
                  text: '1\n'
                },
                '8': {
                  text: '0\n'
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|9\n10\n",
              register: {
                '"': {
                  text: '8\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '8\n'
                },
                '2': {
                  text: '7\n'
                },
                '3': {
                  text: '6\n'
                },
                '4': {
                  text: '5\n'
                },
                '5': {
                  text: '4\n'
                },
                '6': {
                  text: '3\n'
                },
                '7': {
                  text: '2\n'
                },
                '8': {
                  text: '1\n'
                },
                '9': {
                  text: '0\n'
                }
              }
            });
            return ensure(".", {
              textC: "|10\n",
              register: {
                '"': {
                  text: '9\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '9\n'
                },
                '2': {
                  text: '8\n'
                },
                '3': {
                  text: '7\n'
                },
                '4': {
                  text: '6\n'
                },
                '5': {
                  text: '5\n'
                },
                '6': {
                  text: '4\n'
                },
                '7': {
                  text: '3\n'
                },
                '8': {
                  text: '2\n'
                },
                '9': {
                  text: '1\n'
                }
              }
            });
          });
          it("also keeps changed text", function() {
            return ensure("c j", {
              textC: "|\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n1\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
          });
          return describe("which goes to numbered and which goes to small-delete register", function() {
            beforeEach(function() {
              return set({
                textC: "|{abc}\n"
              });
            });
            it("small-change goes to - register", function() {
              return ensure("c $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("small-delete goes to - register", function() {
              return ensure("d $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] % motion always save to numbered", function() {
              set({
                textC: "|{abc}\n"
              });
              return ensure("d %", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc}'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] / motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|{abc}\n"
              });
              return ensure("d / } enter", {
                textC: "|}\n",
                register: {
                  '"': {
                    text: '{abc'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("/, n motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|abc axx abc\n"
              });
              ensure("d / a enter", {
                textC: "|axx abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              return ensure("d n", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: 'abc '
                  }
                }
              });
            });
            return it("?, N motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "abc axx |abc\n"
              });
              ensure("d ? a enter", {
                textC: "abc |abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              ensure("0", {
                textC: "|abc abc\n"
              });
              return ensure("c N", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: "axx "
                  }
                }
              });
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          atom.clipboard.write("clip");
          set({
            register: {
              '"': {
                text: '345'
              },
              'a': {
                text: 'abc'
              },
              '*': {
                text: 'abc'
              }
            }
          });
          set({
            textC: "01|2\n"
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          return it("inserts from \" paste clipboard content", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            atom.clipboard.write("clip");
            return ensureWait('ctrl-r "', {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          return it("inserts from \" register ", function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            atom.clipboard.write("clip");
            return ensureWait('ctrl-r "', {
              text: '013452\n'
            });
          });
        });
        return describe("insert from named register", function() {
          it("insert from 'a'", function() {
            return ensureWait('ctrl-r a', {
              textC: '01abc|2\n',
              mode: 'insert'
            });
          });
          return it("cancel with escape", function() {
            return ensureWait('ctrl-r escape', {
              textC: '01|2\n',
              mode: 'insert'
            });
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, j, len, ref1, results, selection, texts;
          texts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          ref1 = editor.getSelections();
          results = [];
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            selection = ref1[i];
            results.push(ensure(null, {
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, j, len, ref1, ref2, selection, subscriptionBySelection;
            ref1 = vimState.register, clipboardBySelection = ref1.clipboardBySelection, subscriptionBySelection = ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            ensure("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            ref2 = editor.getSelections();
            for (j = 0, len = ref2.length; j < len; j++) {
              selection = ref2[j];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            ensure("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensureWait('ctrl-r "', {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
    describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
    return describe("blackholeRegisteredOperators settings", function() {
      var originalText;
      originalText = "initial clipboard content";
      beforeEach(function() {
        return set({
          textC: "a|bc"
        });
      });
      describe("when false(default)", function() {
        it("default", function() {
          return ensure(null, {
            register: {
              '"': {
                text: originalText
              }
            }
          });
        });
        it('c update', function() {
          return ensure('c l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('C update', function() {
          return ensure('C', {
            register: {
              '"': {
                text: 'bc'
              }
            }
          });
        });
        it('x update', function() {
          return ensure('x', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('X update', function() {
          return ensure('X', {
            register: {
              '"': {
                text: 'a'
              }
            }
          });
        });
        it('y update', function() {
          return ensure('y l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('Y update', function() {
          return ensure('Y', {
            register: {
              '"': {
                text: "abc\n"
              }
            }
          });
        });
        it('s update', function() {
          return ensure('s', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('S update', function() {
          return ensure('S', {
            register: {
              '"': {
                text: 'abc\n'
              }
            }
          });
        });
        it('d update', function() {
          return ensure('d l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        return it('D update', function() {
          return ensure('D', {
            register: {
              '"': {
                text: 'bc'
              }
            }
          });
        });
      });
      return describe("when true(default)", function() {
        describe("blackhole all", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change", "change-to-last-character-of-line", "change-line", "change-occurrence", "change-occurrence-from-search", "delete", "delete-to-last-character-of-line", "delete-line", "delete-right", "delete-left", "substitute", "substitute-line", "yank", "yank-line"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X NOT update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('y NOT update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('Y NOT update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('s NOT update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('S NOT update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('d NOT update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          return it('D NOT update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
        });
        describe("blackhole selectively", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change-to-last-character-of-line", "delete-right", "substitute"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
          it('y update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('Y update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: "abc\n"
                }
              }
            });
          });
          it('s NOT update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('S update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: 'abc\n'
                }
              }
            });
          });
          it('d update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          return it('D update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        return describe("blackhole by wildcard", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change*", "delete*"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c update if specified', function() {
            return ensure('" a c l', {
              register: {
                'a': {
                  text: "b"
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X NOT update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('y update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('Y update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: "abc\n"
                }
              }
            });
          });
          it('s update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('S update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: 'abc\n'
                }
              }
            });
          });
          it('d NOT update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          return it('D NOT update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9wcmVmaXgtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFDaEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0FBQ25CLFFBQUE7SUFBQSxNQUE2RCxFQUE3RCxFQUFDLFlBQUQsRUFBTSxlQUFOLEVBQWMsbUJBQWQsRUFBMEIsZUFBMUIsRUFBa0Msc0JBQWxDLEVBQWlEO0lBRWpELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMsMkJBQWQsRUFBNEI7TUFIbEIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBO01BQ2pCLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO1FBQzFCLFVBQUEsQ0FBVyxTQUFBO2lCQUNULEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxjQUFOO1lBQXNCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTlCO1dBQUo7UUFEUyxDQUFYO1FBR0EsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUE7aUJBQ3BCLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxJQUFBLEVBQU0sV0FBTjtXQUFkO1FBRG9CLENBQXRCO2VBR0EsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7aUJBQ3JCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1lBQUEsSUFBQSxFQUFNLElBQU47V0FBaEI7UUFEcUIsQ0FBdkI7TUFQMEIsQ0FBNUI7TUFVQSxRQUFBLENBQVMsY0FBVCxFQUF5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RUE1Ym1CLENBQXJCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlByZWZpeGVzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdCwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdH0gPSB2aW1cblxuICBkZXNjcmliZSBcIlJlcGVhdFwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBvcGVyYXRpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1Njc4OWFiY1wiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgTiB0aW1lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJzMgeCcsIHRleHQ6ICc0NTY3ODlhYmMnXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOTiB0aW1lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJzEgMCB4JywgdGV4dDogJ2JjJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG1vdGlvbnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICdvbmUgdHdvIHRocmVlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIE4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6ICd0aHJlZSdcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICdvbmUgdHdvIHRocmVlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIG1vdmVtZW50cyBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgMiB3JywgY3Vyc29yOiBbMCwgOV1cblxuICBkZXNjcmliZSBcIlJlZ2lzdGVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgdmltU3RhdGUuZ2xvYmFsU3RhdGUucmVzZXQoJ3JlZ2lzdGVyJylcblxuICAgIGRlc2NyaWJlIFwidGhlIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgYSB2YWx1ZSBmb3IgZnV0dXJlIHJlYWRpbmdcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICBpdCBcIm92ZXJ3cml0ZXMgYSB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICBkZXNjcmliZSBcIndpdGggeWFuayBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWFhIGJiYiBjY2NcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic2F2ZSB0byBwcmUgc3BlY2lmaWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IGkgdycsICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICdhYWEnXG4gICAgICAgIGVuc3VyZSAndyBcIiBiIHkgaSB3JywgcmVnaXN0ZXI6IGI6IHRleHQ6ICdiYmInXG4gICAgICAgIGVuc3VyZSAndyBcIiBjIHkgaSB3JywgcmVnaXN0ZXI6IGM6IHRleHQ6ICdjY2MnXG5cbiAgICAgIGl0IFwid29yayB3aXRoIG1vdGlvbiB3aGljaCBhbHNvIHJlcXVpcmUgaW5wdXQgc3VjaCBhcyAndCdcIiwgLT5cbiAgICAgICAgZW5zdXJlICdcIiBhIHkgdCBjJywgcmVnaXN0ZXI6IGE6IHRleHQ6ICdhYWEgYmJiICdcblxuICAgIGRlc2NyaWJlIFwiV2l0aCBwIGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmltU3RhdGUuZ2xvYmFsU3RhdGUucmVzZXQoJ3JlZ2lzdGVyJylcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGRlZlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzcGVjaWZpZWQgcmVnaXN0ZXIgaGF2ZSBubyB0ZXh0XCIsIC0+XG4gICAgICAgIGl0IFwiY2FuIHBhc3RlIGZyb20gYSByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgZW5zdXJlICdcIiBhIHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgYW5ldyBjb250ZW58dGJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiYnV0IGRvIG5vdGhpbmcgZm9yIHogcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1wiIHogcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8YWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImJsb2Nrd2lzZS1tb2RlIHBhc3RlIGp1c3QgdXNlIHJlZ2lzdGVyIGhhdmUgbm8gdGV4dFwiLCAtPlxuICAgICAgICBpdCBcInBhc3RlIGZyb20gYSByZWdpc3RlciB0byBlYWNoIHNlbGN0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYgaiBcIiBhIHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfG5ldyBjb250ZW50YmNcbiAgICAgICAgICAgIG5ldyBjb250ZW50ZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgQiByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyBhIHZhbHVlIGZvciBmdXR1cmUgcmVhZGluZ1wiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICBpdCBcImFwcGVuZHMgdG8gYSB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudG5ldyBjb250ZW50J1xuXG4gICAgICBpdCBcImFwcGVuZHMgbGluZXdpc2UgdG8gYSBsaW5ld2lzZSB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxuJywgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbm5ldyBjb250ZW50XFxuJ1xuXG4gICAgICBpdCBcImFwcGVuZHMgbGluZXdpc2UgdG8gYSBjaGFyYWN0ZXIgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnRcXG4nLCB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG5uZXcgY29udGVudFxcbidcblxuICAgIGRlc2NyaWJlIFwidGhlICogcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIHRoZSBzYW1lIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnKic6IHRleHQ6ICdpbml0aWFsIGNsaXBib2FyZCBjb250ZW50JywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnKic6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgICBpdCBcIm92ZXJ3cml0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCAnbmV3IGNvbnRlbnQnXG5cbiAgICAjIEZJWE1FOiBvbmNlIGxpbnV4IHN1cHBvcnQgY29tZXMgb3V0LCB0aGlzIG5lZWRzIHRvIHJlYWQgZnJvbVxuICAgICMgdGhlIGNvcnJlY3QgY2xpcGJvYXJkLiBGb3Igbm93IGl0IGJlaGF2ZXMganVzdCBsaWtlIHRoZSAqIHJlZ2lzdGVyXG4gICAgIyBTZWUgOmhlbHAgeDExLWN1dC1idWZmZXIgYW5kIDpoZWxwIHJlZ2lzdGVycyBmb3IgbW9yZSBkZXRhaWxzIG9uIGhvdyB0aGVzZVxuICAgICMgcmVnaXN0ZXJzIHdvcmsgb24gYW4gWDExIGJhc2VkIHN5c3RlbS5cbiAgICBkZXNjcmliZSBcInRoZSArIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyB0aGUgc2FtZSB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjpcbiAgICAgICAgICAgICcqJzogdGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICAgIGl0IFwib3ZlcndyaXRlcyB0aGUgY29udGVudHMgb2YgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsICduZXcgY29udGVudCdcblxuICAgIGRlc2NyaWJlIFwidGhlIF8gcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIGFsd2F5cyB0aGUgZW1wdHkgc3RyaW5nXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnXyc6IHRleHQ6ICcnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBpdCBcInRocm93cyBhd2F5IGFueXRoaW5nIHdyaXR0ZW4gdG8gaXRcIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICAgICdfJzogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJ18nOiB0ZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgJSByZWdpc3RlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRVUkknKS5hbmRSZXR1cm4gJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwicmV0dXJucyB0aGUgZmlsZW5hbWUgb2YgdGhlIGN1cnJlbnQgZWRpdG9yXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBpdCBcInRocm93cyBhd2F5IGFueXRoaW5nIHdyaXR0ZW4gdG8gaXRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgcmVnaXN0ZXI6ICclJzogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJyUnOiB0ZXh0OiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgbnVtYmVyZWQgMC05IHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIjBcIiwgLT5cbiAgICAgICAgaXQgXCJrZWVwIG1vc3QgcmVjZW50IHlhbmstZWQgdGV4dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJ1wiJzoge3RleHQ6ICdpbml0aWFsIGNsaXBib2FyZCBjb250ZW50J30sICcwJzoge3RleHQ6IHVuZGVmaW5lZH1cbiAgICAgICAgICBzZXQgdGV4dEM6IFwifDAwMFwiXG4gICAgICAgICAgZW5zdXJlIFwieSB3XCIsIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIwMDBcIn0sICcwJzoge3RleHQ6IFwiMDAwXCJ9XG4gICAgICAgICAgZW5zdXJlIFwieSBsXCIsIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIwXCJ9LCAnMCc6IHt0ZXh0OiBcIjBcIn1cblxuICAgICAgZGVzY3JpYmUgXCIxLTkgYW5kIHNtYWxsLWRlbGV0ZSgtKSByZWdpc3RlclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInwwXFxuMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuXG4gICAgICAgIGl0IFwia2VlcCBkZWxldGVkIHRleHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGRcIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8MVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMFxcbid9LCAgICAgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzBcXG4nfSwgICAgICcyJzoge3RleHQ6IHVuZGVmaW5lZH0sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInwyXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzFcXG4nfSwgICAgICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICcxXFxuJ30sICAgICAnMic6IHt0ZXh0OiAnMFxcbid9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8M1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzJcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzJcXG4nfSwgJzInOiB7dGV4dDogJzFcXG4nfSwgJzMnOiB7dGV4dDogJzBcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzNcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzNcXG4nfSwgJzInOiB7dGV4dDogJzJcXG4nfSwgJzMnOiB7dGV4dDogJzFcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzBcXG4nfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnNFxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnNFxcbid9LCAgICAgJzInOiB7dGV4dDogJzNcXG4nfSwgICAgICczJzoge3RleHQ6ICcyXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICcxXFxuJ30sICAgICAnNSc6IHt0ZXh0OiAnMFxcbid9LCAgICAgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc1XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc1XFxuJ30sICAgICAnMic6IHt0ZXh0OiAnNFxcbid9LCAgICAgJzMnOiB7dGV4dDogJzNcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzJcXG4nfSwgICAgICc1Jzoge3RleHQ6ICcxXFxuJ30sICAgICAnNic6IHt0ZXh0OiAnMFxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8N1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnNlxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnNlxcbid9LCAnMic6IHt0ZXh0OiAnNVxcbid9LCAgICAgJzMnOiB7dGV4dDogJzRcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzNcXG4nfSwgJzUnOiB7dGV4dDogJzJcXG4nfSwgICAgICc2Jzoge3RleHQ6ICcxXFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6ICcwXFxuJ30sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw4XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzdcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzdcXG4nfSwgJzInOiB7dGV4dDogJzZcXG4nfSwgJzMnOiB7dGV4dDogJzVcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzRcXG4nfSwgJzUnOiB7dGV4dDogJzNcXG4nfSwgJzYnOiB7dGV4dDogJzJcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzFcXG4nfSwgJzgnOiB7dGV4dDogJzBcXG4nfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc4XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc4XFxuJ30sICcyJzoge3RleHQ6ICc3XFxuJ30sICczJzoge3RleHQ6ICc2XFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICc1XFxuJ30sICc1Jzoge3RleHQ6ICc0XFxuJ30sICc2Jzoge3RleHQ6ICczXFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6ICcyXFxuJ30sICc4Jzoge3RleHQ6ICcxXFxuJ30sICc5Jzoge3RleHQ6ICcwXFxuJ30sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInwxMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc5XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc5XFxuJ30sICcyJzoge3RleHQ6ICc4XFxuJ30sICczJzoge3RleHQ6ICc3XFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICc2XFxuJ30sICc1Jzoge3RleHQ6ICc1XFxuJ30sICc2Jzoge3RleHQ6ICc0XFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6ICczXFxuJ30sICc4Jzoge3RleHQ6ICcyXFxuJ30sICc5Jzoge3RleHQ6ICcxXFxuJ31cbiAgICAgICAgaXQgXCJhbHNvIGtlZXBzIGNoYW5nZWQgdGV4dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImMgalwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInxcXG4yXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzBcXG4xXFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICcwXFxuMVxcbid9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hpY2ggZ29lcyB0byBudW1iZXJlZCBhbmQgd2hpY2ggZ29lcyB0byBzbWFsbC1kZWxldGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XFxuXCJcblxuICAgICAgICAgIGl0IFwic21hbGwtY2hhbmdlIGdvZXMgdG8gLSByZWdpc3RlclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiYyAkXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxcXG5cIlxuICAgICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJ3thYmN9J30sICctJzoge3RleHQ6ICd7YWJjfSd9LFxuICAgICAgICAgICAgICAgICcxJzoge3RleHQ6IHVuZGVmaW5lZH0sICcyJzoge3RleHQ6IHVuZGVmaW5lZH0sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGl0IFwic21hbGwtZGVsZXRlIGdvZXMgdG8gLSByZWdpc3RlclwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZCAkXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxcXG5cIlxuICAgICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJ3thYmN9J30sICctJzoge3RleHQ6ICd7YWJjfSd9LFxuICAgICAgICAgICAgICAgICcxJzoge3RleHQ6IHVuZGVmaW5lZH0sICcyJzoge3RleHQ6IHVuZGVmaW5lZH0sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGl0IFwiW2V4Y2VwdGlvbl0gJSBtb3Rpb24gYWx3YXlzIHNhdmUgdG8gbnVtYmVyZWRcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCAlXCIsIHRleHRDOiBcInxcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ3thYmN9J30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICd7YWJjfSd9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9fVxuICAgICAgICAgIGl0IFwiW2V4Y2VwdGlvbl0gLyBtb3Rpb24gYWx3YXlzIHNhdmUgdG8gbnVtYmVyZWRcIiwgLT5cbiAgICAgICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVxcblwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIC8gfSBlbnRlclwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8fVxcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAne2FiYyd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAne2FiYyd9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9fVxuXG4gICAgICAgICAgaXQgXCIvLCBuIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiYyBheHggYWJjXFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgLyBhIGVudGVyXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxheHggYWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdhYmMgJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdhYmMgJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG4gICAgICAgICAgICBlbnN1cmUgXCJkIG5cIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGFiY1xcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAnYXh4ICd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAnYXh4ICd9LCAnMic6IHt0ZXh0OiAnYWJjICd9fVxuICAgICAgICAgIGl0IFwiPywgTiBtb3Rpb24gYWx3YXlzIHNhdmUgdG8gbnVtYmVyZWRcIiwgLT5cbiAgICAgICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuICAgICAgICAgICAgc2V0IHRleHRDOiBcImFiYyBheHggfGFiY1xcblwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkID8gYSBlbnRlclwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJhYmMgfGFiY1xcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAnYXh4ICd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAnYXh4ICd9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9fVxuICAgICAgICAgICAgZW5zdXJlIFwiMFwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YWJjIGFiY1xcblwiLFxuICAgICAgICAgICAgZW5zdXJlIFwiYyBOXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2FiYyAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2FiYyAnfSwgJzInOiB7dGV4dDogXCJheHggXCJ9fVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1yIGNvbW1hbmQgaW4gaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcbiAgICAgICAgc2V0XG4gICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICAgICAgJ2EnOiB0ZXh0OiAnYWJjJ1xuICAgICAgICAgICAgJyonOiB0ZXh0OiAnYWJjJ1xuICAgICAgICBzZXQgdGV4dEM6IFwiMDF8MlxcblwiXG4gICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgPSB0cnVlXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyBmcm9tIFxcXCIgcGFzdGUgY2xpcGJvYXJkIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZVxuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG4gICAgICAgICAgZW5zdXJlV2FpdCAnY3RybC1yIFwiJywgdGV4dDogJzAxY2xpcDJcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgPSBmYWxzZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgZnJvbSBcXFwiIHJlZ2lzdGVyIFwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ2N0cmwtciBcIicsIHRleHQ6ICcwMTM0NTJcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwiaW5zZXJ0IGZyb20gbmFtZWQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgZnJvbSAnYSdcIiwgLT5cbiAgICAgICAgICBlbnN1cmVXYWl0ICdjdHJsLXIgYScsIHRleHRDOiAnMDFhYmN8MlxcbicsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGl0IFwiY2FuY2VsIHdpdGggZXNjYXBlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlV2FpdCAnY3RybC1yIGVzY2FwZScsIHRleHRDOiAnMDF8MlxcbicsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcInBlciBzZWxlY3Rpb24gY2xpcGJvYXJkXCIsIC0+XG4gICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlciA9ICh0ZXh0cy4uLikgLT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiwgaSBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnKic6IHt0ZXh0OiB0ZXh0c1tpXSwgc2VsZWN0aW9uOiBzZWxlY3Rpb259XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWVcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTI6XG4gICAgICAgICAgICBhYmM6XG4gICAgICAgICAgICBkZWY6XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMV0sIFsxLCAxXSwgWzIsIDFdXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIHNlbGVjdGlvbiBkZXN0cm95ZVwiLCAtPlxuICAgICAgICBpdCBcInJlbW92ZSBjb3JyZXNwb25kaW5nIHN1YnNjcmlwdGluIGFuZCBjbGlwYm9hcmQgZW50cnlcIiwgLT5cbiAgICAgICAgICB7Y2xpcGJvYXJkQnlTZWxlY3Rpb24sIHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9ufSA9IHZpbVN0YXRlLnJlZ2lzdGVyXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuXG4gICAgICAgICAgZW5zdXJlIFwieSBpIHdcIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG5cbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgzKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDMpXG4gICAgICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKSBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG5cbiAgICAgIGRlc2NyaWJlIFwiWWFua1wiLCAtPlxuICAgICAgICBpdCBcInNhdmUgdGV4dCB0byBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBpIHdcIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG5cbiAgICAgIGRlc2NyaWJlIFwiRGVsZXRlIGZhbWlseVwiLCAtPlxuICAgICAgICBpdCBcImRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgd1wiLCB0ZXh0OiBcIjpcXG46XFxuOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcbiAgICAgICAgaXQgXCJ4XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieFwiLCB0ZXh0OiBcIjAyOlxcbmFjOlxcbmRmOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzEnLCAnYicsICdlJylcbiAgICAgICAgaXQgXCJYXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiWFwiLCB0ZXh0OiBcIjEyOlxcbmJjOlxcbmVmOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAnLCAnYScsICdkJylcbiAgICAgICAgaXQgXCJEXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiRFwiLCB0ZXh0OiBcIjBcXG5hXFxuZFxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzEyOicsICdiYzonLCAnZWY6JylcblxuICAgICAgZGVzY3JpYmUgXCJQdXQgZmFtaWx5XCIsIC0+XG4gICAgICAgIGl0IFwicCBwYXN0ZSB0ZXh0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3ICQgcFwiLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDAxMjowMTJcbiAgICAgICAgICAgICAgYWJjOmFiY1xuICAgICAgICAgICAgICBkZWY6ZGVmXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIlAgcGFzdGUgdGV4dCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgdyAkIFBcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwMTIwMTI6XG4gICAgICAgICAgICAgIGFiY2FiYzpcbiAgICAgICAgICAgICAgZGVmZGVmOlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiY3RybC1yIGluIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHdcIiwgdGV4dDogXCI6XFxuOlxcbjpcXG5cIlxuICAgICAgICAgIGVuc3VyZSAnYScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlV2FpdCAnY3RybC1yIFwiJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICA6MDEyXG4gICAgICAgICAgICAgIDphYmNcbiAgICAgICAgICAgICAgOmRlZlxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIkNvdW50IG1vZGlmaWVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiMDAwIDExMSAyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCB3JywgdGV4dDogXCIzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG1vdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6IFwiMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3IgYW5kIG1vdGlvbiByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIDIgdycsIHRleHQ6IFwiNjY2IDc3NyA4ODggOTk5XCJcbiAgZGVzY3JpYmUgXCJDb3VudCBtb2RpZmllclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIjAwMCAxMTEgMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvclwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgdycsIHRleHQ6IFwiMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBtb3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiBcIjIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yIGFuZCBtb3Rpb24gcmVzcGVjdGl2ZWx5XCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCAyIHcnLCB0ZXh0OiBcIjY2NiA3NzcgODg4IDk5OVwiXG5cbiAgZGVzY3JpYmUgXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzIHNldHRpbmdzXCIsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gXCJpbml0aWFsIGNsaXBib2FyZCBjb250ZW50XCJcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiYXxiY1wiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZmFsc2UoZGVmYXVsdClcIiwgLT5cbiAgICAgIGl0IFwiZGVmYXVsdFwiLCAgLT4gZW5zdXJlIG51bGwsICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgIGl0ICdjIHVwZGF0ZScsIC0+IGVuc3VyZSAnYyBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICBpdCAnQyB1cGRhdGUnLCAtPiBlbnN1cmUgJ0MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2JjJ31cbiAgICAgIGl0ICd4IHVwZGF0ZScsIC0+IGVuc3VyZSAneCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICBpdCAnWCB1cGRhdGUnLCAtPiBlbnN1cmUgJ1gnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2EnfVxuICAgICAgaXQgJ3kgdXBkYXRlJywgLT4gZW5zdXJlICd5IGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdZIHVwZGF0ZScsIC0+IGVuc3VyZSAnWScsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcImFiY1xcblwifVxuICAgICAgaXQgJ3MgdXBkYXRlJywgLT4gZW5zdXJlICdzJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdTIHVwZGF0ZScsIC0+IGVuc3VyZSAnUycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYWJjXFxuJ31cbiAgICAgIGl0ICdkIHVwZGF0ZScsIC0+IGVuc3VyZSAnZCBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICBpdCAnRCB1cGRhdGUnLCAtPiBlbnN1cmUgJ0QnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2JjJ31cblxuICAgIGRlc2NyaWJlIFwid2hlbiB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImJsYWNraG9sZSBhbGxcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCBcImJsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcnNcIiwgW1xuICAgICAgICAgICAgXCJjaGFuZ2VcIiAjIGNcbiAgICAgICAgICAgIFwiY2hhbmdlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmVcIiAjIENcbiAgICAgICAgICAgIFwiY2hhbmdlLWxpbmVcIiAjIEMgaW4gdmlzdWFsXG4gICAgICAgICAgICBcImNoYW5nZS1vY2N1cnJlbmNlXCJcbiAgICAgICAgICAgIFwiY2hhbmdlLW9jY3VycmVuY2UtZnJvbS1zZWFyY2hcIlxuICAgICAgICAgICAgXCJkZWxldGVcIiAjIGRcbiAgICAgICAgICAgIFwiZGVsZXRlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmVcIiAjIERcbiAgICAgICAgICAgIFwiZGVsZXRlLWxpbmVcIiAjIEQgaW4gdmlzdWFsXG4gICAgICAgICAgICBcImRlbGV0ZS1yaWdodFwiICMgeFxuICAgICAgICAgICAgXCJkZWxldGUtbGVmdFwiICMgWFxuICAgICAgICAgICAgXCJzdWJzdGl0dXRlXCIgIyBzXG4gICAgICAgICAgICBcInN1YnN0aXR1dGUtbGluZVwiICMgU1xuICAgICAgICAgICAgXCJ5YW5rXCIgIyB5XG4gICAgICAgICAgICBcInlhbmstbGluZVwiICMgWVxuICAgICAgICAgICAgIyBcImRlbGV0ZSpcIlxuICAgICAgICAgICAgIyBcImNoYW5nZSpcIlxuICAgICAgICAgICAgIyBcInlhbmsqXCJcbiAgICAgICAgICAgICMgXCJzdWJzdGl0dXRlKlwiXG4gICAgICAgICAgXVxuXG4gICAgICAgIGl0IFwiZGVmYXVsdFwiLCAgICAgIC0+IGVuc3VyZSBudWxsLCAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdjIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ2MgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnQyBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdDJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3ggTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAneCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdYIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ1gnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneSBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICd5IGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1kgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnWScsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdzIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnUyBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdTJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2QgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnZCBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdEIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ0QnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuXG4gICAgICBkZXNjcmliZSBcImJsYWNraG9sZSBzZWxlY3RpdmVseVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0IFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiLCBbXG4gICAgICAgICAgICBcImNoYW5nZS10by1sYXN0LWNoYXJhY3Rlci1vZi1saW5lXCIgIyBDXG4gICAgICAgICAgICBcImRlbGV0ZS1yaWdodFwiICMgeFxuICAgICAgICAgICAgXCJzdWJzdGl0dXRlXCIgIyBzXG4gICAgICAgICAgXVxuXG4gICAgICAgIGl0IFwiZGVmYXVsdFwiLCAgICAgIC0+IGVuc3VyZSBudWxsLCAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdjIHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ2MgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgICBpdCAnQyBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdDJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3ggTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAneCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdYIHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ1gnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2EnfVxuICAgICAgICBpdCAneSB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICd5IGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ1kgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnWScsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcImFiY1xcblwifVxuICAgICAgICBpdCAncyBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdzJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1MgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnUycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYWJjXFxuJ31cbiAgICAgICAgaXQgJ2QgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnZCBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdEIHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ0QnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2JjJ31cblxuICAgICAgZGVzY3JpYmUgXCJibGFja2hvbGUgYnkgd2lsZGNhcmRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCBcImJsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcnNcIiwgW1xuICAgICAgICAgICAgXCJjaGFuZ2UqXCIgIyBDXG4gICAgICAgICAgICBcImRlbGV0ZSpcIiAjIHhcbiAgICAgICAgICAgICMgXCJzdWJzdGl0dXRlKlwiICMgc1xuICAgICAgICAgICAgIyBcInlhbmsqXCJcbiAgICAgICAgICBdXG5cbiAgICAgICAgaXQgXCJkZWZhdWx0XCIsICAgICAgICAgICAgICAgLT4gZW5zdXJlIG51bGwsICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdjIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ2MgbCcsICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgdXBkYXRlIGlmIHNwZWNpZmllZCcsIC0+IGVuc3VyZSAnXCIgYSBjIGwnLCByZWdpc3RlcjogeydhJzogdGV4dDogXCJiXCJ9XG4gICAgICAgIGl0ICdjIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ2MgbCcsICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ0MgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnQycsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneCBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICd4JywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdYIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ1gnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3kgdXBkYXRlJywgICAgICAgICAgICAgIC0+IGVuc3VyZSAneSBsJywgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgICBpdCAnWSB1cGRhdGUnLCAgICAgICAgICAgICAgLT4gZW5zdXJlICdZJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcImFiY1xcblwifVxuICAgICAgICBpdCAncyB1cGRhdGUnLCAgICAgICAgICAgICAgLT4gZW5zdXJlICdzJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdTIHVwZGF0ZScsICAgICAgICAgICAgICAtPiBlbnN1cmUgJ1MnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNcXG4nfVxuICAgICAgICBpdCAnZCBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdkIGwnLCAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdEIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ0QnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiJdfQ==
