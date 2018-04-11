(function() {
  var Command, CommandError, CompositeDisposable, Disposable, Emitter, ExState, ref;

  ref = require('event-kit'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Command = require('./command');

  CommandError = require('./command-error');

  ExState = (function() {
    function ExState(editorElement, globalExState) {
      this.editorElement = editorElement;
      this.globalExState = globalExState;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.registerOperationCommands({
        open: (function(_this) {
          return function(e) {
            return new Command(_this.editor, _this);
          };
        })(this)
      });
    }

    ExState.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ExState.prototype.getExHistoryItem = function(index) {
      return this.globalExState.commandHistory[index];
    };

    ExState.prototype.pushExHistory = function(command) {
      return this.globalExState.commandHistory.unshift(command);
    };

    ExState.prototype.registerOperationCommands = function(commands) {
      var commandName, fn, results;
      results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        results.push((function(_this) {
          return function(fn) {
            var pushFn;
            pushFn = function(e) {
              return _this.pushOperations(fn(e));
            };
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "ex-mode:" + commandName, pushFn));
          };
        })(this)(fn));
      }
      return results;
    };

    ExState.prototype.onDidFailToExecute = function(fn) {
      return this.emitter.on('failed-to-execute', fn);
    };

    ExState.prototype.onDidProcessOpStack = function(fn) {
      return this.emitter.on('processed-op-stack', fn);
    };

    ExState.prototype.pushOperations = function(operations) {
      this.opStack.push(operations);
      if (this.opStack.length === 2) {
        return this.processOpStack();
      }
    };

    ExState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    ExState.prototype.processOpStack = function() {
      var command, e, input, ref1;
      ref1 = this.opStack, command = ref1[0], input = ref1[1];
      if (input.characters.length > 0) {
        this.history.unshift(command);
        try {
          command.execute(input);
        } catch (error) {
          e = error;
          if (e instanceof CommandError) {
            atom.notifications.addError("Command error: " + e.message);
            this.emitter.emit('failed-to-execute');
          } else {
            throw e;
          }
        }
      }
      this.clearOpStack();
      return this.emitter.emit('processed-op-stack');
    };

    ExState.prototype.getSelections = function() {
      var filtered, id, ref1, selection;
      filtered = {};
      ref1 = this.editor.getSelections();
      for (id in ref1) {
        selection = ref1[id];
        if (!selection.isEmpty()) {
          filtered[id] = selection;
        }
      }
      return filtered;
    };

    return ExState;

  })();

  module.exports = ExState;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2V4LXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLFdBQVIsQ0FBN0MsRUFBQyxxQkFBRCxFQUFVLDJCQUFWLEVBQXNCOztFQUV0QixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1YsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFFVDtJQUNTLGlCQUFDLGFBQUQsRUFBaUIsYUFBakI7TUFBQyxJQUFDLENBQUEsZ0JBQUQ7TUFBZ0IsSUFBQyxDQUFBLGdCQUFEO01BQzVCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQTtNQUNWLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXO01BRVgsSUFBQyxDQUFBLHlCQUFELENBQ0U7UUFBQSxJQUFBLEVBQU0sQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEO21CQUFXLElBQUEsT0FBQSxDQUFRLEtBQUMsQ0FBQSxNQUFULEVBQWlCLEtBQWpCO1VBQVg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQU47T0FERjtJQVBXOztzQkFVYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRE87O3NCQUdULGdCQUFBLEdBQWtCLFNBQUMsS0FBRDthQUNoQixJQUFDLENBQUEsYUFBYSxDQUFDLGNBQWUsQ0FBQSxLQUFBO0lBRGQ7O3NCQUdsQixhQUFBLEdBQWUsU0FBQyxPQUFEO2FBQ2IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBOUIsQ0FBc0MsT0FBdEM7SUFEYTs7c0JBR2YseUJBQUEsR0FBMkIsU0FBQyxRQUFEO0FBQ3pCLFVBQUE7QUFBQTtXQUFBLHVCQUFBOztxQkFDSyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEVBQUQ7QUFDRCxnQkFBQTtZQUFBLE1BQUEsR0FBUyxTQUFDLENBQUQ7cUJBQU8sS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsRUFBQSxDQUFHLENBQUgsQ0FBaEI7WUFBUDttQkFDVCxLQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FDRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsS0FBQyxDQUFBLGFBQW5CLEVBQWtDLFVBQUEsR0FBVyxXQUE3QyxFQUE0RCxNQUE1RCxDQURGO1VBRkM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUgsQ0FBSSxFQUFKO0FBREY7O0lBRHlCOztzQkFRM0Isa0JBQUEsR0FBb0IsU0FBQyxFQUFEO2FBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG1CQUFaLEVBQWlDLEVBQWpDO0lBRGtCOztzQkFHcEIsbUJBQUEsR0FBcUIsU0FBQyxFQUFEO2FBQ25CLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG9CQUFaLEVBQWtDLEVBQWxDO0lBRG1COztzQkFHckIsY0FBQSxHQUFnQixTQUFDLFVBQUQ7TUFDZCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxVQUFkO01BRUEsSUFBcUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEtBQW1CLENBQXhDO2VBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQUFBOztJQUhjOztzQkFLaEIsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsT0FBRCxHQUFXO0lBREM7O3NCQUdkLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxPQUFtQixJQUFDLENBQUEsT0FBcEIsRUFBQyxpQkFBRCxFQUFVO01BQ1YsSUFBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWpCLEdBQTBCLENBQTdCO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLE9BQWpCO0FBQ0E7VUFDRSxPQUFPLENBQUMsT0FBUixDQUFnQixLQUFoQixFQURGO1NBQUEsYUFBQTtVQUVNO1VBQ0osSUFBSSxDQUFBLFlBQWEsWUFBakI7WUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLGlCQUFBLEdBQWtCLENBQUMsQ0FBQyxPQUFoRDtZQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG1CQUFkLEVBRkY7V0FBQSxNQUFBO0FBSUUsa0JBQU0sRUFKUjtXQUhGO1NBRkY7O01BVUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLG9CQUFkO0lBYmM7O3NCQWdCaEIsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO01BQUEsUUFBQSxHQUFXO0FBQ1g7QUFBQSxXQUFBLFVBQUE7O1FBQ0UsSUFBQSxDQUFPLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBUDtVQUNFLFFBQVMsQ0FBQSxFQUFBLENBQVQsR0FBZSxVQURqQjs7QUFERjtBQUlBLGFBQU87SUFOTTs7Ozs7O0VBUWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdkVqQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcblxuQ29tbWFuZCA9IHJlcXVpcmUgJy4vY29tbWFuZCdcbkNvbW1hbmRFcnJvciA9IHJlcXVpcmUgJy4vY29tbWFuZC1lcnJvcidcblxuY2xhc3MgRXhTdGF0ZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsRXhTdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgQG9wU3RhY2sgPSBbXVxuICAgIEBoaXN0b3J5ID0gW11cblxuICAgIEByZWdpc3Rlck9wZXJhdGlvbkNvbW1hbmRzXG4gICAgICBvcGVuOiAoZSkgPT4gbmV3IENvbW1hbmQoQGVkaXRvciwgQClcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGdldEV4SGlzdG9yeUl0ZW06IChpbmRleCkgLT5cbiAgICBAZ2xvYmFsRXhTdGF0ZS5jb21tYW5kSGlzdG9yeVtpbmRleF1cblxuICBwdXNoRXhIaXN0b3J5OiAoY29tbWFuZCkgLT5cbiAgICBAZ2xvYmFsRXhTdGF0ZS5jb21tYW5kSGlzdG9yeS51bnNoaWZ0IGNvbW1hbmRcblxuICByZWdpc3Rlck9wZXJhdGlvbkNvbW1hbmRzOiAoY29tbWFuZHMpIC0+XG4gICAgZm9yIGNvbW1hbmROYW1lLCBmbiBvZiBjb21tYW5kc1xuICAgICAgZG8gKGZuKSA9PlxuICAgICAgICBwdXNoRm4gPSAoZSkgPT4gQHB1c2hPcGVyYXRpb25zKGZuKGUpKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsIFwiZXgtbW9kZToje2NvbW1hbmROYW1lfVwiLCBwdXNoRm4pXG4gICAgICAgIClcblxuICBvbkRpZEZhaWxUb0V4ZWN1dGU6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZmFpbGVkLXRvLWV4ZWN1dGUnLCBmbilcblxuICBvbkRpZFByb2Nlc3NPcFN0YWNrOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24oJ3Byb2Nlc3NlZC1vcC1zdGFjaycsIGZuKVxuXG4gIHB1c2hPcGVyYXRpb25zOiAob3BlcmF0aW9ucykgLT5cbiAgICBAb3BTdGFjay5wdXNoIG9wZXJhdGlvbnNcblxuICAgIEBwcm9jZXNzT3BTdGFjaygpIGlmIEBvcFN0YWNrLmxlbmd0aCA9PSAyXG5cbiAgY2xlYXJPcFN0YWNrOiAtPlxuICAgIEBvcFN0YWNrID0gW11cblxuICBwcm9jZXNzT3BTdGFjazogLT5cbiAgICBbY29tbWFuZCwgaW5wdXRdID0gQG9wU3RhY2tcbiAgICBpZiBpbnB1dC5jaGFyYWN0ZXJzLmxlbmd0aCA+IDBcbiAgICAgIEBoaXN0b3J5LnVuc2hpZnQgY29tbWFuZFxuICAgICAgdHJ5XG4gICAgICAgIGNvbW1hbmQuZXhlY3V0ZShpbnB1dClcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBDb21tYW5kRXJyb3IpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiQ29tbWFuZCBlcnJvcjogI3tlLm1lc3NhZ2V9XCIpXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCgnZmFpbGVkLXRvLWV4ZWN1dGUnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgZVxuICAgIEBjbGVhck9wU3RhY2soKVxuICAgIEBlbWl0dGVyLmVtaXQoJ3Byb2Nlc3NlZC1vcC1zdGFjaycpXG5cbiAgIyBSZXR1cm5zIGFsbCBub24tZW1wdHkgc2VsZWN0aW9uc1xuICBnZXRTZWxlY3Rpb25zOiAtPlxuICAgIGZpbHRlcmVkID0ge31cbiAgICBmb3IgaWQsIHNlbGVjdGlvbiBvZiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgdW5sZXNzIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICAgZmlsdGVyZWRbaWRdID0gc2VsZWN0aW9uXG5cbiAgICByZXR1cm4gZmlsdGVyZWRcblxubW9kdWxlLmV4cG9ydHMgPSBFeFN0YXRlXG4iXX0=
