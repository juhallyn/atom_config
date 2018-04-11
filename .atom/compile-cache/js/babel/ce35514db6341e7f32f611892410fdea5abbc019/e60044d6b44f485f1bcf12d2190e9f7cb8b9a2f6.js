'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var BufferedProcess = _require.BufferedProcess;

var settings = require('./settings');
var VimState = require('./vim-state');

// NOTE: changing order affects output of lib/json/command-table.json
var VMPOperationFiles = ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'];

// Borrowed from underscore-plus
var ModifierKeyMap = {
  'ctrl-cmd-': '⌃⌘',
  'cmd-': '⌘',
  'ctrl-': '⌃',
  alt: '⌥',
  option: '⌥',
  enter: '⏎',
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
  backspace: 'BS',
  space: 'SPC'
};

var SelectorMap = {
  'atom-text-editor.vim-mode-plus': '',
  '.normal-mode': 'n',
  '.insert-mode': 'i',
  '.replace': 'R',
  '.visual-mode': 'v',
  '.characterwise': 'C',
  '.blockwise': 'B',
  '.linewise': 'L',
  '.operator-pending-mode': 'o',
  '.with-count': '#',
  '.has-persistent-selection': '%'
};

var Developer = (function () {
  function Developer() {
    _classCallCheck(this, Developer);
  }

  _createClass(Developer, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return atom.commands.add('atom-text-editor', {
        'vim-mode-plus:toggle-debug': function vimModePlusToggleDebug() {
          return _this.toggleDebug();
        },
        'vim-mode-plus:open-in-vim': function vimModePlusOpenInVim() {
          return _this.openInVim();
        },
        'vim-mode-plus:generate-command-summary-table': function vimModePlusGenerateCommandSummaryTable() {
          return _this.generateCommandSummaryTable();
        },
        'vim-mode-plus:write-command-table-and-file-table-to-disk': function vimModePlusWriteCommandTableAndFileTableToDisk() {
          return _this.writeCommandTableAndFileTableToDisk();
        },
        'vim-mode-plus:set-global-vim-state': function vimModePlusSetGlobalVimState() {
          return _this.setGlobalVimState();
        },
        'vim-mode-plus:clear-debug-output': function vimModePlusClearDebugOutput() {
          return _this.clearDebugOutput();
        },
        'vim-mode-plus:reload': function vimModePlusReload() {
          return _this.reload();
        },
        'vim-mode-plus:reload-with-dependencies': function vimModePlusReloadWithDependencies() {
          return _this.reload(true);
        },
        'vim-mode-plus:report-total-marker-count': function vimModePlusReportTotalMarkerCount() {
          return _this.reportTotalMarkerCount();
        },
        'vim-mode-plus:report-total-and-per-editor-marker-count': function vimModePlusReportTotalAndPerEditorMarkerCount() {
          return _this.reportTotalMarkerCount(true);
        },
        'vim-mode-plus:report-require-cache': function vimModePlusReportRequireCache() {
          return _this.reportRequireCache({ excludeNodModules: true });
        },
        'vim-mode-plus:report-require-cache-all': function vimModePlusReportRequireCacheAll() {
          return _this.reportRequireCache({ excludeNodModules: false });
        }
      });
    }
  }, {
    key: 'setGlobalVimState',
    value: function setGlobalVimState() {
      global.vimState = VimState.get(atom.workspace.getActiveTextEditor());
      console.log('set global.vimState for debug', global.vimState);
    }
  }, {
    key: 'reportRequireCache',
    value: function reportRequireCache(_ref) {
      var focus = _ref.focus;
      var excludeNodModules = _ref.excludeNodModules;

      var path = require('path');
      var packPath = atom.packages.getLoadedPackage('vim-mode-plus').path;
      var cachedPaths = Object.keys(require.cache).filter(function (p) {
        return p.startsWith(packPath + path.sep);
      }).map(function (p) {
        return p.replace(packPath, '');
      });

      for (var cachedPath of cachedPaths) {
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(new RegExp('' + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        console.log(cachedPath);
      }
    }
  }, {
    key: 'reportTotalMarkerCount',
    value: function reportTotalMarkerCount() {
      var showEditorsReport = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var _require2 = require('util');

      var inspect = _require2.inspect;

      var _require3 = require('path');

      var basename = _require3.basename;

      var total = {
        mark: 0,
        hlsearch: 0,
        mutation: 0,
        occurrence: 0,
        persistentSel: 0
      };

      for (var editor of atom.workspace.getTextEditors()) {
        var vimState = VimState.get(editor);
        var mark = vimState.mark.markerLayer.getMarkerCount();
        var hlsearch = vimState.highlightSearch.markerLayer.getMarkerCount();
        var mutation = vimState.mutationManager.markerLayer.getMarkerCount();
        var occurrence = vimState.occurrenceManager.markerLayer.getMarkerCount();
        var persistentSel = vimState.persistentSelection.markerLayer.getMarkerCount();
        if (showEditorsReport) {
          console.log(basename(editor.getPath()), inspect({ mark: mark, hlsearch: hlsearch, mutation: mutation, occurrence: occurrence, persistentSel: persistentSel }));
        }

        total.mark += mark;
        total.hlsearch += hlsearch;
        total.mutation += mutation;
        total.occurrence += occurrence;
        total.persistentSel += persistentSel;
      }

      return console.log('total', inspect(total));
    }
  }, {
    key: 'reload',
    value: _asyncToGenerator(function* (reloadDependencies) {
      function deleteRequireCacheForPathPrefix(prefix) {
        Object.keys(require.cache).filter(function (p) {
          return p.startsWith(prefix);
        }).forEach(function (p) {
          return delete require.cache[p];
        });
      }

      var packagesNeedReload = ['vim-mode-plus'];
      if (reloadDependencies) packagesNeedReload.push.apply(packagesNeedReload, _toConsumableArray(settings.get('devReloadPackages')));

      var loadedPackages = packagesNeedReload.filter(function (packName) {
        return atom.packages.isPackageLoaded(packName);
      });
      console.log('reload', loadedPackages);

      var pathSeparator = require('path').sep;

      for (var packName of loadedPackages) {
        console.log('- deactivating ' + packName);
        var packPath = atom.packages.getLoadedPackage(packName).path;
        yield atom.packages.deactivatePackage(packName);
        atom.packages.unloadPackage(packName);
        deleteRequireCacheForPathPrefix(packPath + pathSeparator);
      }
      console.time('activate');

      loadedPackages.forEach(function (packName) {
        console.log('+ activating ' + packName);
        atom.packages.loadPackage(packName);
        atom.packages.activatePackage(packName);
      });

      console.timeEnd('activate');
    })
  }, {
    key: 'clearDebugOutput',
    value: function clearDebugOutput(name, fn) {
      var _require4 = require('fs-plus');

      var normalize = _require4.normalize;

      var filePath = normalize(settings.get('debugOutputFilePath'));
      atom.workspace.open(filePath, { searchAllPanes: true, activatePane: false }).then(function (editor) {
        editor.setText('');
        editor.save();
      });
    }
  }, {
    key: 'toggleDebug',
    value: function toggleDebug() {
      settings.set('debug', !settings.get('debug'));
      console.log(settings.scope + ' debug:', settings.get('debug'));
    }
  }, {
    key: 'getCommandSpecs',
    value: function getCommandSpecs() {
      var _require5 = require('underscore-plus');

      var escapeRegExp = _require5.escapeRegExp;

      var _require6 = require('./utils');

      var getKeyBindingForCommand = _require6.getKeyBindingForCommand;

      var specs = [];
      for (var file of VMPOperationFiles) {
        for (var klass of Object.values(require(file))) {
          if (!klass.isCommand()) continue;

          var commandName = klass.getCommandName();

          var keymaps = getKeyBindingForCommand(commandName, { packageName: 'vim-mode-plus' });
          var keymap = keymaps ? keymaps.map(function (k) {
            return '`' + compactSelector(k.selector) + '` <code>' + compactKeystrokes(k.keystrokes) + '</code>';
          }).join('<br/>') : undefined;

          specs.push({
            name: klass.name,
            commandName: commandName,
            kind: klass.operationKind,
            keymap: keymap
          });
        }
      }

      return specs;

      function compactSelector(selector) {
        var sources = Object.keys(SelectorMap).map(escapeRegExp);
        var regex = new RegExp('(' + sources.join('|') + ')', 'g');
        return selector.split(/,\s*/g).map(function (scope) {
          return scope.replace(/:not\((.*?)\)/g, '!$1').replace(regex, function (s) {
            return SelectorMap[s];
          });
        }).join(',');
      }

      function compactKeystrokes(keystrokes) {
        var specialChars = '\\`*_{}[]()#+-.!';

        var modifierKeyRegexSources = Object.keys(ModifierKeyMap).map(escapeRegExp);
        var modifierKeyRegex = new RegExp('(' + modifierKeyRegexSources.join('|') + ')');
        var specialCharsRegexSources = specialChars.split('').map(escapeRegExp);
        var specialCharsRegex = new RegExp('(' + specialCharsRegexSources.join('|') + ')', 'g');

        return keystrokes
        // .replace(/(`|_)/g, '\\$1')
        .replace(modifierKeyRegex, function (s) {
          return ModifierKeyMap[s];
        }).replace(specialCharsRegex, '\\$1').replace(/\|/g, '&#124;').replace(/\s+/, '');
      }
    }
  }, {
    key: 'generateSummaryTableForCommandSpecs',
    value: function generateSummaryTableForCommandSpecs(specs) {
      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var header = _ref2.header;

      var grouped = {};
      for (var spec of specs) {
        grouped[spec.kind] = spec;
      }var result = '';
      var OPERATION_KINDS = ['operator', 'motion', 'text-object', 'misc-command'];

      for (var kind of OPERATION_KINDS) {
        var _specs = grouped[kind];
        if (!_specs) continue;

        // prettier-ignore
        var table = ['| Keymap | Command | Description |', '|:-------|:--------|:------------|'];

        for (var _ref32 of _specs) {
          var _ref3$keymap = _ref32.keymap;
          var keymap = _ref3$keymap === undefined ? '' : _ref3$keymap;
          var commandName = _ref32.commandName;
          var _ref3$description = _ref32.description;
          var description = _ref3$description === undefined ? '' : _ref3$description;

          commandName = commandName.replace(/vim-mode-plus:/, '');
          table.push('| ' + keymap + ' | `' + commandName + '` | ' + description + ' |');
        }
        result += '## ' + kind + '\n\n' + table.join('\n') + '\n\n';
      }

      atom.workspace.open().then(function (editor) {
        if (header) editor.insertText(header + '\n\n');
        editor.insertText(result);
      });
    }
  }, {
    key: 'generateCommandSummaryTable',
    value: function generateCommandSummaryTable() {
      var _require7 = require('./utils');

      var removeIndent = _require7.removeIndent;

      var header = removeIndent('\n      ## Keymap selector abbreviations\n\n      In this document, following abbreviations are used for shortness.\n\n      | Abbrev | Selector                     | Description                         |\n      |:-------|:-----------------------------|:------------------------------------|\n      | `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n      | `i`    | `.insert-mode`               |                                     |\n      | `o`    | `.operator-pending-mode`     |                                     |\n      | `n`    | `.normal-mode`               |                                     |\n      | `v`    | `.visual-mode`               |                                     |\n      | `vB`   | `.visual-mode.blockwise`     |                                     |\n      | `vL`   | `.visual-mode.linewise`      |                                     |\n      | `vC`   | `.visual-mode.characterwise` |                                     |\n      | `iR`   | `.insert-mode.replace`       |                                     |\n      | `#`    | `.with-count`                | when count is specified             |\n      | `%`    | `.has-persistent-selection`  | when persistent-selection is exists |\n      ');

      this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), { header: header });
    }
  }, {
    key: 'openInVim',
    value: function openInVim() {
      var editor = atom.workspace.getActiveTextEditor();

      var _editor$getCursorBufferPosition = editor.getCursorBufferPosition();

      var row = _editor$getCursorBufferPosition.row;
      var column = _editor$getCursorBufferPosition.column;

      // e.g. /Applications/MacVim.app/Contents/MacOS/Vim -g /etc/hosts "+call cursor(4, 3)"
      return new BufferedProcess({
        command: '/Applications/MacVim.app/Contents/MacOS/Vim',
        args: ['-g', editor.getPath(), '+call cursor(' + (row + 1) + ', ' + (column + 1) + ')']
      });
    }
  }, {
    key: 'buildCommandTableAndFileTable',
    value: function buildCommandTableAndFileTable() {
      var fileTable = {};
      var commandTable = [];
      var seen = {}; // Just to detect duplicate name

      for (var file of VMPOperationFiles) {
        fileTable[file] = [];

        for (var klass of Object.values(require(file))) {
          if (seen[klass.name]) {
            throw new Error('Duplicate class ' + klass.name + ' in "' + file + '" and "' + seen[klass.name] + '"');
          }
          seen[klass.name] = file;
          fileTable[file].push(klass.name);
          if (klass.isCommand()) commandTable.push(klass.getCommandName());
        }
      }
      return { commandTable: commandTable, fileTable: fileTable };
    }

    // # How vmp commands become available?
    // #========================================
    // Vmp have many commands, loading full commands at startup slow down pkg activation.
    // So vmp load summary command table at startup then lazy require command body on-use timing.
    // Here is how vmp commands are registerd and invoked.
    // Initially introduced in PR #758
    //
    // 1. [On dev]: Preparation done by developer
    //   - Invoking `Vim Mode Plus:Write Command Table And File Table To Disk`. it does following.
    //   - "./json/command-table.json" and "./json/file-table.json". are updated.
    //
    // 2. [On atom/vmp startup]
    //   - Register commands(e.g. `move-down`) from "./json/command-table.json".
    //
    // 3. [On run time]: e.g. Invoke `move-down` by `j` keystroke
    //   - Fire `move-down` command.
    //   - It execute `vimState.operationStack.run("MoveDown")`
    //   - Determine files to require from "./json/file-table.json".
    //   - Load `MoveDown` class by require('./motions') and run it!
    //
  }, {
    key: 'writeCommandTableAndFileTableToDisk',
    value: _asyncToGenerator(function* () {
      var fs = require('fs-plus');
      var path = require('path');

      var _buildCommandTableAndFileTable = this.buildCommandTableAndFileTable();

      var commandTable = _buildCommandTableAndFileTable.commandTable;
      var fileTable = _buildCommandTableAndFileTable.fileTable;

      var getStateFor = function getStateFor(baseName, object, pretty) {
        var filePath = path.join(__dirname, 'json', baseName) + (pretty ? '-pretty.json' : '.json');
        var jsonString = pretty ? JSON.stringify(object, null, '  ') : JSON.stringify(object);
        var needUpdate = fs.readFileSync(filePath, 'utf8').trimRight() !== jsonString;
        return { filePath: filePath, jsonString: jsonString, needUpdate: needUpdate };
      };

      var statesNeedUpdate = [getStateFor('command-table', commandTable, false), getStateFor('command-table', commandTable, true), getStateFor('file-table', fileTable, false), getStateFor('file-table', fileTable, true)].filter(function (state) {
        return state.needUpdate;
      });

      if (!statesNeedUpdate.length) {
        atom.notifications.addInfo('No changfes in commandTable and fileTable', { dismissable: true });
        return;
      }

      var _loop = function* (_ref4) {
        var jsonString = _ref4.jsonString;
        var filePath = _ref4.filePath;

        yield atom.workspace.open(filePath, { activatePane: false, activateItem: false }).then(function (editor) {
          editor.setText(jsonString);
          return editor.save().then(function () {
            atom.notifications.addInfo('Updated ' + path.basename(filePath), { dismissable: true });
          });
        });
      };

      for (var _ref4 of statesNeedUpdate) {
        yield* _loop(_ref4);
      }
    })
  }]);

  return Developer;
})();

module.exports = new Developer();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hwdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9kZXZlbG9wZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O2VBRWUsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBbEMsZUFBZSxZQUFmLGVBQWU7O0FBRXRCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7OztBQUd2QyxJQUFNLGlCQUFpQixHQUFHLENBQ3hCLFlBQVksRUFDWixtQkFBbUIsRUFDbkIsNkJBQTZCLEVBQzdCLFVBQVUsRUFDVixpQkFBaUIsRUFDakIsZUFBZSxFQUNmLGdCQUFnQixDQUNqQixDQUFBOzs7QUFHRCxJQUFNLGNBQWMsR0FBRztBQUNyQixhQUFXLEVBQUUsSUFBYztBQUMzQixRQUFNLEVBQUUsR0FBUTtBQUNoQixTQUFPLEVBQUUsR0FBUTtBQUNqQixLQUFHLEVBQUUsR0FBUTtBQUNiLFFBQU0sRUFBRSxHQUFRO0FBQ2hCLE9BQUssRUFBRSxHQUFRO0FBQ2YsTUFBSSxFQUFFLEdBQVE7QUFDZCxPQUFLLEVBQUUsR0FBUTtBQUNmLElBQUUsRUFBRSxHQUFRO0FBQ1osTUFBSSxFQUFFLEdBQVE7QUFDZCxXQUFTLEVBQUUsSUFBSTtBQUNmLE9BQUssRUFBRSxLQUFLO0NBQ2IsQ0FBQTs7QUFFRCxJQUFNLFdBQVcsR0FBRztBQUNsQixrQ0FBZ0MsRUFBRSxFQUFFO0FBQ3BDLGdCQUFjLEVBQUUsR0FBRztBQUNuQixnQkFBYyxFQUFFLEdBQUc7QUFDbkIsWUFBVSxFQUFFLEdBQUc7QUFDZixnQkFBYyxFQUFFLEdBQUc7QUFDbkIsa0JBQWdCLEVBQUUsR0FBRztBQUNyQixjQUFZLEVBQUUsR0FBRztBQUNqQixhQUFXLEVBQUUsR0FBRztBQUNoQiwwQkFBd0IsRUFBRSxHQUFHO0FBQzdCLGVBQWEsRUFBRSxH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QUFSLFFBQVE7O0FBQzlCLGNBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDN0YsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDMUIsaUJBQU8sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQzlCLGdCQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sY0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFJLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUE7V0FDdEYsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBOzs7QUFOSix3QkFBcUMsZ0JBQWdCLEVBQUU7O09BT3REO0tBQ0Y7OztTQTNURyxTQUFTOzs7QUE4VGYsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFBIiwiZmlsZSI6Ii9ob21lL2hwdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9kZXZlbG9wZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCB7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUoJ2F0b20nKVxuXG5jb25zdCBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKVxuY29uc3QgVmltU3RhdGUgPSByZXF1aXJlKCcuL3ZpbS1zdGF0ZScpXG5cbi8vIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9qc29uL2NvbW1hbmQtdGFibGUuanNvblxuY29uc3QgVk1QT3BlcmF0aW9uRmlsZXMgPSBbXG4gICcuL29wZXJhdG9yJyxcbiAgJy4vb3BlcmF0b3ItaW5zZXJ0JyxcbiAgJy4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZycsXG4gICcuL21vdGlvbicsXG4gICcuL21vdGlvbi1zZWFyY2gnLFxuICAnLi90ZXh0LW9iamVjdCcsXG4gICcuL21pc2MtY29tbWFuZCdcbl1cblxuLy8gQm9ycm93ZWQgZnJvbSB1bmRlcnNjb3JlLXBsdXNcbmNvbnN0IE1vZGlmaWVyS2V5TWFwID0ge1xuICAnY3RybC1jbWQtJzogJ1xcdTIzMDNcXHUyMzE4JyxcbiAgJ2NtZC0nOiAnXFx1MjMxOCcsXG4gICdjdHJsLSc6ICdcXHUyMzAzJyxcbiAgYWx0OiAnXFx1MjMyNScsXG4gIG9wdGlvbjogJ1xcdTIzMjUnLFxuICBlbnRlcjogJ1xcdTIzY2UnLFxuICBsZWZ0OiAnXFx1MjE5MCcsXG4gIHJpZ2h0OiAnXFx1MjE5MicsXG4gIHVwOiAnXFx1MjE5MScsXG4gIGRvd246ICdcXHUyMTkzJyxcbiAgYmFja3NwYWNlOiAnQlMnLFxuICBzcGFjZTogJ1NQQydcbn1cblxuY29uc3QgU2VsZWN0b3JNYXAgPSB7XG4gICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMnOiAnJyxcbiAgJy5ub3JtYWwtbW9kZSc6ICduJyxcbiAgJy5pbnNlcnQtbW9kZSc6ICdpJyxcbiAgJy5yZXBsYWNlJzogJ1InLFxuICAnLnZpc3VhbC1tb2RlJzogJ3YnLFxuICAnLmNoYXJhY3Rlcndpc2UnOiAnQycsXG4gICcuYmxvY2t3aXNlJzogJ0InLFxuICAnLmxpbmV3aXNlJzogJ0wnLFxuICAnLm9wZXJhdG9yLXBlbmRpbmctbW9kZSc6ICdvJyxcbiAgJy53aXRoLWNvdW50JzogJyMnLFxuICAnLmhhcy1wZXJzaXN0ZW50LXNlbGVjdGlvbic6ICclJ1xufVxuXG5jbGFzcyBEZXZlbG9wZXIge1xuICBpbml0ICgpIHtcbiAgICByZXR1cm4gYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAndmltLW1vZGUtcGx1czp0b2dnbGUtZGVidWcnOiAoKSA9PiB0aGlzLnRvZ2dsZURlYnVnKCksXG4gICAgICAndmltLW1vZGUtcGx1czpvcGVuLWluLXZpbSc6ICgpID0+IHRoaXMub3BlbkluVmltKCksXG4gICAgICAndmltLW1vZGUtcGx1czpnZW5lcmF0ZS1jb21tYW5kLXN1bW1hcnktdGFibGUnOiAoKSA9PiB0aGlzLmdlbmVyYXRlQ29tbWFuZFN1bW1hcnlUYWJsZSgpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6d3JpdGUtY29tbWFuZC10YWJsZS1hbmQtZmlsZS10YWJsZS10by1kaXNrJzogKCkgPT4gdGhpcy53cml0ZUNvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZVRvRGlzaygpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6c2V0LWdsb2JhbC12aW0tc3RhdGUnOiAoKSA9PiB0aGlzLnNldEdsb2JhbFZpbVN0YXRlKCksXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1kZWJ1Zy1vdXRwdXQnOiAoKSA9PiB0aGlzLmNsZWFyRGVidWdPdXRwdXQoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlbG9hZCc6ICgpID0+IHRoaXMucmVsb2FkKCksXG4gICAgICAndmltLW1vZGUtcGx1czpyZWxvYWQtd2l0aC1kZXBlbmRlbmNpZXMnOiAoKSA9PiB0aGlzLnJlbG9hZCh0cnVlKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlcG9ydC10b3RhbC1tYXJrZXItY291bnQnOiAoKSA9PiB0aGlzLnJlcG9ydFRvdGFsTWFya2VyQ291bnQoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlcG9ydC10b3RhbC1hbmQtcGVyLWVkaXRvci1tYXJrZXItY291bnQnOiAoKSA9PiB0aGlzLnJlcG9ydFRvdGFsTWFya2VyQ291bnQodHJ1ZSksXG4gICAgICAndmltLW1vZGUtcGx1czpyZXBvcnQtcmVxdWlyZS1jYWNoZSc6ICgpID0+IHRoaXMucmVwb3J0UmVxdWlyZUNhY2hlKHtleGNsdWRlTm9kTW9kdWxlczogdHJ1ZX0pLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVwb3J0LXJlcXVpcmUtY2FjaGUtYWxsJzogKCkgPT4gdGhpcy5yZXBvcnRSZXF1aXJlQ2FjaGUoe2V4Y2x1ZGVOb2RNb2R1bGVzOiBmYWxzZX0pXG4gICAgfSlcbiAgfVxuXG4gIHNldEdsb2JhbFZpbVN0YXRlICgpIHtcbiAgICBnbG9iYWwudmltU3RhdGUgPSBWaW1TdGF0ZS5nZXQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgIGNvbnNvbGUubG9nKCdzZXQgZ2xvYmFsLnZpbVN0YXRlIGZvciBkZWJ1ZycsIGdsb2JhbC52aW1TdGF0ZSlcbiAgfVxuXG4gIHJlcG9ydFJlcXVpcmVDYWNoZSAoe2ZvY3VzLCBleGNsdWRlTm9kTW9kdWxlc30pIHtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgY29uc3QgcGFja1BhdGggPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5wYXRoXG4gICAgY29uc3QgY2FjaGVkUGF0aHMgPSBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKVxuICAgICAgLmZpbHRlcihwID0+IHAuc3RhcnRzV2l0aChwYWNrUGF0aCArIHBhdGguc2VwKSlcbiAgICAgIC5tYXAocCA9PiBwLnJlcGxhY2UocGFja1BhdGgsICcnKSlcblxuICAgIGZvciAobGV0IGNhY2hlZFBhdGggb2YgY2FjaGVkUGF0aHMpIHtcbiAgICAgIGlmIChleGNsdWRlTm9kTW9kdWxlcyAmJiBjYWNoZWRQYXRoLnNlYXJjaCgvbm9kZV9tb2R1bGVzLykgPj0gMCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKGZvY3VzICYmIGNhY2hlZFBhdGguc2VhcmNoKG5ldyBSZWdFeHAoYCR7Zm9jdXN9YCkpID49IDApIHtcbiAgICAgICAgY2FjaGVkUGF0aCA9IGAqJHtjYWNoZWRQYXRofWBcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGNhY2hlZFBhdGgpXG4gICAgfVxuICB9XG5cbiAgcmVwb3J0VG90YWxNYXJrZXJDb3VudCAoc2hvd0VkaXRvcnNSZXBvcnQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtpbnNwZWN0fSA9IHJlcXVpcmUoJ3V0aWwnKVxuICAgIGNvbnN0IHtiYXNlbmFtZX0gPSByZXF1aXJlKCdwYXRoJylcbiAgICBjb25zdCB0b3RhbCA9IHtcbiAgICAgIG1hcms6IDAsXG4gICAgICBobHNlYXJjaDogMCxcbiAgICAgIG11dGF0aW9uOiAwLFxuICAgICAgb2NjdXJyZW5jZTogMCxcbiAgICAgIHBlcnNpc3RlbnRTZWw6IDBcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XG4gICAgICBjb25zdCB2aW1TdGF0ZSA9IFZpbVN0YXRlLmdldChlZGl0b3IpXG4gICAgICBjb25zdCBtYXJrID0gdmltU3RhdGUubWFyay5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBjb25zdCBobHNlYXJjaCA9IHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBjb25zdCBtdXRhdGlvbiA9IHZpbVN0YXRlLm11dGF0aW9uTWFuYWdlci5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBjb25zdCBvY2N1cnJlbmNlID0gdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgY29uc3QgcGVyc2lzdGVudFNlbCA9IHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24ubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgaWYgKHNob3dFZGl0b3JzUmVwb3J0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGJhc2VuYW1lKGVkaXRvci5nZXRQYXRoKCkpLCBpbnNwZWN0KHttYXJrLCBobHNlYXJjaCwgbXV0YXRpb24sIG9jY3VycmVuY2UsIHBlcnNpc3RlbnRTZWx9KSlcbiAgICAgIH1cblxuICAgICAgdG90YWwubWFyayArPSBtYXJrXG4gICAgICB0b3RhbC5obHNlYXJjaCArPSBobHNlYXJjaFxuICAgICAgdG90YWwubXV0YXRpb24gKz0gbXV0YXRpb25cbiAgICAgIHRvdGFsLm9jY3VycmVuY2UgKz0gb2NjdXJyZW5jZVxuICAgICAgdG90YWwucGVyc2lzdGVudFNlbCArPSBwZXJzaXN0ZW50U2VsXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCd0b3RhbCcsIGluc3BlY3QodG90YWwpKVxuICB9XG5cbiAgYXN5bmMgcmVsb2FkIChyZWxvYWREZXBlbmRlbmNpZXMpIHtcbiAgICBmdW5jdGlvbiBkZWxldGVSZXF1aXJlQ2FjaGVGb3JQYXRoUHJlZml4IChwcmVmaXgpIHtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpXG4gICAgICAgIC5maWx0ZXIocCA9PiBwLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgLmZvckVhY2gocCA9PiBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXSlcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlc05lZWRSZWxvYWQgPSBbJ3ZpbS1tb2RlLXBsdXMnXVxuICAgIGlmIChyZWxvYWREZXBlbmRlbmNpZXMpIHBhY2thZ2VzTmVlZFJlbG9hZC5wdXNoKC4uLnNldHRpbmdzLmdldCgnZGV2UmVsb2FkUGFja2FnZXMnKSlcblxuICAgIGNvbnN0IGxvYWRlZFBhY2thZ2VzID0gcGFja2FnZXNOZWVkUmVsb2FkLmZpbHRlcihwYWNrTmFtZSA9PiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZChwYWNrTmFtZSkpXG4gICAgY29uc29sZS5sb2coJ3JlbG9hZCcsIGxvYWRlZFBhY2thZ2VzKVxuXG4gICAgY29uc3QgcGF0aFNlcGFyYXRvciA9IHJlcXVpcmUoJ3BhdGgnKS5zZXBcblxuICAgIGZvciAoY29uc3QgcGFja05hbWUgb2YgbG9hZGVkUGFja2FnZXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKGAtIGRlYWN0aXZhdGluZyAke3BhY2tOYW1lfWApXG4gICAgICBjb25zdCBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShwYWNrTmFtZSkucGF0aFxuICAgICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrTmFtZSlcbiAgICAgIGF0b20ucGFja2FnZXMudW5sb2FkUGFja2FnZShwYWNrTmFtZSlcbiAgICAgIGRlbGV0ZVJlcXVpcmVDYWNoZUZvclBhdGhQcmVmaXgocGFja1BhdGggKyBwYXRoU2VwYXJhdG9yKVxuICAgIH1cbiAgICBjb25zb2xlLnRpbWUoJ2FjdGl2YXRlJylcblxuICAgIGxvYWRlZFBhY2thZ2VzLmZvckVhY2gocGFja05hbWUgPT4ge1xuICAgICAgY29uc29sZS5sb2coYCsgYWN0aXZhdGluZyAke3BhY2tOYW1lfWApXG4gICAgICBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFja05hbWUpXG4gICAgfSlcblxuICAgIGNvbnNvbGUudGltZUVuZCgnYWN0aXZhdGUnKVxuICB9XG5cbiAgY2xlYXJEZWJ1Z091dHB1dCAobmFtZSwgZm4pIHtcbiAgICBjb25zdCB7bm9ybWFsaXplfSA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxuICAgIGNvbnN0IGZpbGVQYXRoID0gbm9ybWFsaXplKHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXRGaWxlUGF0aCcpKVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgsIHtzZWFyY2hBbGxQYW5lczogdHJ1ZSwgYWN0aXZhdGVQYW5lOiBmYWxzZX0pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KCcnKVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgIH0pXG4gIH1cblxuICB0b2dnbGVEZWJ1ZyAoKSB7XG4gICAgc2V0dGluZ3Muc2V0KCdkZWJ1ZycsICFzZXR0aW5ncy5nZXQoJ2RlYnVnJykpXG4gICAgY29uc29sZS5sb2coYCR7c2V0dGluZ3Muc2NvcGV9IGRlYnVnOmAsIHNldHRpbmdzLmdldCgnZGVidWcnKSlcbiAgfVxuXG4gIGdldENvbW1hbmRTcGVjcyAoKSB7XG4gICAgY29uc3Qge2VzY2FwZVJlZ0V4cH0gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKVxuICAgIGNvbnN0IHtnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZH0gPSByZXF1aXJlKCcuL3V0aWxzJylcblxuICAgIGNvbnN0IHNwZWNzID0gW11cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgVk1QT3BlcmF0aW9uRmlsZXMpIHtcbiAgICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgT2JqZWN0LnZhbHVlcyhyZXF1aXJlKGZpbGUpKSkge1xuICAgICAgICBpZiAoIWtsYXNzLmlzQ29tbWFuZCgpKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IGNvbW1hbmROYW1lID0ga2xhc3MuZ2V0Q29tbWFuZE5hbWUoKVxuXG4gICAgICAgIGNvbnN0IGtleW1hcHMgPSBnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZChjb21tYW5kTmFtZSwge3BhY2thZ2VOYW1lOiAndmltLW1vZGUtcGx1cyd9KVxuICAgICAgICBjb25zdCBrZXltYXAgPSBrZXltYXBzXG4gICAgICAgICAgPyBrZXltYXBzXG4gICAgICAgICAgICAgIC5tYXAoayA9PiBgXFxgJHtjb21wYWN0U2VsZWN0b3Ioay5zZWxlY3Rvcil9XFxgIDxjb2RlPiR7Y29tcGFjdEtleXN0cm9rZXMoay5rZXlzdHJva2VzKX08L2NvZGU+YClcbiAgICAgICAgICAgICAgLmpvaW4oJzxici8+JylcbiAgICAgICAgICA6IHVuZGVmaW5lZFxuXG4gICAgICAgIHNwZWNzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGtsYXNzLm5hbWUsXG4gICAgICAgICAgY29tbWFuZE5hbWU6IGNvbW1hbmROYW1lLFxuICAgICAgICAgIGtpbmQ6IGtsYXNzLm9wZXJhdGlvbktpbmQsXG4gICAgICAgICAga2V5bWFwOiBrZXltYXBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3BlY3NcblxuICAgIGZ1bmN0aW9uIGNvbXBhY3RTZWxlY3RvciAoc2VsZWN0b3IpIHtcbiAgICAgIGNvbnN0IHNvdXJjZXMgPSBPYmplY3Qua2V5cyhTZWxlY3Rvck1hcCkubWFwKGVzY2FwZVJlZ0V4cClcbiAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgKCR7c291cmNlcy5qb2luKCd8Jyl9KWAsICdnJylcbiAgICAgIHJldHVybiBzZWxlY3RvclxuICAgICAgICAuc3BsaXQoLyxcXHMqL2cpXG4gICAgICAgIC5tYXAoc2NvcGUgPT4gc2NvcGUucmVwbGFjZSgvOm5vdFxcKCguKj8pXFwpL2csICchJDEnKS5yZXBsYWNlKHJlZ2V4LCBzID0+IFNlbGVjdG9yTWFwW3NdKSlcbiAgICAgICAgLmpvaW4oJywnKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXBhY3RLZXlzdHJva2VzIChrZXlzdHJva2VzKSB7XG4gICAgICBjb25zdCBzcGVjaWFsQ2hhcnMgPSAnXFxcXGAqX3t9W10oKSMrLS4hJ1xuXG4gICAgICBjb25zdCBtb2RpZmllcktleVJlZ2V4U291cmNlcyA9IE9iamVjdC5rZXlzKE1vZGlmaWVyS2V5TWFwKS5tYXAoZXNjYXBlUmVnRXhwKVxuICAgICAgY29uc3QgbW9kaWZpZXJLZXlSZWdleCA9IG5ldyBSZWdFeHAoYCgke21vZGlmaWVyS2V5UmVnZXhTb3VyY2VzLmpvaW4oJ3wnKX0pYClcbiAgICAgIGNvbnN0IHNwZWNpYWxDaGFyc1JlZ2V4U291cmNlcyA9IHNwZWNpYWxDaGFycy5zcGxpdCgnJykubWFwKGVzY2FwZVJlZ0V4cClcbiAgICAgIGNvbnN0IHNwZWNpYWxDaGFyc1JlZ2V4ID0gbmV3IFJlZ0V4cChgKCR7c3BlY2lhbENoYXJzUmVnZXhTb3VyY2VzLmpvaW4oJ3wnKX0pYCwgJ2cnKVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBrZXlzdHJva2VzXG4gICAgICAgICAgLy8gLnJlcGxhY2UoLyhgfF8pL2csICdcXFxcJDEnKVxuICAgICAgICAgIC5yZXBsYWNlKG1vZGlmaWVyS2V5UmVnZXgsIHMgPT4gTW9kaWZpZXJLZXlNYXBbc10pXG4gICAgICAgICAgLnJlcGxhY2Uoc3BlY2lhbENoYXJzUmVnZXgsICdcXFxcJDEnKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXHwvZywgJyYjMTI0OycpXG4gICAgICAgICAgLnJlcGxhY2UoL1xccysvLCAnJylcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBnZW5lcmF0ZVN1bW1hcnlUYWJsZUZvckNvbW1hbmRTcGVjcyAoc3BlY3MsIHtoZWFkZXJ9ID0ge30pIHtcbiAgICBjb25zdCBncm91cGVkID0ge31cbiAgICBmb3IgKGNvbnN0IHNwZWMgb2Ygc3BlY3MpIGdyb3VwZWRbc3BlYy5raW5kXSA9IHNwZWNcblxuICAgIGxldCByZXN1bHQgPSAnJ1xuICAgIGNvbnN0IE9QRVJBVElPTl9LSU5EUyA9IFsnb3BlcmF0b3InLCAnbW90aW9uJywgJ3RleHQtb2JqZWN0JywgJ21pc2MtY29tbWFuZCddXG5cbiAgICBmb3IgKGxldCBraW5kIG9mIE9QRVJBVElPTl9LSU5EUykge1xuICAgICAgY29uc3Qgc3BlY3MgPSBncm91cGVkW2tpbmRdXG4gICAgICBpZiAoIXNwZWNzKSBjb250aW51ZVxuXG4gICAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IHRhYmxlID0gW1xuICAgICAgICAnfCBLZXltYXAgfCBDb21tYW5kIHwgRGVzY3JpcHRpb24gfCcsXG4gICAgICAgICd8Oi0tLS0tLS18Oi0tLS0tLS0tfDotLS0tLS0tLS0tLS18J1xuICAgICAgXVxuXG4gICAgICBmb3IgKGxldCB7a2V5bWFwID0gJycsIGNvbW1hbmROYW1lLCBkZXNjcmlwdGlvbiA9ICcnfSBvZiBzcGVjcykge1xuICAgICAgICBjb21tYW5kTmFtZSA9IGNvbW1hbmROYW1lLnJlcGxhY2UoL3ZpbS1tb2RlLXBsdXM6LywgJycpXG4gICAgICAgIHRhYmxlLnB1c2goYHwgJHtrZXltYXB9IHwgXFxgJHtjb21tYW5kTmFtZX1cXGAgfCAke2Rlc2NyaXB0aW9ufSB8YClcbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSBgIyMgJHtraW5kfVxcblxcbmAgKyB0YWJsZS5qb2luKCdcXG4nKSArICdcXG5cXG4nXG4gICAgfVxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgIGlmIChoZWFkZXIpIGVkaXRvci5pbnNlcnRUZXh0KGhlYWRlciArICdcXG5cXG4nKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQocmVzdWx0KVxuICAgIH0pXG4gIH1cblxuICBnZW5lcmF0ZUNvbW1hbmRTdW1tYXJ5VGFibGUgKCkge1xuICAgIGNvbnN0IHtyZW1vdmVJbmRlbnR9ID0gcmVxdWlyZSgnLi91dGlscycpXG4gICAgY29uc3QgaGVhZGVyID0gcmVtb3ZlSW5kZW50KGBcbiAgICAgICMjIEtleW1hcCBzZWxlY3RvciBhYmJyZXZpYXRpb25zXG5cbiAgICAgIEluIHRoaXMgZG9jdW1lbnQsIGZvbGxvd2luZyBhYmJyZXZpYXRpb25zIGFyZSB1c2VkIGZvciBzaG9ydG5lc3MuXG5cbiAgICAgIHwgQWJicmV2IHwgU2VsZWN0b3IgICAgICAgICAgICAgICAgICAgICB8IERlc2NyaXB0aW9uICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHw6LS0tLS0tLXw6LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18Oi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAgICAgIHwgXFxgIWlcXGAgICB8IFxcYDpub3QoLmluc2VydC1tb2RlKVxcYCAgICAgICAgIHwgZXhjZXB0IGluc2VydC1tb2RlICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGBpXFxgICAgIHwgXFxgLmluc2VydC1tb2RlXFxgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYG9cXGAgICAgfCBcXGAub3BlcmF0b3ItcGVuZGluZy1tb2RlXFxgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgblxcYCAgICB8IFxcYC5ub3JtYWwtbW9kZVxcYCAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGB2XFxgICAgIHwgXFxgLnZpc3VhbC1tb2RlXFxgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYHZCXFxgICAgfCBcXGAudmlzdWFsLW1vZGUuYmxvY2t3aXNlXFxgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgdkxcXGAgICB8IFxcYC52aXN1YWwtbW9kZS5saW5ld2lzZVxcYCAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGB2Q1xcYCAgIHwgXFxgLnZpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2VcXGAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYGlSXFxgICAgfCBcXGAuaW5zZXJ0LW1vZGUucmVwbGFjZVxcYCAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgI1xcYCAgICB8IFxcYC53aXRoLWNvdW50XFxgICAgICAgICAgICAgICAgIHwgd2hlbiBjb3VudCBpcyBzcGVjaWZpZWQgICAgICAgICAgICAgfFxuICAgICAgfCBcXGAlXFxgICAgIHwgXFxgLmhhcy1wZXJzaXN0ZW50LXNlbGVjdGlvblxcYCAgfCB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGV4aXN0cyB8XG4gICAgICBgKVxuXG4gICAgdGhpcy5nZW5lcmF0ZVN1bW1hcnlUYWJsZUZvckNvbW1hbmRTcGVjcyh0aGlzLmdldENvbW1hbmRTcGVjcygpLCB7aGVhZGVyfSlcbiAgfVxuXG4gIG9wZW5JblZpbSAoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3Qge3JvdywgY29sdW1ufSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgLy8gZS5nLiAvQXBwbGljYXRpb25zL01hY1ZpbS5hcHAvQ29udGVudHMvTWFjT1MvVmltIC1nIC9ldGMvaG9zdHMgXCIrY2FsbCBjdXJzb3IoNCwgMylcIlxuICAgIHJldHVybiBuZXcgQnVmZmVyZWRQcm9jZXNzKHtcbiAgICAgIGNvbW1hbmQ6ICcvQXBwbGljYXRpb25zL01hY1ZpbS5hcHAvQ29udGVudHMvTWFjT1MvVmltJyxcbiAgICAgIGFyZ3M6IFsnLWcnLCBlZGl0b3IuZ2V0UGF0aCgpLCBgK2NhbGwgY3Vyc29yKCR7cm93ICsgMX0sICR7Y29sdW1uICsgMX0pYF1cbiAgICB9KVxuICB9XG5cbiAgYnVpbGRDb21tYW5kVGFibGVBbmRGaWxlVGFibGUgKCkge1xuICAgIGNvbnN0IGZpbGVUYWJsZSA9IHt9XG4gICAgY29uc3QgY29tbWFuZFRhYmxlID0gW11cbiAgICBjb25zdCBzZWVuID0ge30gLy8gSnVzdCB0byBkZXRlY3QgZHVwbGljYXRlIG5hbWVcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBWTVBPcGVyYXRpb25GaWxlcykge1xuICAgICAgZmlsZVRhYmxlW2ZpbGVdID0gW11cblxuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBPYmplY3QudmFsdWVzKHJlcXVpcmUoZmlsZSkpKSB7XG4gICAgICAgIGlmIChzZWVuW2tsYXNzLm5hbWVdKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgY2xhc3MgJHtrbGFzcy5uYW1lfSBpbiBcIiR7ZmlsZX1cIiBhbmQgXCIke3NlZW5ba2xhc3MubmFtZV19XCJgKVxuICAgICAgICB9XG4gICAgICAgIHNlZW5ba2xhc3MubmFtZV0gPSBmaWxlXG4gICAgICAgIGZpbGVUYWJsZVtmaWxlXS5wdXNoKGtsYXNzLm5hbWUpXG4gICAgICAgIGlmIChrbGFzcy5pc0NvbW1hbmQoKSkgY29tbWFuZFRhYmxlLnB1c2goa2xhc3MuZ2V0Q29tbWFuZE5hbWUoKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtjb21tYW5kVGFibGUsIGZpbGVUYWJsZX1cbiAgfVxuXG4gIC8vICMgSG93IHZtcCBjb21tYW5kcyBiZWNvbWUgYXZhaWxhYmxlP1xuICAvLyAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBWbXAgaGF2ZSBtYW55IGNvbW1hbmRzLCBsb2FkaW5nIGZ1bGwgY29tbWFuZHMgYXQgc3RhcnR1cCBzbG93IGRvd24gcGtnIGFjdGl2YXRpb24uXG4gIC8vIFNvIHZtcCBsb2FkIHN1bW1hcnkgY29tbWFuZCB0YWJsZSBhdCBzdGFydHVwIHRoZW4gbGF6eSByZXF1aXJlIGNvbW1hbmQgYm9keSBvbi11c2UgdGltaW5nLlxuICAvLyBIZXJlIGlzIGhvdyB2bXAgY29tbWFuZHMgYXJlIHJlZ2lzdGVyZCBhbmQgaW52b2tlZC5cbiAgLy8gSW5pdGlhbGx5IGludHJvZHVjZWQgaW4gUFIgIzc1OFxuICAvL1xuICAvLyAxLiBbT24gZGV2XTogUHJlcGFyYXRpb24gZG9uZSBieSBkZXZlbG9wZXJcbiAgLy8gICAtIEludm9raW5nIGBWaW0gTW9kZSBQbHVzOldyaXRlIENvbW1hbmQgVGFibGUgQW5kIEZpbGUgVGFibGUgVG8gRGlza2AuIGl0IGRvZXMgZm9sbG93aW5nLlxuICAvLyAgIC0gXCIuL2pzb24vY29tbWFuZC10YWJsZS5qc29uXCIgYW5kIFwiLi9qc29uL2ZpbGUtdGFibGUuanNvblwiLiBhcmUgdXBkYXRlZC5cbiAgLy9cbiAgLy8gMi4gW09uIGF0b20vdm1wIHN0YXJ0dXBdXG4gIC8vICAgLSBSZWdpc3RlciBjb21tYW5kcyhlLmcuIGBtb3ZlLWRvd25gKSBmcm9tIFwiLi9qc29uL2NvbW1hbmQtdGFibGUuanNvblwiLlxuICAvL1xuICAvLyAzLiBbT24gcnVuIHRpbWVdOiBlLmcuIEludm9rZSBgbW92ZS1kb3duYCBieSBgamAga2V5c3Ryb2tlXG4gIC8vICAgLSBGaXJlIGBtb3ZlLWRvd25gIGNvbW1hbmQuXG4gIC8vICAgLSBJdCBleGVjdXRlIGB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlRG93blwiKWBcbiAgLy8gICAtIERldGVybWluZSBmaWxlcyB0byByZXF1aXJlIGZyb20gXCIuL2pzb24vZmlsZS10YWJsZS5qc29uXCIuXG4gIC8vICAgLSBMb2FkIGBNb3ZlRG93bmAgY2xhc3MgYnkgcmVxdWlyZSgnLi9tb3Rpb25zJykgYW5kIHJ1biBpdCFcbiAgLy9cbiAgYXN5bmMgd3JpdGVDb21tYW5kVGFibGVBbmRGaWxlVGFibGVUb0Rpc2sgKCkge1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG4gICAgY29uc3Qge2NvbW1hbmRUYWJsZSwgZmlsZVRhYmxlfSA9IHRoaXMuYnVpbGRDb21tYW5kVGFibGVBbmRGaWxlVGFibGUoKVxuXG4gICAgY29uc3QgZ2V0U3RhdGVGb3IgPSAoYmFzZU5hbWUsIG9iamVjdCwgcHJldHR5KSA9PiB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdqc29uJywgYmFzZU5hbWUpICsgKHByZXR0eSA/ICctcHJldHR5Lmpzb24nIDogJy5qc29uJylcbiAgICAgIGNvbnN0IGpzb25TdHJpbmcgPSBwcmV0dHkgPyBKU09OLnN0cmluZ2lmeShvYmplY3QsIG51bGwsICcgICcpIDogSlNPTi5zdHJpbmdpZnkob2JqZWN0KVxuICAgICAgY29uc3QgbmVlZFVwZGF0ZSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKS50cmltUmlnaHQoKSAhPT0ganNvblN0cmluZ1xuICAgICAgcmV0dXJuIHtmaWxlUGF0aCwganNvblN0cmluZywgbmVlZFVwZGF0ZX1cbiAgICB9XG5cbiAgICBjb25zdCBzdGF0ZXNOZWVkVXBkYXRlID0gW1xuICAgICAgZ2V0U3RhdGVGb3IoJ2NvbW1hbmQtdGFibGUnLCBjb21tYW5kVGFibGUsIGZhbHNlKSxcbiAgICAgIGdldFN0YXRlRm9yKCdjb21tYW5kLXRhYmxlJywgY29tbWFuZFRhYmxlLCB0cnVlKSxcbiAgICAgIGdldFN0YXRlRm9yKCdmaWxlLXRhYmxlJywgZmlsZVRhYmxlLCBmYWxzZSksXG4gICAgICBnZXRTdGF0ZUZvcignZmlsZS10YWJsZScsIGZpbGVUYWJsZSwgdHJ1ZSlcbiAgICBdLmZpbHRlcihzdGF0ZSA9PiBzdGF0ZS5uZWVkVXBkYXRlKVxuXG4gICAgaWYgKCFzdGF0ZXNOZWVkVXBkYXRlLmxlbmd0aCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ05vIGNoYW5nZmVzIGluIGNvbW1hbmRUYWJsZSBhbmQgZmlsZVRhYmxlJywge2Rpc21pc3NhYmxlOiB0cnVlfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGZvciAoY29uc3Qge2pzb25TdHJpbmcsIGZpbGVQYXRofSBvZiBzdGF0ZXNOZWVkVXBkYXRlKSB7XG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoLCB7YWN0aXZhdGVQYW5lOiBmYWxzZSwgYWN0aXZhdGVJdGVtOiBmYWxzZX0pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQoanNvblN0cmluZylcbiAgICAgICAgcmV0dXJuIGVkaXRvci5zYXZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYFVwZGF0ZWQgJHtwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKX1gLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGV2ZWxvcGVyKClcbiJdfQ==