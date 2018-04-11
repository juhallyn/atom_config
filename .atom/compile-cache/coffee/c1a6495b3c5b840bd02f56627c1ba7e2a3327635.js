(function() {
  var CompositeDisposable, Disposable, Ex, ExMode, ExState, GlobalExState, ref;

  GlobalExState = require('./global-ex-state');

  ExState = require('./ex-state');

  Ex = require('./ex');

  ref = require('event-kit'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = ExMode = {
    activate: function(state) {
      this.globalExState = new GlobalExState;
      this.disposables = new CompositeDisposable;
      this.exStates = new WeakMap;
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var element, exState;
          if (editor.mini) {
            return;
          }
          element = atom.views.getView(editor);
          if (!_this.exStates.get(editor)) {
            exState = new ExState(element, _this.globalExState);
            _this.exStates.set(editor, exState);
            return _this.disposables.add(new Disposable(function() {
              return exState.destroy();
            }));
          }
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    provideEx: function() {
      return {
        registerCommand: Ex.registerCommand.bind(Ex),
        registerAlias: Ex.registerAlias.bind(Ex)
      };
    },
    consumeVim: function(vim) {
      this.vim = vim;
      return this.globalExState.setVim(vim);
    },
    consumeVimModePlus: function(vim) {
      return this.consumeVim(vim);
    },
    config: {
      splitbelow: {
        title: 'Split below',
        description: 'when splitting, split from below',
        type: 'boolean',
        "default": 'false'
      },
      splitright: {
        title: 'Split right',
        description: 'when splitting, split from right',
        type: 'boolean',
        "default": 'false'
      },
      gdefault: {
        title: 'Gdefault',
        description: 'When on, the ":substitute" flag \'g\' is default on',
        type: 'boolean',
        "default": 'false'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2V4LW1vZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUjs7RUFDaEIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7RUFDTCxNQUFvQyxPQUFBLENBQVEsV0FBUixDQUFwQyxFQUFDLDJCQUFELEVBQWE7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsTUFBQSxHQUNmO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSTthQUVoQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtBQUNqRCxjQUFBO1VBQUEsSUFBVSxNQUFNLENBQUMsSUFBakI7QUFBQSxtQkFBQTs7VUFFQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CO1VBRVYsSUFBRyxDQUFJLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsQ0FBUDtZQUNFLE9BQUEsR0FBVSxJQUFJLE9BQUosQ0FDUixPQURRLEVBRVIsS0FBQyxDQUFBLGFBRk87WUFLVixLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLE9BQXRCO21CQUVBLEtBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLFVBQUosQ0FBZSxTQUFBO3FCQUM5QixPQUFPLENBQUMsT0FBUixDQUFBO1lBRDhCLENBQWYsQ0FBakIsRUFSRjs7UUFMaUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWpCO0lBTFEsQ0FBVjtJQXFCQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRFUsQ0FyQlo7SUF3QkEsU0FBQSxFQUFXLFNBQUE7YUFDVDtRQUFBLGVBQUEsRUFBaUIsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFuQixDQUF3QixFQUF4QixDQUFqQjtRQUNBLGFBQUEsRUFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQWpCLENBQXNCLEVBQXRCLENBRGY7O0lBRFMsQ0F4Qlg7SUE0QkEsVUFBQSxFQUFZLFNBQUMsR0FBRDtNQUNWLElBQUMsQ0FBQSxHQUFELEdBQU87YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsR0FBdEI7SUFGVSxDQTVCWjtJQWdDQSxrQkFBQSxFQUFvQixTQUFDLEdBQUQ7YUFDbEIsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEI7SUFEa0IsQ0FoQ3BCO0lBbUNBLE1BQUEsRUFDRTtNQUFBLFVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsV0FBQSxFQUFhLGtDQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7T0FERjtNQUtBLFVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsV0FBQSxFQUFhLGtDQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7T0FORjtNQVVBLFFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxVQUFQO1FBQ0EsV0FBQSxFQUFhLHFEQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7T0FYRjtLQXBDRjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIkdsb2JhbEV4U3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC1leC1zdGF0ZSdcbkV4U3RhdGUgPSByZXF1aXJlICcuL2V4LXN0YXRlJ1xuRXggPSByZXF1aXJlICcuL2V4J1xue0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnZXZlbnQta2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV4TW9kZSA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGdsb2JhbEV4U3RhdGUgPSBuZXcgR2xvYmFsRXhTdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGV4U3RhdGVzID0gbmV3IFdlYWtNYXBcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICByZXR1cm4gaWYgZWRpdG9yLm1pbmlcblxuICAgICAgZWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG5cbiAgICAgIGlmIG5vdCBAZXhTdGF0ZXMuZ2V0KGVkaXRvcilcbiAgICAgICAgZXhTdGF0ZSA9IG5ldyBFeFN0YXRlKFxuICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgQGdsb2JhbEV4U3RhdGVcbiAgICAgICAgKVxuXG4gICAgICAgIEBleFN0YXRlcy5zZXQoZWRpdG9yLCBleFN0YXRlKVxuXG4gICAgICAgIEBkaXNwb3NhYmxlcy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgICAgICBleFN0YXRlLmRlc3Ryb3koKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gIHByb3ZpZGVFeDogLT5cbiAgICByZWdpc3RlckNvbW1hbmQ6IEV4LnJlZ2lzdGVyQ29tbWFuZC5iaW5kKEV4KVxuICAgIHJlZ2lzdGVyQWxpYXM6IEV4LnJlZ2lzdGVyQWxpYXMuYmluZChFeClcblxuICBjb25zdW1lVmltOiAodmltKSAtPlxuICAgIEB2aW0gPSB2aW1cbiAgICBAZ2xvYmFsRXhTdGF0ZS5zZXRWaW0odmltKVxuXG4gIGNvbnN1bWVWaW1Nb2RlUGx1czogKHZpbSkgLT5cbiAgICB0aGlzLmNvbnN1bWVWaW0odmltKVxuXG4gIGNvbmZpZzpcbiAgICBzcGxpdGJlbG93OlxuICAgICAgdGl0bGU6ICdTcGxpdCBiZWxvdydcbiAgICAgIGRlc2NyaXB0aW9uOiAnd2hlbiBzcGxpdHRpbmcsIHNwbGl0IGZyb20gYmVsb3cnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6ICdmYWxzZSdcbiAgICBzcGxpdHJpZ2h0OlxuICAgICAgdGl0bGU6ICdTcGxpdCByaWdodCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnd2hlbiBzcGxpdHRpbmcsIHNwbGl0IGZyb20gcmlnaHQnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6ICdmYWxzZSdcbiAgICBnZGVmYXVsdDpcbiAgICAgIHRpdGxlOiAnR2RlZmF1bHQnXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gb24sIHRoZSBcIjpzdWJzdGl0dXRlXCIgZmxhZyBcXCdnXFwnIGlzIGRlZmF1bHQgb24nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6ICdmYWxzZSdcbiJdfQ==
