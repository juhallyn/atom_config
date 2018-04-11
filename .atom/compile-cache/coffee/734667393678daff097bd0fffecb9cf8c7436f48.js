(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, ref, semver, settings, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  settings = require('../lib/settings');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.getLoadSettings().resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    globalState.reset();
    settings.set("stayOnTransformString", false);
    settings.set("stayOnYank", false);
    settings.set("stayOnDelete", false);
    settings.set("stayOnSelectTextObject", false);
    return settings.set("stayOnVerticalMotion", true);
  });

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var j, key, len, modifier, options, part, parts;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      if (indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(slice.call(eventArgs)));
    return event;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, ref1;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = [], editor = ref1[0], file = ref1[1], callback = ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, arg) {
      var chomp, line, text;
      chomp = (arg != null ? arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          results.push(this.lines[line]);
        }
        return results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getLine = function(line, options) {
      return this.getLines([line], options);
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  collectIndexInText = function(char, text) {
    var fromIndex, index, indexes;
    indexes = [];
    fromIndex = 0;
    while ((index = text.indexOf(char, fromIndex)) >= 0) {
      fromIndex = index + 1;
      indexes.push(index);
    }
    return indexes;
  };

  collectCharPositionsInText = function(char, text) {
    var i, index, j, k, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        index = ref2[i];
        positions.push([rowNumber, index - i]);
      }
    }
    return positions;
  };

  VimEditor = (function() {
    var ensureExclusiveRules, ensureOptionsOrdered, setExclusiveRules, setOptionsOrdered;

    function VimEditor(vimState1) {
      var ref1;
      this.vimState = vimState1;
      this._keystroke = bind(this._keystroke, this);
      this.bindEnsureWaitOption = bind(this.bindEnsureWaitOption, this);
      this.bindEnsureOption = bind(this.bindEnsureOption, this);
      this.ensureWait = bind(this.ensureWait, this);
      this.ensure = bind(this.ensure, this);
      this.set = bind(this.set, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error(message + ": " + (inspect(invalidOptions)));
      }
    };

    VimEditor.prototype.validateExclusiveOptions = function(options, rules) {
      var allOptions, exclusiveOptions, option, results, violatingOptions;
      allOptions = Object.keys(options);
      results = [];
      for (option in rules) {
        exclusiveOptions = rules[option];
        if (!(option in options)) {
          continue;
        }
        violatingOptions = exclusiveOptions.filter(function(exclusiveOption) {
          return indexOf.call(allOptions, exclusiveOption) >= 0;
        });
        if (violatingOptions.length) {
          throw new Error(option + " is exclusive with [" + violatingOptions + "]");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    setOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'grammar', 'cursor', 'cursorScreen', 'addCursor', 'cursorScreen', 'register', 'selectedBufferRange'];

    setExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.set = function(options) {
      var j, len, method, name, results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      this.validateExclusiveOptions(options, setExclusiveRules);
      results = [];
      for (j = 0, len = setOptionsOrdered.length; j < len; j++) {
        name = setOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      this.setText(text.replace(/[\|!]/g, ''));
      cursors = cursors.concat(lastCursor);
      if (cursors.length) {
        return this.setCursor(cursors);
      }
    };

    VimEditor.prototype.setTextC_ = function(text) {
      return this.setTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setCursorScreen = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var j, len, point, ref1, results;
      ref1 = toArrayOfPoint(points);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        point = ref1[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, results, value;
      results = [];
      for (name in register) {
        value = register[name];
        results.push(this.vimState.register.set(name, value));
      }
      return results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'selectedText', 'selectedText_', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorScreen', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'propertyHead', 'propertyTail', 'scrollTop', 'mark', 'mode'];

    ensureExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.getAndDeleteKeystrokeOptions = function(options) {
      var partialMatchTimeout, waitsForFinish;
      partialMatchTimeout = options.partialMatchTimeout, waitsForFinish = options.waitsForFinish;
      delete options.partialMatchTimeout;
      delete options.waitsForFinish;
      return {
        partialMatchTimeout: partialMatchTimeout,
        waitsForFinish: waitsForFinish
      };
    };

    VimEditor.prototype.ensure = function(keystroke, options) {
      var keystrokeOptions, runSmart;
      if (options == null) {
        options = {};
      }
      if (typeof options !== 'object') {
        throw new Error("Invalid options for 'ensure': must be 'object' but got '" + (typeof options) + "'");
      }
      if ((keystroke != null) && !(typeof keystroke === 'string' || Array.isArray(keystroke))) {
        throw new Error("Invalid keystroke for 'ensure': must be 'string' or 'array' but got '" + (typeof keystroke) + "'");
      }
      keystrokeOptions = this.getAndDeleteKeystrokeOptions(options);
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      this.validateExclusiveOptions(options, ensureExclusiveRules);
      runSmart = function(fn) {
        if (keystrokeOptions.waitsForFinish) {
          return runs(fn);
        } else {
          return fn();
        }
      };
      runSmart((function(_this) {
        return function() {
          if (!_.isEmpty(keystroke)) {
            return _this._keystroke(keystroke, keystrokeOptions);
          }
        };
      })(this));
      return runSmart((function(_this) {
        return function() {
          var j, len, method, name, results;
          results = [];
          for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
            name = ensureOptionsOrdered[j];
            if (!(options[name] != null)) {
              continue;
            }
            method = 'ensure' + _.capitalize(_.camelize(name));
            results.push(_this[method](options[name]));
          }
          return results;
        };
      })(this));
    };

    VimEditor.prototype.ensureWait = function(keystroke, options) {
      if (options == null) {
        options = {};
      }
      return this.ensure(keystroke, Object.assign(options, {
        waitsForFinish: true
      }));
    };

    VimEditor.prototype.bindEnsureOption = function(optionsBase, wait) {
      if (wait == null) {
        wait = false;
      }
      return (function(_this) {
        return function(keystroke, options) {
          var intersectingOptions;
          intersectingOptions = _.intersection(_.keys(options), _.keys(optionsBase));
          if (intersectingOptions.length) {
            throw new Error("conflict with bound options " + (inspect(intersectingOptions)));
          }
          options = _.defaults(_.clone(options), optionsBase);
          if (wait) {
            options.waitsForFinish = true;
          }
          return _this.ensure(keystroke, options);
        };
      })(this);
    };

    VimEditor.prototype.bindEnsureWaitOption = function(optionsBase) {
      return this.bindEnsureOption(optionsBase, true);
    };

    VimEditor.prototype._keystroke = function(keys, options) {
      var event, finished, i, j, key, keystrokesToExecute, lastKeystrokeIndex, len, ref1, target, waitsForFinish;
      if (options == null) {
        options = {};
      }
      target = this.editorElement;
      keystrokesToExecute = keys.split(/\s+/);
      lastKeystrokeIndex = keystrokesToExecute.length - 1;
      for (i = j = 0, len = keystrokesToExecute.length; j < len; i = ++j) {
        key = keystrokesToExecute[i];
        waitsForFinish = (i === lastKeystrokeIndex) && options.waitsForFinish;
        if (waitsForFinish) {
          finished = false;
          this.vimState.onDidFinishOperation(function() {
            return finished = true;
          });
        }
        if ((ref1 = this.vimState.__searchInput) != null ? ref1.hasFocus() : void 0) {
          target = this.vimState.searchInput.editorElement;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.searchInput.editor.insertText(key);
          }
        } else if (this.vimState.inputEditor != null) {
          target = this.vimState.inputEditor.element;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.inputEditor.insertText(key);
          }
        } else {
          event = buildKeydownEventFromKeystroke(normalizeKeystrokes(key), target);
          atom.keymaps.handleKeyboardEvent(event);
        }
        if (waitsForFinish) {
          waitsFor(function() {
            return finished;
          });
        }
      }
      if (options.partialMatchTimeout) {
        return advanceClock(atom.keymaps.getPartialMatchTimeout());
      }
    };

    VimEditor.prototype.keystroke = function() {
      throw new Error('Dont use `keystroke("x y z")`, instead use `ensure("x y z")`');
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      cursors = cursors.concat(lastCursor);
      cursors = cursors.map(function(point) {
        return Point.fromObject(point);
      }).sort(function(a, b) {
        return a.compare(b);
      });
      this.ensureText(text.replace(/[\|!]/g, ''));
      if (cursors.length) {
        this.ensureCursor(cursors, true);
      }
      if (lastCursor.length) {
        return expect(this.editor.getCursorBufferPosition()).toEqual(lastCursor[0]);
      }
    };

    VimEditor.prototype.ensureTextC_ = function(text) {
      return this.ensureTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(s.getText());
        }
        return results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedText_ = function(text, ordered) {
      return this.ensureSelectedText(text.replace(/_/g, ' '), ordered);
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points, ordered) {
      var actual;
      if (ordered == null) {
        ordered = false;
      }
      actual = this.editor.getCursorBufferPositions();
      actual = actual.sort(function(a, b) {
        if (ordered) {
          return a.compare(b);
        }
      });
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorScreen = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var _value, ensure, name, property, reg, results, selection;
      results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        results.push((function() {
          var results1;
          results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            results1.push(expect(reg[property]).toEqual(_value));
          }
          return results1;
        })());
      }
      return results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(fn(s));
        }
        return results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, j, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        actual = selection.isReversed();
        results.push(expect(actual).toBe(reversed));
      }
      return results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = markers.length; j < len; j++) {
          r = markers[j];
          results.push(r.getBufferRange());
        }
        return results;
      })();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = ranges.length; j < len; j++) {
          r = ranges[j];
          results.push(this.editor.getTextInBufferRange(r));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensurePropertyHead = function(points) {
      var actual, getHeadProperty, s;
      getHeadProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('head', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getHeadProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensurePropertyTail = function(points) {
      var actual, getTailProperty, s;
      getTailProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('tail', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getTailProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, results;
      results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        results.push(expect(actual).toEqual(point));
      }
      return results;
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var j, k, len, len1, m, ref1, results, shouldNotContainClasses;
      mode = toArray(mode).slice();
      expect((ref1 = this.vimState).isMode.apply(ref1, mode)).toBe(true);
      mode[0] = mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (j = 0, len = mode.length; j < len; j++) {
        m = mode[j];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      results = [];
      for (k = 0, len1 = shouldNotContainClasses.length; k < len1; k++) {
        m = shouldNotContainClasses[k];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBYQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFDZCxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxhQUFBLEdBQWdCLElBQUksQ0FBQyxPQUFPLENBQUM7O0VBQzVCLHNCQUF1QixPQUFBLENBQVEsSUFBSSxDQUFDLGVBQUwsQ0FBQSxDQUFzQixDQUFDLFlBQXZCLEdBQXNDLHVDQUE5Qzs7RUFFeEIsa0JBQUEsR0FBcUIsQ0FDbkIsYUFEbUIsRUFFbkIsYUFGbUIsRUFHbkIsYUFIbUIsRUFJbkIsU0FKbUIsRUFLbkIsVUFMbUIsRUFNbkIsV0FObUIsRUFPbkIsZUFQbUI7O0VBWXJCLFVBQUEsQ0FBVyxTQUFBO0lBQ1QsV0FBVyxDQUFDLEtBQVosQ0FBQTtJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsdUJBQWIsRUFBc0MsS0FBdEM7SUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLFlBQWIsRUFBMkIsS0FBM0I7SUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLGNBQWIsRUFBNkIsS0FBN0I7SUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLHdCQUFiLEVBQXVDLEtBQXZDO1dBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxzQkFBYixFQUFxQyxJQUFyQztFQU5TLENBQVg7O0VBVUEsT0FBQSxHQUFVLFNBQUMsS0FBRDtXQUNSLElBQUks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T0FBZDtJQUF1QixVQUFBLFFBQXZCO0lBQWlDLFVBQUEsUUFBakM7SUFBMkMsa0JBQUEsZ0JBQTNDOztBQTNlakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuc2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xue1JhbmdlLCBQb2ludCwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbmdsb2JhbFN0YXRlID0gcmVxdWlyZSAnLi4vbGliL2dsb2JhbC1zdGF0ZSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5LZXltYXBNYW5hZ2VyID0gYXRvbS5rZXltYXBzLmNvbnN0cnVjdG9yXG57bm9ybWFsaXplS2V5c3Ryb2tlc30gPSByZXF1aXJlKGF0b20uZ2V0TG9hZFNldHRpbmdzKCkucmVzb3VyY2VQYXRoICsgXCIvbm9kZV9tb2R1bGVzL2F0b20ta2V5bWFwL2xpYi9oZWxwZXJzXCIpXG5cbnN1cHBvcnRlZE1vZGVDbGFzcyA9IFtcbiAgJ25vcm1hbC1tb2RlJ1xuICAndmlzdWFsLW1vZGUnXG4gICdpbnNlcnQtbW9kZSdcbiAgJ3JlcGxhY2UnXG4gICdsaW5ld2lzZSdcbiAgJ2Jsb2Nrd2lzZSdcbiAgJ2NoYXJhY3Rlcndpc2UnXG5dXG5cbiMgSW5pdCBzcGVjIHN0YXRlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmJlZm9yZUVhY2ggLT5cbiAgZ2xvYmFsU3RhdGUucmVzZXQoKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25UcmFuc2Zvcm1TdHJpbmdcIiwgZmFsc2UpXG4gIHNldHRpbmdzLnNldChcInN0YXlPbllhbmtcIiwgZmFsc2UpXG4gIHNldHRpbmdzLnNldChcInN0YXlPbkRlbGV0ZVwiLCBmYWxzZSlcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uU2VsZWN0VGV4dE9iamVjdFwiLCBmYWxzZSlcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uVmVydGljYWxNb3Rpb25cIiwgdHJ1ZSlcblxuIyBVdGlsc1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRWaWV3ID0gKG1vZGVsKSAtPlxuICBhdG9tLnZpZXdzLmdldFZpZXcobW9kZWwpXG5cbmRpc3BhdGNoID0gKHRhcmdldCwgY29tbWFuZCkgLT5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsIGNvbW1hbmQpXG5cbndpdGhNb2NrUGxhdGZvcm0gPSAodGFyZ2V0LCBwbGF0Zm9ybSwgZm4pIC0+XG4gIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB3cmFwcGVyLmNsYXNzTmFtZSA9IHBsYXRmb3JtXG4gIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KVxuICBmbigpXG4gIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldClcblxuYnVpbGRLZXlkb3duRXZlbnQgPSAoa2V5LCBvcHRpb25zKSAtPlxuICBLZXltYXBNYW5hZ2VyLmJ1aWxkS2V5ZG93bkV2ZW50KGtleSwgb3B0aW9ucylcblxuYnVpbGRLZXlkb3duRXZlbnRGcm9tS2V5c3Ryb2tlID0gKGtleXN0cm9rZSwgdGFyZ2V0KSAtPlxuICBtb2RpZmllciA9IFsnY3RybCcsICdhbHQnLCAnc2hpZnQnLCAnY21kJ11cbiAgcGFydHMgPSBpZiBrZXlzdHJva2UgaXMgJy0nXG4gICAgWyctJ11cbiAgZWxzZVxuICAgIGtleXN0cm9rZS5zcGxpdCgnLScpXG5cbiAgb3B0aW9ucyA9IHt0YXJnZXR9XG4gIGtleSA9IG51bGxcbiAgZm9yIHBhcnQgaW4gcGFydHNcbiAgICBpZiBwYXJ0IGluIG1vZGlmaWVyXG4gICAgICBvcHRpb25zW3BhcnRdID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGtleSA9IHBhcnRcblxuICBpZiBzZW12ZXIuc2F0aXNmaWVzKGF0b20uZ2V0VmVyc2lvbigpLCAnPCAxLjEyJylcbiAgICBrZXkgPSAnICcgaWYga2V5IGlzICdzcGFjZSdcbiAgYnVpbGRLZXlkb3duRXZlbnQoa2V5LCBvcHRpb25zKVxuXG5idWlsZFRleHRJbnB1dEV2ZW50ID0gKGtleSkgLT5cbiAgZXZlbnRBcmdzID0gW1xuICAgIHRydWUgIyBidWJibGVzXG4gICAgdHJ1ZSAjIGNhbmNlbGFibGVcbiAgICB3aW5kb3cgIyB2aWV3XG4gICAga2V5ICAjIGtleSBjaGFyXG4gIF1cbiAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVGV4dEV2ZW50JylcbiAgZXZlbnQuaW5pdFRleHRFdmVudChcInRleHRJbnB1dFwiLCBldmVudEFyZ3MuLi4pXG4gIGV2ZW50XG5cbmlzUG9pbnQgPSAob2JqKSAtPlxuICBpZiBvYmogaW5zdGFuY2VvZiBQb2ludFxuICAgIHRydWVcbiAgZWxzZVxuICAgIG9iai5sZW5ndGggaXMgMiBhbmQgXy5pc051bWJlcihvYmpbMF0pIGFuZCBfLmlzTnVtYmVyKG9ialsxXSlcblxuaXNSYW5nZSA9IChvYmopIC0+XG4gIGlmIG9iaiBpbnN0YW5jZW9mIFJhbmdlXG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgXy5hbGwoW1xuICAgICAgXy5pc0FycmF5KG9iaiksXG4gICAgICAob2JqLmxlbmd0aCBpcyAyKSxcbiAgICAgIGlzUG9pbnQob2JqWzBdKSxcbiAgICAgIGlzUG9pbnQob2JqWzFdKVxuICAgIF0pXG5cbnRvQXJyYXkgPSAob2JqLCBjb25kPW51bGwpIC0+XG4gIGlmIF8uaXNBcnJheShjb25kID8gb2JqKSB0aGVuIG9iaiBlbHNlIFtvYmpdXG5cbnRvQXJyYXlPZlBvaW50ID0gKG9iaikgLT5cbiAgaWYgXy5pc0FycmF5KG9iaikgYW5kIGlzUG9pbnQob2JqWzBdKVxuICAgIG9ialxuICBlbHNlXG4gICAgW29ial1cblxudG9BcnJheU9mUmFuZ2UgPSAob2JqKSAtPlxuICBpZiBfLmlzQXJyYXkob2JqKSBhbmQgXy5hbGwob2JqLm1hcCAoZSkgLT4gaXNSYW5nZShlKSlcbiAgICBvYmpcbiAgZWxzZVxuICAgIFtvYmpdXG5cbiMgTWFpblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRWaW1TdGF0ZSA9IChhcmdzLi4uKSAtPlxuICBbZWRpdG9yLCBmaWxlLCBjYWxsYmFja10gPSBbXVxuICBzd2l0Y2ggYXJncy5sZW5ndGhcbiAgICB3aGVuIDEgdGhlbiBbY2FsbGJhY2tdID0gYXJnc1xuICAgIHdoZW4gMiB0aGVuIFtmaWxlLCBjYWxsYmFja10gPSBhcmdzXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuXG4gIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgIGZpbGUgPSBhdG9tLnByb2plY3QucmVzb2x2ZVBhdGgoZmlsZSkgaWYgZmlsZVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSkudGhlbiAoZSkgLT4gZWRpdG9yID0gZVxuXG4gIHJ1bnMgLT5cbiAgICBtYWluID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykubWFpbk1vZHVsZVxuICAgIHZpbVN0YXRlID0gbWFpbi5nZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG4gICAgY2FsbGJhY2sodmltU3RhdGUsIG5ldyBWaW1FZGl0b3IodmltU3RhdGUpKVxuXG5jbGFzcyBUZXh0RGF0YVxuICBjb25zdHJ1Y3RvcjogKEByYXdEYXRhKSAtPlxuICAgIEBsaW5lcyA9IEByYXdEYXRhLnNwbGl0KFwiXFxuXCIpXG5cbiAgZ2V0TGluZXM6IChsaW5lcywge2Nob21wfT17fSkgLT5cbiAgICBjaG9tcCA/PSBmYWxzZVxuICAgIHRleHQgPSAoQGxpbmVzW2xpbmVdIGZvciBsaW5lIGluIGxpbmVzKS5qb2luKFwiXFxuXCIpXG4gICAgaWYgY2hvbXBcbiAgICAgIHRleHRcbiAgICBlbHNlXG4gICAgICB0ZXh0ICsgXCJcXG5cIlxuXG4gIGdldExpbmU6IChsaW5lLCBvcHRpb25zKSAtPlxuICAgIEBnZXRMaW5lcyhbbGluZV0sIG9wdGlvbnMpXG5cbiAgZ2V0UmF3OiAtPlxuICAgIEByYXdEYXRhXG5cbmNvbGxlY3RJbmRleEluVGV4dCA9IChjaGFyLCB0ZXh0KSAtPlxuICBpbmRleGVzID0gW11cbiAgZnJvbUluZGV4ID0gMFxuICB3aGlsZSAoaW5kZXggPSB0ZXh0LmluZGV4T2YoY2hhciwgZnJvbUluZGV4KSkgPj0gMFxuICAgIGZyb21JbmRleCA9IGluZGV4ICsgMVxuICAgIGluZGV4ZXMucHVzaChpbmRleClcbiAgaW5kZXhlc1xuXG5jb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCA9IChjaGFyLCB0ZXh0KSAtPlxuICBwb3NpdGlvbnMgPSBbXVxuICBmb3IgbGluZVRleHQsIHJvd051bWJlciBpbiB0ZXh0LnNwbGl0KC9cXG4vKVxuICAgIGZvciBpbmRleCwgaSBpbiBjb2xsZWN0SW5kZXhJblRleHQoY2hhciwgbGluZVRleHQpXG4gICAgICBwb3NpdGlvbnMucHVzaChbcm93TnVtYmVyLCBpbmRleCAtIGldKVxuICBwb3NpdGlvbnNcblxuY2xhc3MgVmltRWRpdG9yXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcblxuICB2YWxpZGF0ZU9wdGlvbnM6IChvcHRpb25zLCB2YWxpZE9wdGlvbnMsIG1lc3NhZ2UpIC0+XG4gICAgaW52YWxpZE9wdGlvbnMgPSBfLndpdGhvdXQoXy5rZXlzKG9wdGlvbnMpLCB2YWxpZE9wdGlvbnMuLi4pXG4gICAgaWYgaW52YWxpZE9wdGlvbnMubGVuZ3RoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCIje21lc3NhZ2V9OiAje2luc3BlY3QoaW52YWxpZE9wdGlvbnMpfVwiKVxuXG4gIHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9uczogKG9wdGlvbnMsIHJ1bGVzKSAtPlxuICAgIGFsbE9wdGlvbnMgPSBPYmplY3Qua2V5cyhvcHRpb25zKVxuICAgIGZvciBvcHRpb24sIGV4Y2x1c2l2ZU9wdGlvbnMgb2YgcnVsZXMgd2hlbiBvcHRpb24gb2Ygb3B0aW9uc1xuICAgICAgdmlvbGF0aW5nT3B0aW9ucyA9IGV4Y2x1c2l2ZU9wdGlvbnMuZmlsdGVyIChleGNsdXNpdmVPcHRpb24pIC0+IGV4Y2x1c2l2ZU9wdGlvbiBpbiBhbGxPcHRpb25zXG4gICAgICBpZiB2aW9sYXRpbmdPcHRpb25zLmxlbmd0aFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIje29wdGlvbn0gaXMgZXhjbHVzaXZlIHdpdGggWyN7dmlvbGF0aW5nT3B0aW9uc31dXCIpXG5cbiAgc2V0T3B0aW9uc09yZGVyZWQgPSBbXG4gICAgJ3RleHQnLCAndGV4dF8nLFxuICAgICd0ZXh0QycsICd0ZXh0Q18nLFxuICAgICdncmFtbWFyJyxcbiAgICAnY3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAnYWRkQ3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAncmVnaXN0ZXInLFxuICAgICdzZWxlY3RlZEJ1ZmZlclJhbmdlJ1xuICBdXG5cbiAgc2V0RXhjbHVzaXZlUnVsZXMgPVxuICAgIHRleHRDOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuICAgIHRleHRDXzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cblxuICAjIFB1YmxpY1xuICBzZXQ6IChvcHRpb25zKSA9PlxuICAgIEB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgc2V0T3B0aW9uc09yZGVyZWQsICdJbnZhbGlkIHNldCBvcHRpb25zJylcbiAgICBAdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zKG9wdGlvbnMsIHNldEV4Y2x1c2l2ZVJ1bGVzKVxuXG4gICAgZm9yIG5hbWUgaW4gc2V0T3B0aW9uc09yZGVyZWQgd2hlbiBvcHRpb25zW25hbWVdP1xuICAgICAgbWV0aG9kID0gJ3NldCcgKyBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShuYW1lKSlcbiAgICAgIHRoaXNbbWV0aG9kXShvcHRpb25zW25hbWVdKVxuXG4gIHNldFRleHQ6ICh0ZXh0KSAtPlxuICAgIEBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuXG4gIHNldFRleHRfOiAodGV4dCkgLT5cbiAgICBAc2V0VGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBzZXRUZXh0QzogKHRleHQpIC0+XG4gICAgY3Vyc29ycyA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCd8JywgdGV4dC5yZXBsYWNlKC8hL2csICcnKSlcbiAgICBsYXN0Q3Vyc29yID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJyEnLCB0ZXh0LnJlcGxhY2UoL1xcfC9nLCAnJykpXG4gICAgQHNldFRleHQodGV4dC5yZXBsYWNlKC9bXFx8IV0vZywgJycpKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzLmNvbmNhdChsYXN0Q3Vyc29yKVxuICAgIGlmIGN1cnNvcnMubGVuZ3RoXG4gICAgICBAc2V0Q3Vyc29yKGN1cnNvcnMpXG5cbiAgc2V0VGV4dENfOiAodGV4dCkgLT5cbiAgICBAc2V0VGV4dEModGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgc2V0R3JhbW1hcjogKHNjb3BlKSAtPlxuICAgIEBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGUpKVxuXG4gIHNldEN1cnNvcjogKHBvaW50cykgLT5cbiAgICBwb2ludHMgPSB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludHMuc2hpZnQoKSlcbiAgICBmb3IgcG9pbnQgaW4gcG9pbnRzXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0Q3Vyc29yU2NyZWVuOiAocG9pbnRzKSAtPlxuICAgIHBvaW50cyA9IHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKHBvaW50cy5zaGlmdCgpKVxuICAgIGZvciBwb2ludCBpbiBwb2ludHNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuICBzZXRBZGRDdXJzb3I6IChwb2ludHMpIC0+XG4gICAgZm9yIHBvaW50IGluIHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBzZXRSZWdpc3RlcjogKHJlZ2lzdGVyKSAtPlxuICAgIGZvciBuYW1lLCB2YWx1ZSBvZiByZWdpc3RlclxuICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldChuYW1lLCB2YWx1ZSlcblxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIGVuc3VyZU9wdGlvbnNPcmRlcmVkID0gW1xuICAgICd0ZXh0JywgJ3RleHRfJyxcbiAgICAndGV4dEMnLCAndGV4dENfJyxcbiAgICAnc2VsZWN0ZWRUZXh0JywgJ3NlbGVjdGVkVGV4dF8nLCAnc2VsZWN0ZWRUZXh0T3JkZXJlZCcsIFwic2VsZWN0aW9uSXNOYXJyb3dlZFwiXG4gICAgJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ251bUN1cnNvcnMnXG4gICAgJ3JlZ2lzdGVyJyxcbiAgICAnc2VsZWN0ZWRTY3JlZW5SYW5nZScsICdzZWxlY3RlZFNjcmVlblJhbmdlT3JkZXJlZCdcbiAgICAnc2VsZWN0ZWRCdWZmZXJSYW5nZScsICdzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZCdcbiAgICAnc2VsZWN0aW9uSXNSZXZlcnNlZCcsXG4gICAgJ3BlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZScsICdwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQnXG4gICAgJ29jY3VycmVuY2VDb3VudCcsICdvY2N1cnJlbmNlVGV4dCdcbiAgICAncHJvcGVydHlIZWFkJ1xuICAgICdwcm9wZXJ0eVRhaWwnXG4gICAgJ3Njcm9sbFRvcCcsXG4gICAgJ21hcmsnXG4gICAgJ21vZGUnLFxuICBdXG4gIGVuc3VyZUV4Y2x1c2l2ZVJ1bGVzID1cbiAgICB0ZXh0QzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cbiAgICB0ZXh0Q186IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG5cbiAgZ2V0QW5kRGVsZXRlS2V5c3Ryb2tlT3B0aW9uczogKG9wdGlvbnMpIC0+XG4gICAge3BhcnRpYWxNYXRjaFRpbWVvdXQsIHdhaXRzRm9yRmluaXNofSA9IG9wdGlvbnNcbiAgICBkZWxldGUgb3B0aW9ucy5wYXJ0aWFsTWF0Y2hUaW1lb3V0XG4gICAgZGVsZXRlIG9wdGlvbnMud2FpdHNGb3JGaW5pc2hcbiAgICB7cGFydGlhbE1hdGNoVGltZW91dCwgd2FpdHNGb3JGaW5pc2h9XG5cbiAgIyBQdWJsaWNcbiAgZW5zdXJlOiAoa2V5c3Ryb2tlLCBvcHRpb25zPXt9KSA9PlxuICAgIHVubGVzcyB0eXBlb2Yob3B0aW9ucykgaXMgJ29iamVjdCdcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3B0aW9ucyBmb3IgJ2Vuc3VyZSc6IG11c3QgYmUgJ29iamVjdCcgYnV0IGdvdCAnI3t0eXBlb2Yob3B0aW9ucyl9J1wiKVxuICAgIGlmIGtleXN0cm9rZT8gYW5kIG5vdCAodHlwZW9mKGtleXN0cm9rZSkgaXMgJ3N0cmluZycgb3IgQXJyYXkuaXNBcnJheShrZXlzdHJva2UpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBrZXlzdHJva2UgZm9yICdlbnN1cmUnOiBtdXN0IGJlICdzdHJpbmcnIG9yICdhcnJheScgYnV0IGdvdCAnI3t0eXBlb2Yoa2V5c3Ryb2tlKX0nXCIpXG5cbiAgICBrZXlzdHJva2VPcHRpb25zID0gQGdldEFuZERlbGV0ZUtleXN0cm9rZU9wdGlvbnMob3B0aW9ucylcblxuICAgIEB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgZW5zdXJlT3B0aW9uc09yZGVyZWQsICdJbnZhbGlkIGVuc3VyZSBvcHRpb24nKVxuICAgIEB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnMob3B0aW9ucywgZW5zdXJlRXhjbHVzaXZlUnVsZXMpXG5cbiAgICBydW5TbWFydCA9IChmbikgLT4gaWYga2V5c3Ryb2tlT3B0aW9ucy53YWl0c0ZvckZpbmlzaCB0aGVuIHJ1bnMoZm4pIGVsc2UgZm4oKVxuXG4gICAgcnVuU21hcnQgPT5cbiAgICAgIEBfa2V5c3Ryb2tlKGtleXN0cm9rZSwga2V5c3Ryb2tlT3B0aW9ucykgdW5sZXNzIF8uaXNFbXB0eShrZXlzdHJva2UpXG5cbiAgICBydW5TbWFydCA9PlxuICAgICAgZm9yIG5hbWUgaW4gZW5zdXJlT3B0aW9uc09yZGVyZWQgd2hlbiBvcHRpb25zW25hbWVdP1xuICAgICAgICBtZXRob2QgPSAnZW5zdXJlJyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBlbnN1cmVXYWl0OiAoa2V5c3Ryb2tlLCBvcHRpb25zPXt9KSA9PlxuICAgIEBlbnN1cmUoa2V5c3Ryb2tlLCBPYmplY3QuYXNzaWduKG9wdGlvbnMsIHdhaXRzRm9yRmluaXNoOiB0cnVlKSlcblxuICBiaW5kRW5zdXJlT3B0aW9uOiAob3B0aW9uc0Jhc2UsIHdhaXQ9ZmFsc2UpID0+XG4gICAgKGtleXN0cm9rZSwgb3B0aW9ucykgPT5cbiAgICAgIGludGVyc2VjdGluZ09wdGlvbnMgPSBfLmludGVyc2VjdGlvbihfLmtleXMob3B0aW9ucyksIF8ua2V5cyhvcHRpb25zQmFzZSkpXG4gICAgICBpZiBpbnRlcnNlY3RpbmdPcHRpb25zLmxlbmd0aFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb25mbGljdCB3aXRoIGJvdW5kIG9wdGlvbnMgI3tpbnNwZWN0KGludGVyc2VjdGluZ09wdGlvbnMpfVwiKVxuXG4gICAgICBvcHRpb25zID0gXy5kZWZhdWx0cyhfLmNsb25lKG9wdGlvbnMpLCBvcHRpb25zQmFzZSlcbiAgICAgIG9wdGlvbnMud2FpdHNGb3JGaW5pc2ggPSB0cnVlIGlmIHdhaXRcbiAgICAgIEBlbnN1cmUoa2V5c3Ryb2tlLCBvcHRpb25zKVxuXG4gIGJpbmRFbnN1cmVXYWl0T3B0aW9uOiAob3B0aW9uc0Jhc2UpID0+XG4gICAgQGJpbmRFbnN1cmVPcHRpb24ob3B0aW9uc0Jhc2UsIHRydWUpXG5cbiAgX2tleXN0cm9rZTogKGtleXMsIG9wdGlvbnM9e30pID0+XG4gICAgdGFyZ2V0ID0gQGVkaXRvckVsZW1lbnRcbiAgICBrZXlzdHJva2VzVG9FeGVjdXRlID0ga2V5cy5zcGxpdCgvXFxzKy8pXG4gICAgbGFzdEtleXN0cm9rZUluZGV4ID0ga2V5c3Ryb2tlc1RvRXhlY3V0ZS5sZW5ndGggLSAxXG5cbiAgICBmb3Iga2V5LCBpIGluIGtleXN0cm9rZXNUb0V4ZWN1dGVcbiAgICAgIHdhaXRzRm9yRmluaXNoID0gKGkgaXMgbGFzdEtleXN0cm9rZUluZGV4KSBhbmQgb3B0aW9ucy53YWl0c0ZvckZpbmlzaFxuICAgICAgaWYgd2FpdHNGb3JGaW5pc2hcbiAgICAgICAgZmluaXNoZWQgPSBmYWxzZVxuICAgICAgICBAdmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24gLT4gZmluaXNoZWQgPSB0cnVlXG5cbiAgICAgICMgW0ZJWE1FXSBXaHkgY2FuJ3QgSSBsZXQgYXRvbS5rZXltYXBzIGhhbmRsZSBlbnRlci9lc2NhcGUgYnkgYnVpbGRFdmVudCBhbmQgaGFuZGxlS2V5Ym9hcmRFdmVudFxuICAgICAgaWYgQHZpbVN0YXRlLl9fc2VhcmNoSW5wdXQ/Lmhhc0ZvY3VzKCkgIyB0byBhdm9pZCBhdXRvIHBvcHVsYXRlXG4gICAgICAgIHRhcmdldCA9IEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JFbGVtZW50XG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICB3aGVuIFwiZW50ZXJcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICB3aGVuIFwiZXNjYXBlXCIgdGhlbiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ2NvcmU6Y2FuY2VsJylcbiAgICAgICAgICBlbHNlIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3IuaW5zZXJ0VGV4dChrZXkpXG5cbiAgICAgIGVsc2UgaWYgQHZpbVN0YXRlLmlucHV0RWRpdG9yP1xuICAgICAgICB0YXJnZXQgPSBAdmltU3RhdGUuaW5wdXRFZGl0b3IuZWxlbWVudFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgd2hlbiBcImVudGVyXCIgdGhlbiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgd2hlbiBcImVzY2FwZVwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNhbmNlbCcpXG4gICAgICAgICAgZWxzZSBAdmltU3RhdGUuaW5wdXRFZGl0b3IuaW5zZXJ0VGV4dChrZXkpXG5cbiAgICAgIGVsc2VcbiAgICAgICAgZXZlbnQgPSBidWlsZEtleWRvd25FdmVudEZyb21LZXlzdHJva2Uobm9ybWFsaXplS2V5c3Ryb2tlcyhrZXkpLCB0YXJnZXQpXG4gICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50KVxuXG4gICAgICBpZiB3YWl0c0ZvckZpbmlzaFxuICAgICAgICB3YWl0c0ZvciAtPiBmaW5pc2hlZFxuXG4gICAgaWYgb3B0aW9ucy5wYXJ0aWFsTWF0Y2hUaW1lb3V0XG4gICAgICBhZHZhbmNlQ2xvY2soYXRvbS5rZXltYXBzLmdldFBhcnRpYWxNYXRjaFRpbWVvdXQoKSlcblxuICBrZXlzdHJva2U6IC0+XG4gICAgIyBET05UIHJlbW92ZSB0aGlzIG1ldGhvZCBzaW5jZSBmaWVsZCBleHRyYWN0aW9uIGlzIHN0aWxsIHVzZWQgaW4gdm1wIHBsdWdpbnNcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvbnQgdXNlIGBrZXlzdHJva2UoXCJ4IHkgelwiKWAsIGluc3RlYWQgdXNlIGBlbnN1cmUoXCJ4IHkgelwiKWAnKVxuXG4gICMgRW5zdXJlIGVhY2ggb3B0aW9ucyBmcm9tIGhlcmVcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBlbnN1cmVUZXh0OiAodGV4dCkgLT5cbiAgICBleHBlY3QoQGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwodGV4dClcblxuICBlbnN1cmVUZXh0XzogKHRleHQpIC0+XG4gICAgQGVuc3VyZVRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgZW5zdXJlVGV4dEM6ICh0ZXh0KSAtPlxuICAgIGN1cnNvcnMgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnfCcsIHRleHQucmVwbGFjZSgvIS9nLCAnJykpXG4gICAgbGFzdEN1cnNvciA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCchJywgdGV4dC5yZXBsYWNlKC9cXHwvZywgJycpKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzLmNvbmNhdChsYXN0Q3Vyc29yKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzXG4gICAgICAubWFwIChwb2ludCkgLT4gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgICAgIC5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcbiAgICBAZW5zdXJlVGV4dCh0ZXh0LnJlcGxhY2UoL1tcXHwhXS9nLCAnJykpXG4gICAgaWYgY3Vyc29ycy5sZW5ndGhcbiAgICAgIEBlbnN1cmVDdXJzb3IoY3Vyc29ycywgdHJ1ZSlcblxuICAgIGlmIGxhc3RDdXJzb3IubGVuZ3RoXG4gICAgICBleHBlY3QoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKGxhc3RDdXJzb3JbMF0pXG5cbiAgZW5zdXJlVGV4dENfOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlVGV4dEModGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0OiAodGV4dCwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBzZWxlY3Rpb25zID0gaWYgb3JkZXJlZFxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgYWN0dWFsID0gKHMuZ2V0VGV4dCgpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5KHRleHQpKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dF86ICh0ZXh0LCBvcmRlcmVkKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJyksIG9yZGVyZWQpXG5cbiAgZW5zdXJlU2VsZWN0aW9uSXNOYXJyb3dlZDogKGlzTmFycm93ZWQpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLmlzTmFycm93ZWQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwoaXNOYXJyb3dlZClcblxuICBlbnN1cmVTZWxlY3RlZFRleHRPcmRlcmVkOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRUZXh0KHRleHQsIHRydWUpXG5cbiAgZW5zdXJlQ3Vyc29yOiAocG9pbnRzLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcbiAgICBhY3R1YWwgPSBhY3R1YWwuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpIGlmIG9yZGVyZWRcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlQ3Vyc29yU2NyZWVuOiAocG9pbnRzKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb25zKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlUmVnaXN0ZXI6IChyZWdpc3RlcikgLT5cbiAgICBmb3IgbmFtZSwgZW5zdXJlIG9mIHJlZ2lzdGVyXG4gICAgICB7c2VsZWN0aW9ufSA9IGVuc3VyZVxuICAgICAgZGVsZXRlIGVuc3VyZS5zZWxlY3Rpb25cbiAgICAgIHJlZyA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobmFtZSwgc2VsZWN0aW9uKVxuICAgICAgZm9yIHByb3BlcnR5LCBfdmFsdWUgb2YgZW5zdXJlXG4gICAgICAgIGV4cGVjdChyZWdbcHJvcGVydHldKS50b0VxdWFsKF92YWx1ZSlcblxuICBlbnN1cmVOdW1DdXJzb3JzOiAobnVtYmVyKSAtPlxuICAgIGV4cGVjdChAZWRpdG9yLmdldEN1cnNvcnMoKSkudG9IYXZlTGVuZ3RoIG51bWJlclxuXG4gIF9lbnN1cmVTZWxlY3RlZFJhbmdlQnk6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSwgZm4pIC0+XG4gICAgc2VsZWN0aW9ucyA9IGlmIG9yZGVyZWRcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGFjdHVhbCA9IChmbihzKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUmFuZ2UocmFuZ2UpKVxuXG4gIGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2U6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBAX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeSByYW5nZSwgb3JkZXJlZCwgKHMpIC0+IHMuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gIGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2VPcmRlcmVkOiAocmFuZ2UpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2UocmFuZ2UsIHRydWUpXG5cbiAgZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIEBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5IHJhbmdlLCBvcmRlcmVkLCAocykgLT4gcy5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IChyYW5nZSkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSwgdHJ1ZSlcblxuICBlbnN1cmVTZWxlY3Rpb25Jc1JldmVyc2VkOiAocmV2ZXJzZWQpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgYWN0dWFsID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9CZShyZXZlcnNlZClcblxuICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUmFuZ2UocmFuZ2UpKVxuXG4gIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogKG51bWJlcikgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJDb3VudCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9CZSBudW1iZXJcblxuICBlbnN1cmVPY2N1cnJlbmNlQ291bnQ6IChudW1iZXIpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckNvdW50KClcbiAgICBleHBlY3QoYWN0dWFsKS50b0JlIG51bWJlclxuXG4gIGVuc3VyZU9jY3VycmVuY2VUZXh0OiAodGV4dCkgLT5cbiAgICBtYXJrZXJzID0gQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKVxuICAgIHJhbmdlcyA9IChyLmdldEJ1ZmZlclJhbmdlKCkgZm9yIHIgaW4gbWFya2VycylcbiAgICBhY3R1YWwgPSAoQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyKSBmb3IgciBpbiByYW5nZXMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5KHRleHQpKVxuXG4gIGVuc3VyZVByb3BlcnR5SGVhZDogKHBvaW50cykgLT5cbiAgICBnZXRIZWFkUHJvcGVydHkgPSAoc2VsZWN0aW9uKSA9PlxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgYWN0dWFsID0gKGdldEhlYWRQcm9wZXJ0eShzKSBmb3IgcyBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlUHJvcGVydHlUYWlsOiAocG9pbnRzKSAtPlxuICAgIGdldFRhaWxQcm9wZXJ0eSA9IChzZWxlY3Rpb24pID0+XG4gICAgICBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcigndGFpbCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBhY3R1YWwgPSAoZ2V0VGFpbFByb3BlcnR5KHMpIGZvciBzIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVTY3JvbGxUb3A6IChzY3JvbGxUb3ApIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsIHNjcm9sbFRvcFxuXG4gIGVuc3VyZU1hcms6IChtYXJrKSAtPlxuICAgIGZvciBuYW1lLCBwb2ludCBvZiBtYXJrXG4gICAgICBhY3R1YWwgPSBAdmltU3RhdGUubWFyay5nZXQobmFtZSlcbiAgICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwocG9pbnQpXG5cbiAgZW5zdXJlTW9kZTogKG1vZGUpIC0+XG4gICAgbW9kZSA9IHRvQXJyYXkobW9kZSkuc2xpY2UoKVxuICAgIGV4cGVjdChAdmltU3RhdGUuaXNNb2RlKG1vZGUuLi4pKS50b0JlKHRydWUpXG5cbiAgICBtb2RlWzBdID0gXCIje21vZGVbMF19LW1vZGVcIlxuICAgIG1vZGUgPSBtb2RlLmZpbHRlcigobSkgLT4gbSlcbiAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd2aW0tbW9kZS1wbHVzJykpLnRvQmUodHJ1ZSlcbiAgICBmb3IgbSBpbiBtb2RlXG4gICAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG0pKS50b0JlKHRydWUpXG4gICAgc2hvdWxkTm90Q29udGFpbkNsYXNzZXMgPSBfLmRpZmZlcmVuY2Uoc3VwcG9ydGVkTW9kZUNsYXNzLCBtb2RlKVxuICAgIGZvciBtIGluIHNob3VsZE5vdENvbnRhaW5DbGFzc2VzXG4gICAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG0pKS50b0JlKGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtnZXRWaW1TdGF0ZSwgZ2V0VmlldywgZGlzcGF0Y2gsIFRleHREYXRhLCB3aXRoTW9ja1BsYXRmb3JtfVxuIl19
