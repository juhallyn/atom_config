(function() {
  var Ex, ExClass, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  ExClass = require('../lib/ex');

  Ex = ExClass.singleton();

  describe("the commands", function() {
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, openEx, projectPath, ref, submitNormalModeInputText, vimState;
    ref = [], editor = ref[0], editorElement = ref[1], vimState = ref[2], exState = ref[3], dir = ref[4], dir2 = ref[5];
    projectPath = function(fileName) {
      return path.join(dir, fileName);
    };
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode-plus');
      exMode = atom.packages.loadPackage('ex-mode');
      waitsForPromise(function() {
        var activationPromise;
        activationPromise = exMode.activate();
        helpers.activateExMode();
        return activationPromise;
      });
      runs(function() {
        return spyOn(exMode.mainModule.globalExState, 'setVim').andCallThrough();
      });
      waitsForPromise(function() {
        return vimMode.activate();
      });
      waitsFor(function() {
        return exMode.mainModule.globalExState.setVim.calls.length > 0;
      });
      return runs(function() {
        dir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        dir2 = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        fs.makeTreeSync(dir);
        fs.makeTreeSync(dir2);
        atom.project.setPaths([dir, dir2]);
        return helpers.getEditorElement(function(element) {
          atom.commands.dispatch(element, "ex-mode:open");
          atom.commands.dispatch(element.getModel().normalModeInputView.editorElement, "core:cancel");
          editorElement = element;
          editor = editorElement.getModel();
          vimState = vimMode.mainModule.getEditorState(editor);
          exState = exMode.mainModule.exStates.get(editor);
          vimState.resetNormalMode();
          return editor.setText("abc\ndef\nabc\ndef");
        });
      });
    });
    afterEach(function() {
      fs.removeSync(dir);
      return fs.removeSync(dir2);
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    normalModeInputKeydown = function(key, opts) {
      if (opts == null) {
        opts = {};
      }
      return editor.normalModeInputView.editorElement.getModel().setText(key);
    };
    submitNormalModeInputText = function(text) {
      var commandEditor;
      commandEditor = editor.normalModeInputView.editorElement;
      commandEditor.getModel().setText(text);
      return atom.commands.dispatch(commandEditor, "core:confirm");
    };
    openEx = function() {
      return atom.commands.dispatch(editorElement, "ex-mode:open");
    };
    describe("as a motion", function() {
      beforeEach(function() {
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("moves the cursor to a specific line", function() {
        openEx();
        submitNormalModeInputText('2');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
      it("moves to the second address", function() {
        openEx();
        submitNormalModeInputText('1,3');
        return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
      });
      it("works with offsets", function() {
        openEx();
        submitNormalModeInputText('2+1');
        expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        openEx();
        submitNormalModeInputText('-2');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("limits to the last line", function() {
        openEx();
        submitNormalModeInputText('10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('3,10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('$+1000');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("goes to the first line with address 0", function() {
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0,0');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("doesn't move when the address is the current line", function() {
        openEx();
        submitNormalModeInputText('.');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        openEx();
        submitNormalModeInputText(',');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("moves to the last line", function() {
        openEx();
        submitNormalModeInputText('$');
        return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
      });
      it("moves to a mark's line", function() {
        keydown('l');
        keydown('m');
        normalModeInputKeydown('a');
        keydown('j');
        openEx();
        submitNormalModeInputText("'a");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      return it("moves to a specified search", function() {
        openEx();
        submitNormalModeInputText('/def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('?def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([3, 0]);
        openEx();
        submitNormalModeInputText('/ef');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
    });
    describe(":write", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('write-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('write');
          expect(fs.existsSync(filePath)).toBe(true);
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
          return expect(editor.isModified()).toBe(false);
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("write-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("saves the file", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('write');
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc');
          return expect(editor.isModified()).toBe(false);
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("write " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(true);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          openEx();
          submitNormalModeInputText('write path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('write-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("write " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :write!", function() {
            openEx();
            submitNormalModeInputText("write! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":wall", function() {
      return it("saves all", function() {
        spyOn(atom.workspace, 'saveAll');
        openEx();
        submitNormalModeInputText('wall');
        return expect(atom.workspace.saveAll).toHaveBeenCalled();
      });
    });
    describe(":saveas", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('saveas-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('saveas');
          expect(fs.existsSync(filePath)).toBe(true);
          return expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("saveas-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("complains if no path given", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Argument required');
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("saveas " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(false);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          openEx();
          submitNormalModeInputText('saveas path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('saveas-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("saveas " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :saveas!", function() {
            openEx();
            submitNormalModeInputText("saveas! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":quit", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'destroyActiveItem').andCallThrough();
          return atom.workspace.open();
        });
      });
      it("closes the active pane item if not modified", function() {
        openEx();
        submitNormalModeInputText('quit');
        expect(pane.destroyActiveItem).toHaveBeenCalled();
        return expect(pane.getItems().length).toBe(1);
      });
      return describe("when the active pane item is modified", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('def');
        });
        return it("opens the prompt to save", function() {
          spyOn(pane, 'promptToSaveItem');
          openEx();
          submitNormalModeInputText('quit');
          return expect(pane.promptToSaveItem).toHaveBeenCalled();
        });
      });
    });
    describe(":quitall", function() {
      return it("closes Atom", function() {
        spyOn(atom, 'close');
        openEx();
        submitNormalModeInputText('quitall');
        return expect(atom.close).toHaveBeenCalled();
      });
    });
    describe(":tabclose", function() {
      return it("acts as an alias to :quit", function() {
        var ref1;
        spyOn(Ex, 'tabclose').andCallThrough();
        spyOn(Ex, 'quit').andCallThrough();
        openEx();
        submitNormalModeInputText('tabclose');
        return (ref1 = expect(Ex.quit)).toHaveBeenCalledWith.apply(ref1, Ex.tabclose.calls[0].args);
      });
    });
    describe(":tabnext", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the next tab", function() {
        pane.activateItemAtIndex(1);
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(2);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(pane.getItems().length - 1);
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
    });
    describe(":tabprevious", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the previous tab", function() {
        pane.activateItemAtIndex(1);
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(0);
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(pane.getItems().length - 1);
      });
    });
    describe(":wq", function() {
      beforeEach(function() {
        spyOn(Ex, 'write').andCallThrough();
        return spyOn(Ex, 'quit');
      });
      it("writes the file, then quits", function() {
        spyOn(atom, 'showSaveDialogSync').andReturn(projectPath('wq-1'));
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
      it("doesn't quit when the file is new and no path is specified in the save dialog", function() {
        var wasNotCalled;
        spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        wasNotCalled = false;
        setImmediate((function() {
          return wasNotCalled = !Ex.quit.wasCalled;
        }));
        return waitsFor((function() {
          return wasNotCalled;
        }), 100);
      });
      return it("passes the file name", function() {
        openEx();
        submitNormalModeInputText('wq wq-2');
        expect(Ex.write).toHaveBeenCalled();
        expect(Ex.write.calls[0].args[0].args.trim()).toEqual('wq-2');
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
    });
    describe(":xit", function() {
      return it("acts as an alias to :wq", function() {
        spyOn(Ex, 'wq');
        openEx();
        submitNormalModeInputText('xit');
        return expect(Ex.wq).toHaveBeenCalled();
      });
    });
    describe(":x", function() {
      return it("acts as an alias to :xit", function() {
        spyOn(Ex, 'xit');
        openEx();
        submitNormalModeInputText('x');
        return expect(Ex.xit).toHaveBeenCalled();
      });
    });
    describe(":wqall", function() {
      return it("calls :wall, then :quitall", function() {
        spyOn(Ex, 'wall');
        spyOn(Ex, 'quitall');
        openEx();
        submitNormalModeInputText('wqall');
        expect(Ex.wall).toHaveBeenCalled();
        return expect(Ex.quitall).toHaveBeenCalled();
      });
    });
    describe(":edit", function() {
      describe("without a file name", function() {
        it("reloads the file from the disk", function() {
          var filePath;
          filePath = projectPath("edit-1");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit');
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 100);
        });
        it("doesn't reload when the file has been modified", function() {
          var filePath, isntDef;
          filePath = projectPath("edit-2");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No write since last change (add ! to override)');
          isntDef = false;
          setImmediate(function() {
            return isntDef = editor.getText() !== 'def';
          });
          return waitsFor((function() {
            return isntDef;
          }), "the editor's content not to change", 50);
        });
        it("reloads when the file has been modified and it is forced", function() {
          var filePath;
          filePath = projectPath("edit-3");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit!');
          expect(atom.notifications.notifications.length).toBe(0);
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 50);
        });
        return it("throws an error when editing a new file", function() {
          editor.getBuffer().reload();
          openEx();
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No file name');
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText('edit!');
          return expect(atom.notifications.notifications[1].message).toEqual('Command error: No file name');
        });
      });
      return describe("with a file name", function() {
        beforeEach(function() {
          spyOn(atom.workspace, 'open');
          return editor.getBuffer().reload();
        });
        it("opens the specified path", function() {
          var filePath;
          filePath = projectPath('edit-new-test');
          openEx();
          submitNormalModeInputText("edit " + filePath);
          return expect(atom.workspace.open).toHaveBeenCalledWith(filePath);
        });
        it("opens a relative path", function() {
          openEx();
          submitNormalModeInputText('edit edit-relative-test');
          return expect(atom.workspace.open).toHaveBeenCalledWith(projectPath('edit-relative-test'));
        });
        return it("throws an error if trying to open more than one file", function() {
          openEx();
          submitNormalModeInputText('edit edit-new-test-1 edit-new-test-2');
          expect(atom.workspace.open.callCount).toBe(0);
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
      });
    });
    describe(":tabedit", function() {
      it("acts as an alias to :edit if supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'edit');
        openEx();
        submitNormalModeInputText('tabedit tabedit-test');
        return (ref1 = expect(Ex.edit)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
      return it("acts as an alias to :tabnew if not supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'tabnew');
        openEx();
        submitNormalModeInputText('tabedit  ');
        return (ref1 = expect(Ex.tabnew)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
    });
    describe(":tabnew", function() {
      it("opens a new tab", function() {
        spyOn(atom.workspace, 'open');
        openEx();
        submitNormalModeInputText('tabnew');
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      return it("opens a new tab for editing when provided an argument", function() {
        var ref1;
        spyOn(Ex, 'tabnew').andCallThrough();
        spyOn(Ex, 'tabedit');
        openEx();
        submitNormalModeInputText('tabnew tabnew-test');
        return (ref1 = expect(Ex.tabedit)).toHaveBeenCalledWith.apply(ref1, Ex.tabnew.calls[0].args);
      });
    });
    describe(":split", function() {
      return it("splits the current file upwards/downward", function() {
        var filePath, pane;
        pane = atom.workspace.getActivePane();
        if (atom.config.get('ex-mode.splitbelow')) {
          spyOn(pane, 'splitDown').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitDown).toHaveBeenCalled();
        } else {
          spyOn(pane, 'splitUp').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitUp).toHaveBeenCalled();
        }
      });
    });
    describe(":vsplit", function() {
      return it("splits the current file to the left/right", function() {
        var filePath, pane;
        if (atom.config.get('ex-mode.splitright')) {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitRight').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        } else {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitLeft').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        }
      });
    });
    describe(":delete", function() {
      beforeEach(function() {
        editor.setText('abc\ndef\nghi\njkl');
        return editor.setCursorBufferPosition([2, 0]);
      });
      it("deletes the current line", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(editor.getText()).toEqual('abc\ndef\njkl');
      });
      it("copies the deleted text", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(atom.clipboard.read()).toEqual('ghi\n');
      });
      it("deletes the lines in the given range", function() {
        var processedOpStack;
        processedOpStack = false;
        exState.onDidProcessOpStack(function() {
          return processedOpStack = true;
        });
        openEx();
        submitNormalModeInputText('1,2delete');
        expect(editor.getText()).toEqual('ghi\njkl');
        waitsFor(function() {
          return processedOpStack;
        });
        editor.setText('abc\ndef\nghi\njkl');
        editor.setCursorBufferPosition([1, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(',/k/delete');
        return expect(editor.getText()).toEqual('abc\n');
      });
      return it("undos deleting several lines at once", function() {
        openEx();
        submitNormalModeInputText('-1,.delete');
        expect(editor.getText()).toEqual('abc\njkl');
        atom.commands.dispatch(editorElement, 'core:undo');
        return expect(editor.getText()).toEqual('abc\ndef\nghi\njkl');
      });
    });
    describe(":substitute", function() {
      beforeEach(function() {
        editor.setText('abcaABC\ndefdDEF\nabcaABC');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("replaces a character on the current line", function() {
        openEx();
        submitNormalModeInputText(':substitute /a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("doesn't need a space before the arguments", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("respects modifiers passed to it", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x/g');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':substitute/a/x/gi');
        return expect(editor.getText()).toEqual('xbcxxBC\ndefdDEF\nabcaABC');
      });
      it("replaces on multiple lines", function() {
        openEx();
        submitNormalModeInputText(':%substitute/abc/ghi');
        expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nghiaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':%substitute/abc/ghi/ig');
        return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nghiaghi');
      });
      it("set gdefault option", function() {
        openEx();
        atom.config.set('ex-mode.gdefault', true);
        submitNormalModeInputText(':substitute/a/x');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        atom.config.set('ex-mode.gdefault', true);
        submitNormalModeInputText(':substitute/a/x/g');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      describe(":yank", function() {
        beforeEach(function() {
          editor.setText('abc\ndef\nghi\njkl');
          return editor.setCursorBufferPosition([2, 0]);
        });
        it("yanks the current line", function() {
          openEx();
          submitNormalModeInputText('yank');
          return expect(atom.clipboard.read()).toEqual('ghi\n');
        });
        return it("yanks the lines in the given range", function() {
          openEx();
          submitNormalModeInputText('1,2yank');
          return expect(atom.clipboard.read()).toEqual('abc\ndef\n');
        });
      });
      describe("illegal delimiters", function() {
        var test;
        test = function(delim) {
          openEx();
          submitNormalModeInputText(":substitute " + delim + "a" + delim + "x" + delim + "gi");
          expect(atom.notifications.notifications[0].message).toEqual("Command error: Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
          return expect(editor.getText()).toEqual('abcaABC\ndefdDEF\nabcaABC');
        };
        it("can't be delimited by letters", function() {
          return test('n');
        });
        it("can't be delimited by numbers", function() {
          return test('3');
        });
        it("can't be delimited by '\\'", function() {
          return test('\\');
        });
        it("can't be delimited by '\"'", function() {
          return test('"');
        });
        return it("can't be delimited by '|'", function() {
          return test('|');
        });
      });
      describe("empty replacement", function() {
        beforeEach(function() {
          return editor.setText('abcabc\nabcabc');
        });
        it("removes the pattern without modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//");
          return expect(editor.getText()).toEqual('abc\nabcabc');
        });
        return it("removes the pattern with modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//g");
          return expect(editor.getText()).toEqual('\nabcabc');
        });
      });
      describe("replacing with escape sequences", function() {
        var test;
        beforeEach(function() {
          return editor.setText('abc,def,ghi');
        });
        test = function(escapeChar, escaped) {
          openEx();
          submitNormalModeInputText(":substitute/,/\\" + escapeChar + "/g");
          return expect(editor.getText()).toEqual("abc" + escaped + "def" + escaped + "ghi");
        };
        it("replaces with a tab", function() {
          return test('t', '\t');
        });
        it("replaces with a linefeed", function() {
          return test('n', '\n');
        });
        return it("replaces with a carriage return", function() {
          return test('r', '\r');
        });
      });
      describe("case sensitivity", function() {
        describe("respects the smartcase setting", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is on and the pattern is lowercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("uses case sensitive search if smartcase is on and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
        });
        return describe("\\c and \\C in the pattern", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is off and \c is in the pattern", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc\\c/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("doesn't matter where in the pattern \\c is", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/a\\cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is on, \\C is in the pattern and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\C comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cb\\cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\c comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\cb\\Cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("overrides an appended /i flag with \\C", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/ab\\Cc/ghi/gi');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
        });
      });
      return describe("capturing groups", function() {
        beforeEach(function() {
          return editor.setText('abcaABC\ndefdDEF\nabcaABC');
        });
        it("replaces \\1 with the first group", function() {
          openEx();
          submitNormalModeInputText(':substitute/bc(.{2})/X\\1X');
          return expect(editor.getText()).toEqual('aXaAXBC\ndefdDEF\nabcaABC');
        });
        it("replaces multiple groups", function() {
          openEx();
          submitNormalModeInputText(':substitute/a([a-z]*)aA([A-Z]*)/X\\1XY\\2Y');
          return expect(editor.getText()).toEqual('XbcXYBCY\ndefdDEF\nabcaABC');
        });
        return it("replaces \\0 with the entire match", function() {
          openEx();
          submitNormalModeInputText(':substitute/ab(ca)AB/X\\0X');
          return expect(editor.getText()).toEqual('XabcaABXC\ndefdDEF\nabcaABC');
        });
      });
    });
    describe(":set", function() {
      it("throws an error without a specified option", function() {
        openEx();
        submitNormalModeInputText(':set');
        return expect(atom.notifications.notifications[0].message).toEqual('Command error: No option specified');
      });
      it("sets multiple options at once", function() {
        atom.config.set('editor.showInvisibles', false);
        atom.config.set('editor.showLineNumbers', false);
        openEx();
        submitNormalModeInputText(':set list number');
        expect(atom.config.get('editor.showInvisibles')).toBe(true);
        return expect(atom.config.get('editor.showLineNumbers')).toBe(true);
      });
      return describe("the options", function() {
        beforeEach(function() {
          atom.config.set('editor.showInvisibles', false);
          return atom.config.set('editor.showLineNumbers', false);
        });
        it("sets (no)list", function() {
          openEx();
          submitNormalModeInputText(':set list');
          expect(atom.config.get('editor.showInvisibles')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nolist');
          return expect(atom.config.get('editor.showInvisibles')).toBe(false);
        });
        it("sets (no)nu(mber)", function() {
          openEx();
          submitNormalModeInputText(':set nu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set number');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonumber');
          return expect(atom.config.get('editor.showLineNumbers')).toBe(false);
        });
        it("sets (no)sp(lit)r(ight)", function() {
          openEx();
          submitNormalModeInputText(':set spr');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nospr');
          expect(atom.config.get('ex-mode.splitright')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitright');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitright');
          return expect(atom.config.get('ex-mode.splitright')).toBe(false);
        });
        it("sets (no)s(plit)b(elow)", function() {
          openEx();
          submitNormalModeInputText(':set sb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitbelow');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitbelow');
          return expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
        });
        it("sets (no)s(mart)c(a)s(e)", function() {
          openEx();
          submitNormalModeInputText(':set scs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set noscs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
          openEx();
          submitNormalModeInputText(':set smartcase');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set nosmartcase');
          return expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
        });
        return it("sets (no)gdefault", function() {
          openEx();
          submitNormalModeInputText(':set gdefault');
          expect(atom.config.get('ex-mode.gdefault')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nogdefault');
          return expect(atom.config.get('ex-mode.gdefault')).toBe(false);
        });
      });
    });
    describe("aliases", function() {
      it("calls the aliased function without arguments", function() {
        ExClass.registerAlias('W', 'w');
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        return expect(Ex.write).toHaveBeenCalled();
      });
      return it("calls the aliased function with arguments", function() {
        var WArgs, writeArgs;
        ExClass.registerAlias('W', 'write');
        spyOn(Ex, 'W').andCallThrough();
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        WArgs = Ex.W.calls[0].args[0];
        writeArgs = Ex.write.calls[0].args[0];
        return expect(WArgs).toBe(writeArgs);
      });
    });
    describe("with selections", function() {
      it("executes on the selected range", function() {
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        return expect(Ex.s.calls[0].args[0].range).toEqual([0, 2]);
      });
      return it("calls the functions multiple times if there are multiple selections", function() {
        var calls;
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        editor.addCursorAtBufferPosition([3, 0]);
        editor.selectToBufferPosition([3, 2]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        calls = Ex.s.calls;
        expect(calls.length).toEqual(2);
        expect(calls[0].args[0].range).toEqual([0, 2]);
        return expect(calls[1].args[0].range).toEqual([3, 3]);
      });
    });
    return describe(':sort', function() {
      beforeEach(function() {
        editor.setText('ghi\nabc\njkl\ndef\n142\nzzz\n91xfds9\n');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("sorts entire file if range is not multi-line", function() {
        openEx();
        submitNormalModeInputText('sort');
        return expect(editor.getText()).toEqual('142\n91xfds9\nabc\ndef\nghi\njkl\nzzz\n');
      });
      return it("sorts specific range if range is multi-line", function() {
        openEx();
        submitNormalModeInputText('2,4sort');
        return expect(editor.getText()).toEqual('ghi\nabc\ndef\njkl\n142\nzzz\n91xfds9\n');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvc3BlYy9leC1jb21tYW5kcy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUjs7RUFFVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1YsRUFBQSxHQUFLLE9BQU8sQ0FBQyxTQUFSLENBQUE7O0VBRUwsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtBQUN2QixRQUFBO0lBQUEsTUFBd0QsRUFBeEQsRUFBQyxlQUFELEVBQVMsc0JBQVQsRUFBd0IsaUJBQXhCLEVBQWtDLGdCQUFsQyxFQUEyQyxZQUEzQyxFQUFnRDtJQUNoRCxXQUFBLEdBQWMsU0FBQyxRQUFEO2FBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsUUFBZjtJQUFkO0lBQ2QsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixlQUExQjtNQUNWLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsU0FBMUI7TUFDVCxlQUFBLENBQWdCLFNBQUE7QUFDZCxZQUFBO1FBQUEsaUJBQUEsR0FBb0IsTUFBTSxDQUFDLFFBQVAsQ0FBQTtRQUNwQixPQUFPLENBQUMsY0FBUixDQUFBO2VBQ0E7TUFIYyxDQUFoQjtNQUtBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsS0FBQSxDQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBeEIsRUFBdUMsUUFBdkMsQ0FBZ0QsQ0FBQyxj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QUE1QjtXQXNCQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO01BQ2hCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsTUFBTSxDQUFDLE9BQVAsQ0FBZSx5Q0FBZjtlQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO01BRlMsQ0FBWDtNQUlBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO1FBQ2pELE1BQUEsQ0FBQTtRQUNBLHlCQUFBLENBQTBCLE1BQTFCO2VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLE9BQXpCLENBQWlDLHlDQUFqQztNQUhpRCxDQUFuRDthQUtBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBO1FBQ2hELE1BQUEsQ0FBQTtRQUNBLHlCQUFBLENBQTBCLFNBQTFCO2VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLE9BQXpCLENBQWlDLHlDQUFqQztNQUhnRCxDQUFsRDtJQVZnQixDQUFsQjtFQXArQnVCLENBQXpCO0FBVEEiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG51dWlkID0gcmVxdWlyZSAnbm9kZS11dWlkJ1xuaGVscGVycyA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbkV4Q2xhc3MgPSByZXF1aXJlKCcuLi9saWIvZXgnKVxuRXggPSBFeENsYXNzLnNpbmdsZXRvbigpXG5cbmRlc2NyaWJlIFwidGhlIGNvbW1hbmRzXCIsIC0+XG4gIFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlLCBleFN0YXRlLCBkaXIsIGRpcjJdID0gW11cbiAgcHJvamVjdFBhdGggPSAoZmlsZU5hbWUpIC0+IHBhdGguam9pbihkaXIsIGZpbGVOYW1lKVxuICBiZWZvcmVFYWNoIC0+XG4gICAgdmltTW9kZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIGV4TW9kZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2V4LW1vZGUnKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYWN0aXZhdGlvblByb21pc2UgPSBleE1vZGUuYWN0aXZhdGUoKVxuICAgICAgaGVscGVycy5hY3RpdmF0ZUV4TW9kZSgpXG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gICAgcnVucyAtPlxuICAgICAgc3B5T24oZXhNb2RlLm1haW5Nb2R1bGUuZ2xvYmFsRXhTdGF0ZSwgJ3NldFZpbScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgdmltTW9kZS5hY3RpdmF0ZSgpXG5cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgZXhNb2RlLm1haW5Nb2R1bGUuZ2xvYmFsRXhTdGF0ZS5zZXRWaW0uY2FsbHMubGVuZ3RoID4gMFxuXG4gICAgcnVucyAtPlxuICAgICAgZGlyID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBcImF0b20tZXgtbW9kZS1zcGVjLSN7dXVpZC52NCgpfVwiKVxuICAgICAgZGlyMiA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgXCJhdG9tLWV4LW1vZGUtc3BlYy0je3V1aWQudjQoKX1cIilcbiAgICAgIGZzLm1ha2VUcmVlU3luYyhkaXIpXG4gICAgICBmcy5tYWtlVHJlZVN5bmMoZGlyMilcbiAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZGlyLCBkaXIyXSlcblxuICAgICAgaGVscGVycy5nZXRFZGl0b3JFbGVtZW50IChlbGVtZW50KSAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVsZW1lbnQsIFwiZXgtbW9kZTpvcGVuXCIpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWxlbWVudC5nZXRNb2RlbCgpLm5vcm1hbE1vZGVJbnB1dFZpZXcuZWRpdG9yRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvcmU6Y2FuY2VsXCIpXG4gICAgICAgIGVkaXRvckVsZW1lbnQgPSBlbGVtZW50XG4gICAgICAgIGVkaXRvciA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKVxuICAgICAgICB2aW1TdGF0ZSA9IHZpbU1vZGUubWFpbk1vZHVsZS5nZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG4gICAgICAgIGV4U3RhdGUgPSBleE1vZGUubWFpbk1vZHVsZS5leFN0YXRlcy5nZXQoZWRpdG9yKVxuICAgICAgICB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcImFiY1xcbmRlZlxcbmFiY1xcbmRlZlwiKVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIGZzLnJlbW92ZVN5bmMoZGlyKVxuICAgIGZzLnJlbW92ZVN5bmMoZGlyMilcblxuICBrZXlkb3duID0gKGtleSwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zLmVsZW1lbnQgPz0gZWRpdG9yRWxlbWVudFxuICAgIGhlbHBlcnMua2V5ZG93bihrZXksIG9wdGlvbnMpXG5cbiAgbm9ybWFsTW9kZUlucHV0S2V5ZG93biA9IChrZXksIG9wdHMgPSB7fSkgLT5cbiAgICBlZGl0b3Iubm9ybWFsTW9kZUlucHV0Vmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0VGV4dChrZXkpXG5cbiAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCA9ICh0ZXh0KSAtPlxuICAgIGNvbW1hbmRFZGl0b3IgPSBlZGl0b3Iubm9ybWFsTW9kZUlucHV0Vmlldy5lZGl0b3JFbGVtZW50XG4gICAgY29tbWFuZEVkaXRvci5nZXRNb2RlbCgpLnNldFRleHQodGV4dClcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGNvbW1hbmRFZGl0b3IsIFwiY29yZTpjb25maXJtXCIpXG5cbiAgb3BlbkV4ID0gLT5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsIFwiZXgtbW9kZTpvcGVuXCIpXG5cbiAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gYSBzcGVjaWZpYyBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMidcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsxLCAwXVxuXG4gICAgaXQgXCJtb3ZlcyB0byB0aGUgc2Vjb25kIGFkZHJlc3NcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcxLDMnXG5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMiwgMF1cblxuICAgIGl0IFwid29ya3Mgd2l0aCBvZmZzZXRzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMisxJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsyLCAwXVxuXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnLTInXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcImxpbWl0cyB0byB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMTAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzMsIDBdXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMywxMCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMywgMF1cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICckKzEwMDAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzMsIDBdXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgaXQgXCJnb2VzIHRvIHRoZSBmaXJzdCBsaW5lIHdpdGggYWRkcmVzcyAwXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDBdKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMCwwJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgd2hlbiB0aGUgYWRkcmVzcyBpcyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnLidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJywnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcIm1vdmVzIHRvIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICckJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFszLCAwXVxuXG4gICAgaXQgXCJtb3ZlcyB0byBhIG1hcmsncyBsaW5lXCIsIC0+XG4gICAgICBrZXlkb3duKCdsJylcbiAgICAgIGtleWRvd24oJ20nKVxuICAgICAgbm9ybWFsTW9kZUlucHV0S2V5ZG93biAnYSdcbiAgICAgIGtleWRvd24oJ2onKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgXCInYVwiXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcIm1vdmVzIHRvIGEgc3BlY2lmaWVkIHNlYXJjaFwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJy9kZWYnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzEsIDBdXG5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnP2RlZidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMSwgMF1cblxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCAwXSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcvZWYnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzEsIDBdXG5cbiAgZGVzY3JpYmUgXCI6d3JpdGVcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gZWRpdGluZyBhIG5ldyBmaWxlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNcXG5kZWYnKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUnKVxuICAgICAgICBleHBlY3QoYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcInNhdmVzIHdoZW4gYSBwYXRoIGlzIHNwZWNpZmllZCBpbiB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnd3JpdGUtZnJvbS1zYXZlLWRpYWxvZycpXG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4oZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlJylcbiAgICAgICAgZXhwZWN0KGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKS50b0JlKHRydWUpXG4gICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmNcXG5kZWYnKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzYXZlcyB3aGVuIGEgcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4odW5kZWZpbmVkKVxuICAgICAgICBzcHlPbihmcywgJ3dyaXRlRmlsZVN5bmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cml0ZScpXG4gICAgICAgIGV4cGVjdChmcy53cml0ZUZpbGVTeW5jLmNhbGxzLmxlbmd0aCkudG9CZSgwKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVkaXRpbmcgYW4gZXhpc3RpbmcgZmlsZVwiLCAtPlxuICAgICAgZmlsZVBhdGggPSAnJ1xuICAgICAgaSA9IDBcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBpKytcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aChcIndyaXRlLSN7aX1cIilcbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZicpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG5cbiAgICAgIGl0IFwic2F2ZXMgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlJylcbiAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuaXNNb2RpZmllZCgpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggYSBzcGVjaWZpZWQgcGF0aFwiLCAtPlxuICAgICAgICBuZXdQYXRoID0gJydcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGgucmVsYXRpdmUoZGlyLCBcIiN7ZmlsZVBhdGh9Lm5ld1wiKVxuICAgICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmMnKVxuICAgICAgICAgIG9wZW5FeCgpXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIndyaXRlICN7bmV3UGF0aH1cIilcbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZXNvbHZlKGRpciwgZnMubm9ybWFsaXplKG5ld1BhdGgpKVxuICAgICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKG5ld1BhdGgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhuZXdQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZSh0cnVlKVxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMobmV3UGF0aClcblxuICAgICAgICBpdCBcInNhdmVzIHRvIHRoZSBwYXRoXCIsIC0+XG5cbiAgICAgICAgaXQgXCJleHBhbmRzIC5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCcuJywgbmV3UGF0aClcblxuICAgICAgICBpdCBcImV4cGFuZHMgLi5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCcuLicsIG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJleHBhbmRzIH5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCd+JywgbmV3UGF0aClcblxuICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3Igd2l0aCBtb3JlIHRoYW4gb25lIHBhdGhcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUgcGF0aDEgcGF0aDInKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogT25seSBvbmUgZmlsZSBuYW1lIGFsbG93ZWQnXG4gICAgICAgIClcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgIGV4aXN0c1BhdGggPSAnJ1xuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBleGlzdHNQYXRoID0gcHJvamVjdFBhdGgoJ3dyaXRlLWV4aXN0cycpXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhleGlzdHNQYXRoLCAnYWJjJylcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKGV4aXN0c1BhdGgpXG5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJ3cml0ZSAje2V4aXN0c1BhdGh9XCIpXG4gICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogRmlsZSBleGlzdHMgKGFkZCAhIHRvIG92ZXJyaWRlKSdcbiAgICAgICAgICApXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcblxuICAgICAgICBpdCBcIndyaXRlcyBpZiBmb3JjZWQgd2l0aCA6d3JpdGUhXCIsIC0+XG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwid3JpdGUhICN7ZXhpc3RzUGF0aH1cIilcbiAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMpLnRvRXF1YWwoW10pXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcblxuICBkZXNjcmliZSBcIjp3YWxsXCIsIC0+XG4gICAgaXQgXCJzYXZlcyBhbGxcIiwgLT5cbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnc2F2ZUFsbCcpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd2FsbCcpXG4gICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uuc2F2ZUFsbCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCI6c2F2ZWFzXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVkaXRpbmcgYSBuZXcgZmlsZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjXFxuZGVmJylcblxuICAgICAgaXQgXCJvcGVucyB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcycpXG4gICAgICAgIGV4cGVjdChhdG9tLnNob3dTYXZlRGlhbG9nU3luYykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwic2F2ZXMgd2hlbiBhIHBhdGggaXMgc3BlY2lmaWVkIGluIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCdzYXZlYXMtZnJvbS1zYXZlLWRpYWxvZycpXG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4oZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcycpXG4gICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSkudG9CZSh0cnVlKVxuICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcblxuICAgICAgaXQgXCJzYXZlcyB3aGVuIGEgcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4odW5kZWZpbmVkKVxuICAgICAgICBzcHlPbihmcywgJ3dyaXRlRmlsZVN5bmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzYXZlYXMnKVxuICAgICAgICBleHBlY3QoZnMud3JpdGVGaWxlU3luYy5jYWxscy5sZW5ndGgpLnRvQmUoMClcblxuICAgIGRlc2NyaWJlIFwid2hlbiBlZGl0aW5nIGFuIGV4aXN0aW5nIGZpbGVcIiwgLT5cbiAgICAgIGZpbGVQYXRoID0gJydcbiAgICAgIGkgPSAwXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgaSsrXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJzYXZlYXMtI3tpfVwiKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmJylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcblxuICAgICAgaXQgXCJjb21wbGFpbnMgaWYgbm8gcGF0aCBnaXZlblwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc2F2ZWFzJylcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IEFyZ3VtZW50IHJlcXVpcmVkJ1xuICAgICAgICApXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBhIHNwZWNpZmllZCBwYXRoXCIsIC0+XG4gICAgICAgIG5ld1BhdGggPSAnJ1xuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZWxhdGl2ZShkaXIsIFwiI3tmaWxlUGF0aH0ubmV3XCIpXG4gICAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgICAgb3BlbkV4KClcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwic2F2ZWFzICN7bmV3UGF0aH1cIilcbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZXNvbHZlKGRpciwgZnMubm9ybWFsaXplKG5ld1BhdGgpKVxuICAgICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKG5ld1BhdGgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhuZXdQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZShmYWxzZSlcbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJzYXZlcyB0byB0aGUgcGF0aFwiLCAtPlxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyAuXCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignLicsIG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJleHBhbmRzIC4uXCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignLi4nLCBuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyB+XCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignficsIG5ld1BhdGgpXG5cbiAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIHdpdGggbW9yZSB0aGFuIG9uZSBwYXRoXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcyBwYXRoMSBwYXRoMicpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCdcbiAgICAgICAgKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgZXhpc3RzUGF0aCA9ICcnXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGV4aXN0c1BhdGggPSBwcm9qZWN0UGF0aCgnc2F2ZWFzLWV4aXN0cycpXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhleGlzdHNQYXRoLCAnYWJjJylcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKGV4aXN0c1BhdGgpXG5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJzYXZlYXMgI3tleGlzdHNQYXRofVwiKVxuICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IEZpbGUgZXhpc3RzIChhZGQgISB0byBvdmVycmlkZSknXG4gICAgICAgICAgKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG5cbiAgICAgICAgaXQgXCJ3cml0ZXMgaWYgZm9yY2VkIHdpdGggOnNhdmVhcyFcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJzYXZlYXMhICN7ZXhpc3RzUGF0aH1cIilcbiAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMpLnRvRXF1YWwoW10pXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcblxuICBkZXNjcmliZSBcIjpxdWl0XCIsIC0+XG4gICAgcGFuZSA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBzcHlPbihwYW5lLCAnZGVzdHJveUFjdGl2ZUl0ZW0nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKVxuXG4gICAgaXQgXCJjbG9zZXMgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gaWYgbm90IG1vZGlmaWVkXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgncXVpdCcpXG4gICAgICBleHBlY3QocGFuZS5kZXN0cm95QWN0aXZlSXRlbSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QocGFuZS5nZXRJdGVtcygpLmxlbmd0aCkudG9CZSgxKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGlzIG1vZGlmaWVkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdkZWYnKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBwcm9tcHQgdG8gc2F2ZVwiLCAtPlxuICAgICAgICBzcHlPbihwYW5lLCAncHJvbXB0VG9TYXZlSXRlbScpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3F1aXQnKVxuICAgICAgICBleHBlY3QocGFuZS5wcm9tcHRUb1NhdmVJdGVtKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjpxdWl0YWxsXCIsIC0+XG4gICAgaXQgXCJjbG9zZXMgQXRvbVwiLCAtPlxuICAgICAgc3B5T24oYXRvbSwgJ2Nsb3NlJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdxdWl0YWxsJylcbiAgICAgIGV4cGVjdChhdG9tLmNsb3NlKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjp0YWJjbG9zZVwiLCAtPlxuICAgIGl0IFwiYWN0cyBhcyBhbiBhbGlhcyB0byA6cXVpdFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd0YWJjbG9zZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAncXVpdCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJjbG9zZScpXG4gICAgICBleHBlY3QoRXgucXVpdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoRXgudGFiY2xvc2UuY2FsbHNbMF0uYXJncy4uLilcblxuICBkZXNjcmliZSBcIjp0YWJuZXh0XCIsIC0+XG4gICAgcGFuZSA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgICAudGhlbiAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKClcblxuICAgIGl0IFwic3dpdGNoZXMgdG8gdGhlIG5leHQgdGFiXCIsIC0+XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoMSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXh0JylcbiAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW1JbmRleCgpKS50b0JlKDIpXG5cbiAgICBpdCBcIndyYXBzIGFyb3VuZFwiLCAtPlxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggLSAxKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYm5leHQnKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KCkpLnRvQmUoMClcblxuICBkZXNjcmliZSBcIjp0YWJwcmV2aW91c1wiLCAtPlxuICAgIHBhbmUgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgICAgLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpXG5cbiAgICBpdCBcInN3aXRjaGVzIHRvIHRoZSBwcmV2aW91cyB0YWJcIiwgLT5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCgxKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYnByZXZpb3VzJylcbiAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW1JbmRleCgpKS50b0JlKDApXG5cbiAgICBpdCBcIndyYXBzIGFyb3VuZFwiLCAtPlxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KDApXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFicHJldmlvdXMnKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KCkpLnRvQmUocGFuZS5nZXRJdGVtcygpLmxlbmd0aCAtIDEpXG5cbiAgZGVzY3JpYmUgXCI6d3FcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihFeCwgJ3dyaXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICdxdWl0JylcblxuICAgIGl0IFwid3JpdGVzIHRoZSBmaWxlLCB0aGVuIHF1aXRzXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKHByb2plY3RQYXRoKCd3cS0xJykpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3EnKVxuICAgICAgZXhwZWN0KEV4LndyaXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICMgU2luY2UgYDp3cWAgb25seSBjYWxscyBgOnF1aXRgIGFmdGVyIGA6d3JpdGVgIGlzIGZpbmlzaGVkLCB3ZSBuZWVkIHRvXG4gICAgICAjICB3YWl0IGEgYml0IGZvciB0aGUgYDpxdWl0YCBjYWxsIHRvIG9jY3VyXG4gICAgICB3YWl0c0ZvcigoLT4gRXgucXVpdC53YXNDYWxsZWQpLCBcInRoZSA6cXVpdCBjb21tYW5kIHRvIGJlIGNhbGxlZFwiLCAxMDApXG5cbiAgICBpdCBcImRvZXNuJ3QgcXVpdCB3aGVuIHRoZSBmaWxlIGlzIG5ldyBhbmQgbm8gcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKHVuZGVmaW5lZClcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cScpXG4gICAgICBleHBlY3QoRXgud3JpdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgd2FzTm90Q2FsbGVkID0gZmFsc2VcbiAgICAgICMgRklYTUU6IFRoaXMgc2VlbXMgZGFuZ2Vyb3VzLCBidXQgc2V0VGltZW91dCBzb21laG93IGRvZXNuJ3Qgd29yay5cbiAgICAgIHNldEltbWVkaWF0ZSgoLT5cbiAgICAgICAgd2FzTm90Q2FsbGVkID0gbm90IEV4LnF1aXQud2FzQ2FsbGVkKSlcbiAgICAgIHdhaXRzRm9yKCgtPiB3YXNOb3RDYWxsZWQpLCAxMDApXG5cbiAgICBpdCBcInBhc3NlcyB0aGUgZmlsZSBuYW1lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3Egd3EtMicpXG4gICAgICBleHBlY3QoRXgud3JpdGUpXG4gICAgICAgIC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChFeC53cml0ZS5jYWxsc1swXS5hcmdzWzBdLmFyZ3MudHJpbSgpKS50b0VxdWFsKCd3cS0yJylcbiAgICAgIHdhaXRzRm9yKCgtPiBFeC5xdWl0Lndhc0NhbGxlZCksIFwidGhlIDpxdWl0IGNvbW1hbmQgdG8gYmUgY2FsbGVkXCIsIDEwMClcblxuICBkZXNjcmliZSBcIjp4aXRcIiwgLT5cbiAgICBpdCBcImFjdHMgYXMgYW4gYWxpYXMgdG8gOndxXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3dxJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd4aXQnKVxuICAgICAgZXhwZWN0KEV4LndxKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjp4XCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDp4aXRcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAneGl0JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd4JylcbiAgICAgIGV4cGVjdChFeC54aXQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOndxYWxsXCIsIC0+XG4gICAgaXQgXCJjYWxscyA6d2FsbCwgdGhlbiA6cXVpdGFsbFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd3YWxsJylcbiAgICAgIHNweU9uKEV4LCAncXVpdGFsbCcpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3FhbGwnKVxuICAgICAgZXhwZWN0KEV4LndhbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KEV4LnF1aXRhbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOmVkaXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGhvdXQgYSBmaWxlIG5hbWVcIiwgLT5cbiAgICAgIGl0IFwicmVsb2FkcyB0aGUgZmlsZSBmcm9tIHRoZSBkaXNrXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTFcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsICdkZWYnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0JylcbiAgICAgICAgIyBSZWxvYWRpbmcgdGFrZXMgYSBiaXRcbiAgICAgICAgd2FpdHNGb3IoKC0+IGVkaXRvci5nZXRUZXh0KCkgaXMgJ2RlZicpLFxuICAgICAgICAgIFwidGhlIGVkaXRvcidzIGNvbnRlbnQgdG8gY2hhbmdlXCIsIDEwMClcblxuICAgICAgaXQgXCJkb2Vzbid0IHJlbG9hZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTJcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNkJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJ2RlZicpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2VkaXQnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gd3JpdGUgc2luY2UgbGFzdCBjaGFuZ2UgKGFkZCAhIHRvIG92ZXJyaWRlKScpXG4gICAgICAgIGlzbnREZWYgPSBmYWxzZVxuICAgICAgICBzZXRJbW1lZGlhdGUoLT4gaXNudERlZiA9IGVkaXRvci5nZXRUZXh0KCkgaXNudCAnZGVmJylcbiAgICAgICAgd2FpdHNGb3IoKC0+IGlzbnREZWYpLCBcInRoZSBlZGl0b3IncyBjb250ZW50IG5vdCB0byBjaGFuZ2VcIiwgNTApXG5cbiAgICAgIGl0IFwicmVsb2FkcyB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBpdCBpcyBmb3JjZWRcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aChcImVkaXQtM1wiKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiY2QnKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCAnZGVmJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCEnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMubGVuZ3RoKS50b0JlKDApXG4gICAgICAgIHdhaXRzRm9yKCgtPiBlZGl0b3IuZ2V0VGV4dCgpIGlzICdkZWYnKVxuICAgICAgICAgIFwidGhlIGVkaXRvcidzIGNvbnRlbnQgdG8gY2hhbmdlXCIsIDUwKVxuXG4gICAgICBpdCBcInRocm93cyBhbiBlcnJvciB3aGVuIGVkaXRpbmcgYSBuZXcgZmlsZVwiLCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkucmVsb2FkKClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBObyBmaWxlIG5hbWUnKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IScpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1sxXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBObyBmaWxlIG5hbWUnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgZmlsZSBuYW1lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBzcGVjaWZpZWQgcGF0aFwiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCdlZGl0LW5ldy10ZXN0JylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcImVkaXQgI3tmaWxlUGF0aH1cIilcbiAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGZpbGVQYXRoKVxuXG4gICAgICBpdCBcIm9wZW5zIGEgcmVsYXRpdmUgcGF0aFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IGVkaXQtcmVsYXRpdmUtdGVzdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChcbiAgICAgICAgICBwcm9qZWN0UGF0aCgnZWRpdC1yZWxhdGl2ZS10ZXN0JykpXG5cbiAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIGlmIHRyeWluZyB0byBvcGVuIG1vcmUgdGhhbiBvbmUgZmlsZVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IGVkaXQtbmV3LXRlc3QtMSBlZGl0LW5ldy10ZXN0LTInKVxuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uub3Blbi5jYWxsQ291bnQpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE9ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJylcblxuICBkZXNjcmliZSBcIjp0YWJlZGl0XCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDplZGl0IGlmIHN1cHBsaWVkIHdpdGggYSBwYXRoXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ2VkaXQnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYmVkaXQgdGFiZWRpdC10ZXN0JylcbiAgICAgIGV4cGVjdChFeC5lZGl0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChFeC50YWJlZGl0LmNhbGxzWzBdLmFyZ3MuLi4pXG5cbiAgICBpdCBcImFjdHMgYXMgYW4gYWxpYXMgdG8gOnRhYm5ldyBpZiBub3Qgc3VwcGxpZWQgd2l0aCBhIHBhdGhcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAndGFiZWRpdCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAndGFibmV3JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJlZGl0ICAnKVxuICAgICAgZXhwZWN0KEV4LnRhYm5ldylcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYmVkaXQuY2FsbHNbMF0uYXJncy4uLilcblxuICBkZXNjcmliZSBcIjp0YWJuZXdcIiwgLT5cbiAgICBpdCBcIm9wZW5zIGEgbmV3IHRhYlwiLCAtPlxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXcnKVxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgXCJvcGVucyBhIG5ldyB0YWIgZm9yIGVkaXRpbmcgd2hlbiBwcm92aWRlZCBhbiBhcmd1bWVudFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd0YWJuZXcnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYm5ldyB0YWJuZXctdGVzdCcpXG4gICAgICBleHBlY3QoRXgudGFiZWRpdClcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYm5ldy5jYWxsc1swXS5hcmdzLi4uKVxuXG4gIGRlc2NyaWJlIFwiOnNwbGl0XCIsIC0+XG4gICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgZmlsZSB1cHdhcmRzL2Rvd253YXJkXCIsIC0+XG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdERvd24nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3NwbGl0JylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdERvd24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBzcHlPbihwYW5lLCAnc3BsaXRVcCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnc3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzcGxpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnNwbGl0VXApLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgIyBGSVhNRTogU2hvdWxkIHRlc3Qgd2hldGhlciB0aGUgbmV3IHBhbmUgY29udGFpbnMgYSBUZXh0RWRpdG9yXG4gICAgICAjICAgICAgICBwb2ludGluZyB0byB0aGUgc2FtZSBwYXRoXG5cbiAgZGVzY3JpYmUgXCI6dnNwbGl0XCIsIC0+XG4gICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgZmlsZSB0byB0aGUgbGVmdC9yaWdodFwiLCAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKVxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdFJpZ2h0JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCd2c3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd2c3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdExlZnQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdExlZnQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3ZzcGxpdCcpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3ZzcGxpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnNwbGl0TGVmdCkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAjIEZJWE1FOiBTaG91bGQgdGVzdCB3aGV0aGVyIHRoZSBuZXcgcGFuZSBjb250YWlucyBhIFRleHRFZGl0b3JcbiAgICAgICMgICAgICAgIHBvaW50aW5nIHRvIHRoZSBzYW1lIHBhdGhcblxuICBkZXNjcmliZSBcIjpkZWxldGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmXFxuZ2hpXFxuamtsJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2RlbGV0ZScpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjXFxuZGVmXFxuamtsJylcblxuICAgIGl0IFwiY29waWVzIHRoZSBkZWxldGVkIHRleHRcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdkZWxldGUnKVxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCgnZ2hpXFxuJylcblxuICAgIGl0IFwiZGVsZXRlcyB0aGUgbGluZXMgaW4gdGhlIGdpdmVuIHJhbmdlXCIsIC0+XG4gICAgICBwcm9jZXNzZWRPcFN0YWNrID0gZmFsc2VcbiAgICAgIGV4U3RhdGUub25EaWRQcm9jZXNzT3BTdGFjayAtPiBwcm9jZXNzZWRPcFN0YWNrID0gdHJ1ZVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzEsMmRlbGV0ZScpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpXFxuamtsJylcblxuICAgICAgd2FpdHNGb3IgLT4gcHJvY2Vzc2VkT3BTdGFja1xuICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzEsIDFdKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJywvay9kZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbicpXG5cbiAgICBpdCBcInVuZG9zIGRlbGV0aW5nIHNldmVyYWwgbGluZXMgYXQgb25jZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJy0xLC5kZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmprbCcpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdjb3JlOnVuZG8nKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG5cbiAgZGVzY3JpYmUgXCI6c3Vic3RpdHV0ZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGl0IFwicmVwbGFjZXMgYSBjaGFyYWN0ZXIgb24gdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlIC9hL3gnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBpdCBcImRvZXNuJ3QgbmVlZCBhIHNwYWNlIGJlZm9yZSB0aGUgYXJndW1lbnRzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94JylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgaXQgXCJyZXNwZWN0cyBtb2RpZmllcnMgcGFzc2VkIHRvIGl0XCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94L2cnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3hBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hL3gvZ2knKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3h4QkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBpdCBcInJlcGxhY2VzIG9uIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOiVzdWJzdGl0dXRlL2FiYy9naGknKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuZ2hpYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6JXN1YnN0aXR1dGUvYWJjL2doaS9pZycpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5naGlhZ2hpJylcblxuICAgIGl0IFwic2V0IGdkZWZhdWx0IG9wdGlvblwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZXgtbW9kZS5nZGVmYXVsdCcsIHRydWUpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hL3gnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3hBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2V4LW1vZGUuZ2RlZmF1bHQnLCB0cnVlKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94L2cnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBkZXNjcmliZSBcIjp5YW5rXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNcXG5kZWZcXG5naGlcXG5qa2wnKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDBdKVxuXG4gICAgICBpdCBcInlhbmtzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgneWFuaycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwoJ2doaVxcbicpXG5cbiAgICAgIGl0IFwieWFua3MgdGhlIGxpbmVzIGluIHRoZSBnaXZlbiByYW5nZVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCcxLDJ5YW5rJylcbiAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCgnYWJjXFxuZGVmXFxuJylcblxuICAgIGRlc2NyaWJlIFwiaWxsZWdhbCBkZWxpbWl0ZXJzXCIsIC0+XG4gICAgICB0ZXN0ID0gKGRlbGltKSAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwiOnN1YnN0aXR1dGUgI3tkZWxpbX1hI3tkZWxpbX14I3tkZWxpbX1naVwiKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICBcIkNvbW1hbmQgZXJyb3I6IFJlZ3VsYXIgZXhwcmVzc2lvbnMgY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5IGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzLCAnXFxcXCcsICdcXFwiJyBvciAnfCdcIilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGl0IFwiY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5IGxldHRlcnNcIiwgLT4gdGVzdCAnbidcbiAgICAgIGl0IFwiY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5IG51bWJlcnNcIiwgLT4gdGVzdCAnMydcbiAgICAgIGl0IFwiY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5ICdcXFxcJ1wiLCAgICAtPiB0ZXN0ICdcXFxcJ1xuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgJ1xcXCInXCIsICAgIC0+IHRlc3QgJ1wiJ1xuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgJ3wnXCIsICAgICAtPiB0ZXN0ICd8J1xuXG4gICAgZGVzY3JpYmUgXCJlbXB0eSByZXBsYWNlbWVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYWJjXFxuYWJjYWJjJylcblxuICAgICAgaXQgXCJyZW1vdmVzIHRoZSBwYXR0ZXJuIHdpdGhvdXQgbW9kaWZpZXJzXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCI6c3Vic3RpdHV0ZS9hYmMvL1wiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjXFxuYWJjYWJjJylcblxuICAgICAgaXQgXCJyZW1vdmVzIHRoZSBwYXR0ZXJuIHdpdGggbW9kaWZpZXJzXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCI6c3Vic3RpdHV0ZS9hYmMvL2dcIilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ1xcbmFiY2FiYycpXG5cbiAgICBkZXNjcmliZSBcInJlcGxhY2luZyB3aXRoIGVzY2FwZSBzZXF1ZW5jZXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiYyxkZWYsZ2hpJylcblxuICAgICAgdGVzdCA9IChlc2NhcGVDaGFyLCBlc2NhcGVkKSAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwiOnN1YnN0aXR1dGUvLC9cXFxcI3tlc2NhcGVDaGFyfS9nXCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiYWJjI3tlc2NhcGVkfWRlZiN7ZXNjYXBlZH1naGlcIilcblxuICAgICAgaXQgXCJyZXBsYWNlcyB3aXRoIGEgdGFiXCIsIC0+IHRlc3QoJ3QnLCAnXFx0JylcbiAgICAgIGl0IFwicmVwbGFjZXMgd2l0aCBhIGxpbmVmZWVkXCIsIC0+IHRlc3QoJ24nLCAnXFxuJylcbiAgICAgIGl0IFwicmVwbGFjZXMgd2l0aCBhIGNhcnJpYWdlIHJldHVyblwiLCAtPiB0ZXN0KCdyJywgJ1xccicpXG5cbiAgICBkZXNjcmliZSBcImNhc2Ugc2Vuc2l0aXZpdHlcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVzcGVjdHMgdGhlIHNtYXJ0Y2FzZSBzZXR0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBzZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvZmYgYW5kIHRoZSBwYXR0ZXJuIGlzIGxvd2VyY2FzZVwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgZmFsc2UpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYmMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIHNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9mZiBhbmQgdGhlIHBhdHRlcm4gaXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9BQkMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIGluc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb24gYW5kIHRoZSBwYXR0ZXJuIGlzIGxvd2VyY2FzZVwiLCAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgdHJ1ZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2Ugc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb24gYW5kIHRoZSBwYXR0ZXJuIGlzIHVwcGVyY2FzZVwiLCAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvQUJDL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgZGVzY3JpYmUgXCJcXFxcYyBhbmQgXFxcXEMgaW4gdGhlIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIGluc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb2ZmIGFuZCBcXGMgaXMgaW4gdGhlIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIGZhbHNlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWJjXFxcXGMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwiZG9lc24ndCBtYXR0ZXIgd2hlcmUgaW4gdGhlIHBhdHRlcm4gXFxcXGMgaXNcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIGZhbHNlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYVxcXFxjYmMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIHNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9uLCBcXFxcQyBpcyBpbiB0aGUgcGF0dGVybiBhbmQgdGhlIHBhdHRlcm4gaXMgbG93ZXJjYXNlXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYVxcXFxDYmMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwib3ZlcnJpZGVzIFxcXFxDIHdpdGggXFxcXGMgaWYgXFxcXEMgY29tZXMgZmlyc3RcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXENiXFxcXGNjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcIm92ZXJyaWRlcyBcXFxcQyB3aXRoIFxcXFxjIGlmIFxcXFxjIGNvbWVzIGZpcnN0XCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYVxcXFxjYlxcXFxDYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJvdmVycmlkZXMgYW4gYXBwZW5kZWQgL2kgZmxhZyB3aXRoIFxcXFxDXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWJcXFxcQ2MvZ2hpL2dpJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgIGRlc2NyaWJlIFwiY2FwdHVyaW5nIGdyb3Vwc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJyZXBsYWNlcyBcXFxcMSB3aXRoIHRoZSBmaXJzdCBncm91cFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9iYyguezJ9KS9YXFxcXDFYJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FYYUFYQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgbXVsdGlwbGUgZ3JvdXBzXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2EoW2Etel0qKWFBKFtBLVpdKikvWFxcXFwxWFlcXFxcMlknKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnWGJjWFlCQ1lcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgXFxcXDAgd2l0aCB0aGUgZW50aXJlIG1hdGNoXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FiKGNhKUFCL1hcXFxcMFgnKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnWGFiY2FBQlhDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gIGRlc2NyaWJlIFwiOnNldFwiLCAtPlxuICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIHdpdGhvdXQgYSBzcGVjaWZpZWQgb3B0aW9uXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCcpXG4gICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE5vIG9wdGlvbiBzcGVjaWZpZWQnKVxuXG4gICAgaXQgXCJzZXRzIG11bHRpcGxlIG9wdGlvbnMgYXQgb25jZVwiLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnLCBmYWxzZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycsIGZhbHNlKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbGlzdCBudW1iZXInKVxuICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZSh0cnVlKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgb3B0aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycsIGZhbHNlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnLCBmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubylsaXN0XCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbGlzdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9saXN0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pbnUobWJlcilcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBudScpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vbnUnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbnVtYmVyJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9udW1iZXInKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pc3AobGl0KXIoaWdodClcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzcHInKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vc3ByJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdHJpZ2h0JykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc3BsaXRyaWdodCcpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zcGxpdHJpZ2h0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdHJpZ2h0JykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pcyhwbGl0KWIoZWxvdylcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzYicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zYicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpKS50b0JlKGZhbHNlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNwbGl0YmVsb3cnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vc3BsaXRiZWxvdycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKXMobWFydCljKGEpcyhlKVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNjcycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKS50b0JlKHRydWUpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zY3MnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnKSkudG9CZShmYWxzZSlcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzbWFydGNhc2UnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnKSkudG9CZSh0cnVlKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vc21hcnRjYXNlJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pZ2RlZmF1bHRcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBnZGVmYXVsdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuZ2RlZmF1bHQnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vZ2RlZmF1bHQnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLmdkZWZhdWx0JykpLnRvQmUoZmFsc2UpXG5cbiAgZGVzY3JpYmUgXCJhbGlhc2VzXCIsIC0+XG4gICAgaXQgXCJjYWxscyB0aGUgYWxpYXNlZCBmdW5jdGlvbiB3aXRob3V0IGFyZ3VtZW50c1wiLCAtPlxuICAgICAgRXhDbGFzcy5yZWdpc3RlckFsaWFzKCdXJywgJ3cnKVxuICAgICAgc3B5T24oRXgsICd3cml0ZScpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnVycpXG4gICAgICBleHBlY3QoRXgud3JpdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgXCJjYWxscyB0aGUgYWxpYXNlZCBmdW5jdGlvbiB3aXRoIGFyZ3VtZW50c1wiLCAtPlxuICAgICAgRXhDbGFzcy5yZWdpc3RlckFsaWFzKCdXJywgJ3dyaXRlJylcbiAgICAgIHNweU9uKEV4LCAnVycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAnd3JpdGUnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ1cnKVxuICAgICAgV0FyZ3MgPSBFeC5XLmNhbGxzWzBdLmFyZ3NbMF1cbiAgICAgIHdyaXRlQXJncyA9IEV4LndyaXRlLmNhbGxzWzBdLmFyZ3NbMF1cbiAgICAgIGV4cGVjdChXQXJncykudG9CZSB3cml0ZUFyZ3NcblxuICBkZXNjcmliZSBcIndpdGggc2VsZWN0aW9uc1wiLCAtPlxuICAgIGl0IFwiZXhlY3V0ZXMgb24gdGhlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3MnKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcbiAgICAgIGVkaXRvci5zZWxlY3RUb0J1ZmZlclBvc2l0aW9uKFsyLCAxXSlcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwiJzwsJz5zL2FiYy9kZWZcIilcbiAgICAgIGV4cGVjdChFeC5zLmNhbGxzWzBdLmFyZ3NbMF0ucmFuZ2UpLnRvRXF1YWwgWzAsIDJdXG5cbiAgICBpdCBcImNhbGxzIHRoZSBmdW5jdGlvbnMgbXVsdGlwbGUgdGltZXMgaWYgdGhlcmUgYXJlIG11bHRpcGxlIHNlbGVjdGlvbnNcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAncycpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuICAgICAgZWRpdG9yLnNlbGVjdFRvQnVmZmVyUG9zaXRpb24oWzIsIDFdKVxuICAgICAgZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24oWzMsIDBdKVxuICAgICAgZWRpdG9yLnNlbGVjdFRvQnVmZmVyUG9zaXRpb24oWzMsIDJdKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCInPCwnPnMvYWJjL2RlZlwiKVxuICAgICAgY2FsbHMgPSBFeC5zLmNhbGxzXG4gICAgICBleHBlY3QoY2FsbHMubGVuZ3RoKS50b0VxdWFsIDJcbiAgICAgIGV4cGVjdChjYWxsc1swXS5hcmdzWzBdLnJhbmdlKS50b0VxdWFsIFswLCAyXVxuICAgICAgZXhwZWN0KGNhbGxzWzFdLmFyZ3NbMF0ucmFuZ2UpLnRvRXF1YWwgWzMsIDNdXG5cbiAgZGVzY3JpYmUgJzpzb3J0JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnZ2hpXFxuYWJjXFxuamtsXFxuZGVmXFxuMTQyXFxuenp6XFxuOTF4ZmRzOVxcbicpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgaXQgXCJzb3J0cyBlbnRpcmUgZmlsZSBpZiByYW5nZSBpcyBub3QgbXVsdGktbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NvcnQnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJzE0MlxcbjkxeGZkczlcXG5hYmNcXG5kZWZcXG5naGlcXG5qa2xcXG56enpcXG4nKVxuXG4gICAgaXQgXCJzb3J0cyBzcGVjaWZpYyByYW5nZSBpZiByYW5nZSBpcyBtdWx0aS1saW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnMiw0c29ydCcpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpXFxuYWJjXFxuZGVmXFxuamtsXFxuMTQyXFxuenp6XFxuOTF4ZmRzOVxcbicpXG4iXX0=
