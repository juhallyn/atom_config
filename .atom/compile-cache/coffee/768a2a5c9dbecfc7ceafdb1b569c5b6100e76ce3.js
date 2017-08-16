(function() {
  var CompositeDisposable, Header42, fs, moment, path, ref, sprintf, util;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  path = require('path');

  util = require('util');

  sprintf = require('sprintf-js').sprintf;

  moment = require('moment');

  String.prototype.rstrip = function() {
    return this.replace(/\s+$/g, "");
  };

  module.exports = Header42 = {
    config: {
      login: {
        type: 'string',
        "default": (ref = process.env.USER) != null ? ref : "anonymous",
        description: 'Change the default login used in the header.'
      }
    },
    subscriptions: null,
    notifManager: null,
    insertTemplateStr: null,
    dateTimeFormat: "YYYY/MM/DD HH:mm:ss",
    mail: "%s@student.42.fr",
    byName: "%s \<%s\>",
    timestampBy: "%s by %s",
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('header-42.login', (function(_this) {
        return function(login) {
          return _this.login = login;
        };
      })(this)));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return editor.getBuffer().onWillSave(function() {
            return _this.update(editor);
          });
        };
      })(this));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'header-42:insert': (function(_this) {
          return function() {
            return _this.insert();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getHeaderType: function(basename) {
      var file, headers, i, len, ref1, regex, regexPattern;
      headers = [['^(Makefile)$', 'Makefile.header'], ['^.*\.(sh)$', 'Makefile.header'], ['^.*\.(html|ejs)$', 'Html.header'], ['^.*\.(c|cpp|h|hpp|js|css|cs|scala|rs|go|swift)$', 'C.header'], ['^.*\.(php)$', 'Php.header'], ['^.*\.(lua)$', 'Lua.header'], ['^.*\.(ml|mli)$', 'OCaml.header'], ['^.*\.(hs)$', 'Haskell.header'], ['^.*\.(s|s64|asm|hs|h64|inc)$', 'ASM.header']];
      for (i = 0, len = headers.length; i < len; i++) {
        ref1 = headers[i], regex = ref1[0], file = ref1[1];
        regexPattern = RegExp(regex);
        if (basename.match(regexPattern)) {
          return path.join(__dirname, "headers", file);
        }
      }
      return null;
    },
    getHeaderText: function(editor) {
      var basename, filename;
      basename = path.basename(editor.getPath());
      filename = this.getHeaderType(basename);
      if (filename !== null) {
        return fs.readFileSync(filename, {
          encoding: "utf8"
        });
      }
      return null;
    },
    getHeader: function(editor, createInfo) {
      var byName, created, dirty_header, filename, login, updated;
      if (createInfo == null) {
        createInfo = null;
      }
      dirty_header = this.getHeaderText(editor);
      filename = path.basename(editor.getPath());
      if (createInfo === null) {
        login = this.login;
        created = sprintf(this.timestampBy, moment().format(this.dateTimeFormat), login);
      } else {
        login = createInfo[1];
        created = sprintf(this.timestampBy, createInfo[0], login);
      }
      byName = sprintf(this.byName, login, sprintf(this.mail, login));
      updated = sprintf(this.timestampBy, moment().format(this.dateTimeFormat), this.login);
      return sprintf(dirty_header, filename, byName, created, updated);
    },
    hasHeader: function(buffer) {
      var byPat, createdPat, matches, updatedPat;
      byPat = /By: .{1,8} <.{1,8}@student\.42\.fr>/;
      updatedPat = /Updated: \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} by .{1,8}/;
      createdPat = /Created: (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) by (.{1,8})/;
      if (buffer.match(byPat && buffer.match(updatedPat))) {
        if (matches = buffer.match(createdPat)) {
          return [matches[1].rstrip(), matches[2].rstrip()];
        }
      }
      return null;
    },
    update: function(editor) {
      var buffer, header, header_lines, matches;
      if (matches = this.hasHeader(editor.getBuffer().getText())) {
        buffer = editor.getBuffer();
        header = this.getHeader(editor, matches);
        header_lines = header.split(/\r\n|\r|\n/).length;
        if (header !== null) {
          return buffer.setTextInRange([[0, 0], [header_lines - 1, 0]], header, {
            normalizeLineEndings: true
          });
        }
      }
    },
    insert: function(event) {
      var buffer, editor, header;
      editor = atom.workspace.getActiveTextEditor();
      header = this.getHeader(editor);
      buffer = editor.getBuffer();
      if (this.hasHeader(buffer.getText()) === null) {
        if (header !== null) {
          return buffer.insert([0, 0], header, {
            normalizeLineEndings: true
          });
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2hlYWRlci00Mi9saWIvaGVhZGVyLTQyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVIsQ0FBcUIsQ0FBQzs7RUFDaEMsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVULE1BQU0sQ0FBQSxTQUFFLENBQUEsTUFBUixHQUFpQixTQUFBO1dBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFULEVBQWtCLEVBQWxCO0VBQUg7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDZjtJQUFBLE1BQUEsRUFDRTtNQUFBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsMkNBQTZCLFdBRDdCO1FBRUEsV0FBQSxFQUFhLDhDQUZiO09BREY7S0FERjtJQU1BLGFBQUEsRUFBZSxJQU5mO0lBT0EsWUFBQSxFQUFjLElBUGQ7SUFRQSxpQkFBQSxFQUFtQixJQVJuQjtJQVVBLGNBQUEsRUFBZ0IscUJBVmhCO0lBV0EsSUFBQSxFQUFNLGtCQVhOO0lBWUEsTUFBQSxFQUFRLFdBWlI7SUFhQSxXQUFBLEVBQWEsVUFiYjtJQWVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFJUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BRXJCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUJBQXBCLEVBQXVDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxL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QUFHLE1BQUEsS0FBVSxJQUFiO2lCQUNFLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxZQUFBLEdBQWUsQ0FBaEIsRUFBbUIsQ0FBbkIsQ0FBVCxDQUF0QixFQUF1RCxNQUF2RCxFQUNFO1lBQUEsb0JBQUEsRUFBc0IsSUFBdEI7V0FERixFQURGO1NBSkY7O0lBRE0sQ0F0RlI7SUErRkEsTUFBQSxFQUFRLFNBQUMsS0FBRDtBQUNOLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWDtNQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFBO01BRVQsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBWCxDQUFBLEtBQWdDLElBQW5DO1FBQ0UsSUFBRyxNQUFBLEtBQVUsSUFBYjtpQkFDRSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZCxFQUFzQixNQUF0QixFQUE4QjtZQUFBLG9CQUFBLEVBQXNCLElBQXRCO1dBQTlCLEVBREY7U0FERjs7SUFMTSxDQS9GUjs7QUFWRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG51dGlsID0gcmVxdWlyZSAndXRpbCdcbnNwcmludGYgPSByZXF1aXJlKCdzcHJpbnRmLWpzJykuc3ByaW50ZlxubW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuXG5TdHJpbmc6OnJzdHJpcCA9IC0+IEByZXBsYWNlIC9cXHMrJC9nLCBcIlwiXG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyNDIgPVxuICBjb25maWc6XG4gICAgbG9naW46XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogKHByb2Nlc3MuZW52LlVTRVIgPyBcImFub255bW91c1wiKVxuICAgICAgZGVzY3JpcHRpb246ICdDaGFuZ2UgdGhlIGRlZmF1bHQgbG9naW4gdXNlZCBpbiB0aGUgaGVhZGVyLidcblxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIG5vdGlmTWFuYWdlcjogbnVsbFxuICBpbnNlcnRUZW1wbGF0ZVN0cjogbnVsbFxuXG4gIGRhdGVUaW1lRm9ybWF0OiBcIllZWVkvTU0vREQgSEg6bW06c3NcIlxuICBtYWlsOiBcIiVzQHN0dWRlbnQuNDIuZnJcIlxuICBieU5hbWU6IFwiJXMgXFw8JXNcXD5cIlxuICB0aW1lc3RhbXBCeTogXCIlcyBieSAlc1wiXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cblxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXBcbiAgICAjIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2hlYWRlci00Mi5sb2dpbicsIChsb2dpbikgPT5cbiAgICAgIEBsb2dpbiA9IGxvZ2luXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5vbldpbGxTYXZlID0+IEB1cGRhdGUoZWRpdG9yKVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdoZWFkZXItNDI6aW5zZXJ0JzogPT4gQGluc2VydCgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAjIFRPRE86IHVzZSBhdG9tIGZpbGUgdHlwZSBhbmQgbm90IGZpbGUgZXh0ZW5zaW9uXG4gIGdldEhlYWRlclR5cGU6IChiYXNlbmFtZSkgLT5cbiAgICBoZWFkZXJzID0gW1xuICAgICAgICBbJ14oTWFrZWZpbGUpJCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ01ha2VmaWxlLmhlYWRlciddLFxuICAgICAgICBbJ14uKlxcLihzaCkkJyxcdFx0XHRcdFx0XHRcdFx0XHRcdCdNYWtlZmlsZS5oZWFkZXInXSxcbiAgICAgICAgWydeLipcXC4oaHRtbHxlanMpJCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHQnSHRtbC5oZWFkZXInXSxcbiAgICAgICAgWydeLipcXC4oY3xjcHB8aHxocHB8anN8Y3NzfGNzfHNjYWxhfHJzfGdvfHN3aWZ0KSQnLCAnQy5oZWFkZXInXSxcbiAgICAgICAgWydeLipcXC4ocGhwKSQnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUGhwLmhlYWRlciddLFxuICAgICAgICBbJ14uKlxcLihsdWEpJCcsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdMdWEuaGVhZGVyJ10sXG4gICAgICAgIFsnXi4qXFwuKG1sfG1saSkkJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ09DYW1sLmhlYWRlciddLFxuICAgICAgICBbJ14uKlxcLihocykkJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdIYXNrZWxsLmhlYWRlciddLFxuICAgICAgICBbJ14uKlxcLihzfHM2NHxhc218aHN8aDY0fGluYykkJywgICAgICAgICAgICAgICAgICAgICdBU00uaGVhZGVyJ11cbiAgICBdXG5cbiAgICBmb3IgW3JlZ2V4LCBmaWxlXSBpbiBoZWFkZXJzXG4gICAgICByZWdleFBhdHRlcm4gPSBSZWdFeHAocmVnZXgpXG4gICAgICBpZiAoYmFzZW5hbWUubWF0Y2gocmVnZXhQYXR0ZXJuKSlcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihfX2Rpcm5hbWUsIFwiaGVhZGVyc1wiLCBmaWxlKVxuICAgIG51bGxcblxuICBnZXRIZWFkZXJUZXh0OiAoZWRpdG9yKSAtPlxuICAgIGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShlZGl0b3IuZ2V0UGF0aCgpKVxuICAgIGZpbGVuYW1lID0gQGdldEhlYWRlclR5cGUoYmFzZW5hbWUpXG5cbiAgICBpZiBmaWxlbmFtZSAhPSBudWxsXG4gICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCBlbmNvZGluZzogXCJ1dGY4XCIpXG4gICAgbnVsbFxuXG4gIGdldEhlYWRlcjogKGVkaXRvciwgY3JlYXRlSW5mbyA9IG51bGwpIC0+XG4gICAgZGlydHlfaGVhZGVyID0gQGdldEhlYWRlclRleHQoZWRpdG9yKVxuICAgIGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShlZGl0b3IuZ2V0UGF0aCgpKVxuICAgIGlmIGNyZWF0ZUluZm8gPT0gbnVsbFxuICAgICAgbG9naW4gPSBAbG9naW5cbiAgICAgIGNyZWF0ZWQgPSBzcHJpbnRmKEB0aW1lc3RhbXBCeSwgbW9tZW50KCkuZm9ybWF0KEBkYXRlVGltZUZvcm1hdCksIGxvZ2luKVxuICAgIGVsc2VcbiAgICAgIGxvZ2luID0gY3JlYXRlSW5mb1sxXVxuICAgICAgY3JlYXRlZCA9IHNwcmludGYoQHRpbWVzdGFtcEJ5LCBjcmVhdGVJbmZvWzBdLCBsb2dpbilcbiAgICBieU5hbWUgPSBzcHJpbnRmKEBieU5hbWUsIGxvZ2luLCBzcHJpbnRmKEBtYWlsLCBsb2dpbikpXG4gICAgdXBkYXRlZCA9IHNwcmludGYoQHRpbWVzdGFtcEJ5LCBtb21lbnQoKS5mb3JtYXQoQGRhdGVUaW1lRm9ybWF0KSwgQGxvZ2luKVxuXG4gICAgc3ByaW50ZihkaXJ0eV9oZWFkZXIsIGZpbGVuYW1lLCBieU5hbWUsIGNyZWF0ZWQsIHVwZGF0ZWQpXG5cbiAgaGFzSGVhZGVyOiAoYnVmZmVyKSAtPlxuICAgIGJ5UGF0ID0gL0J5OiAuezEsOH0gPC57MSw4fUBzdHVkZW50XFwuNDJcXC5mcj4vXG4gICAgdXBkYXRlZFBhdCA9IC9VcGRhdGVkOiBcXGR7NH1cXC9cXGR7Mn1cXC9cXGR7Mn0gXFxkezJ9OlxcZHsyfTpcXGR7Mn0gYnkgLnsxLDh9L1xuICAgIGNyZWF0ZWRQYXQgPSAvQ3JlYXRlZDogKFxcZHs0fVxcL1xcZHsyfVxcL1xcZHsyfSBcXGR7Mn06XFxkezJ9OlxcZHsyfSkgYnkgKC57MSw4fSkvXG5cbiAgICBpZiBidWZmZXIubWF0Y2ggYnlQYXQgJiYgYnVmZmVyLm1hdGNoIHVwZGF0ZWRQYXRcbiAgICAgIGlmIG1hdGNoZXMgPSBidWZmZXIubWF0Y2ggY3JlYXRlZFBhdFxuICAgICAgICByZXR1cm4gW21hdGNoZXNbMV0ucnN0cmlwKCksIG1hdGNoZXNbMl0ucnN0cmlwKCldXG4gICAgcmV0dXJuIChudWxsKVxuXG4gIHVwZGF0ZTogKGVkaXRvcikgLT5cbiAgICBpZiBtYXRjaGVzID0gQGhhc0hlYWRlcihlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0VGV4dCgpKVxuICAgICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICBoZWFkZXIgPSBAZ2V0SGVhZGVyKGVkaXRvciwgbWF0Y2hlcylcbiAgICAgIGhlYWRlcl9saW5lcyA9IGhlYWRlci5zcGxpdCgvXFxyXFxufFxccnxcXG4vKS5sZW5ndGhcbiAgICAgIGlmIGhlYWRlciAhPSBudWxsXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbWzAsIDBdLCBbaGVhZGVyX2xpbmVzIC0gMSwgMF1dLCBoZWFkZXIsXG4gICAgICAgICAgbm9ybWFsaXplTGluZUVuZGluZ3M6IHRydWUpXG5cbiAgaW5zZXJ0OiAoZXZlbnQpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaGVhZGVyID0gQGdldEhlYWRlcihlZGl0b3IpXG4gICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG5cbiAgICBpZiBAaGFzSGVhZGVyKGJ1ZmZlci5nZXRUZXh0KCkpID09IG51bGxcbiAgICAgIGlmIGhlYWRlciAhPSBudWxsXG4gICAgICAgIGJ1ZmZlci5pbnNlcnQoWzAsIDBdLCBoZWFkZXIsIG5vcm1hbGl6ZUxpbmVFbmRpbmdzOiB0cnVlKVxuIl19
