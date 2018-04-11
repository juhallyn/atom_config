(function() {
  var ExCommandModeInputElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ExCommandModeInputElement = (function(superClass) {
    extend(ExCommandModeInputElement, superClass);

    function ExCommandModeInputElement() {
      return ExCommandModeInputElement.__super__.constructor.apply(this, arguments);
    }

    ExCommandModeInputElement.prototype.createdCallback = function() {
      this.className = "command-mode-input";
      this.editorContainer = document.createElement("div");
      this.editorContainer.className = "editor-container";
      return this.appendChild(this.editorContainer);
    };

    ExCommandModeInputElement.prototype.initialize = function(viewModel, opts) {
      var ref;
      this.viewModel = viewModel;
      if (opts == null) {
        opts = {};
      }
      if (opts["class"] != null) {
        this.editorContainer.classList.add(opts["class"]);
      }
      if (opts.hidden) {
        this.editorContainer.style.height = "0px";
      }
      this.editorElement = document.createElement("atom-text-editor");
      this.editorElement.classList.add('editor');
      this.editorElement.classList.add('ex-mode-editor');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.editorContainer.appendChild(this.editorElement);
      this.singleChar = opts.singleChar;
      this.defaultText = (ref = opts.defaultText) != null ? ref : '';
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
      this.focus();
      this.handleEvents();
      return this;
    };

    ExCommandModeInputElement.prototype.handleEvents = function() {
      if (this.singleChar != null) {
        this.editorElement.getModel().getBuffer().onDidChange((function(_this) {
          return function(e) {
            if (e.newText) {
              return _this.confirm();
            }
          };
        })(this));
      } else {
        atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
        atom.commands.add(this.editorElement, 'core:backspace', this.backspace.bind(this));
      }
      atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
      atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
      atom.commands.add(this.editorElement, 'ex-mode:close', this.cancel.bind(this));
      return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
    };

    ExCommandModeInputElement.prototype.backspace = function() {
      if (!this.editorElement.getModel().getText().length) {
        return this.cancel();
      }
    };

    ExCommandModeInputElement.prototype.confirm = function() {
      this.value = this.editorElement.getModel().getText() || this.defaultText;
      this.viewModel.confirm(this);
      return this.removePanel();
    };

    ExCommandModeInputElement.prototype.focus = function() {
      return this.editorElement.focus();
    };

    ExCommandModeInputElement.prototype.cancel = function(e) {
      this.viewModel.cancel(this);
      return this.removePanel();
    };

    ExCommandModeInputElement.prototype.removePanel = function() {
      atom.workspace.getActivePane().activate();
      return this.panel.destroy();
    };

    return ExCommandModeInputElement;

  })(HTMLDivElement);

  module.exports = document.registerElement("ex-command-mode-input", {
    "extends": "div",
    prototype: ExCommandModeInputElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2V4LW5vcm1hbC1tb2RlLWlucHV0LWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBOzs7RUFBTTs7Ozs7Ozt3Q0FDSixlQUFBLEdBQWlCLFNBQUE7TUFDZixJQUFDLENBQUEsU0FBRCxHQUFhO01BRWIsSUFBQyxDQUFBLGVBQUQsR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDbkIsSUFBQyxDQUFBLGVBQWUsQ0FBQyxTQUFqQixHQUE2QjthQUU3QixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxlQUFkO0lBTmU7O3dDQVFqQixVQUFBLEdBQVksU0FBQyxTQUFELEVBQWEsSUFBYjtBQUNWLFVBQUE7TUFEVyxJQUFDLENBQUEsWUFBRDs7UUFBWSxPQUFPOztNQUM5QixJQUFHLHFCQUFIO1FBQ0UsSUFBQyxDQUFBLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBM0IsQ0FBK0IsSUFBSSxFQUFDLEtBQUQsRUFBbkMsRUFERjs7TUFHQSxJQUFHLElBQUksQ0FBQyxNQUFSO1FBQ0UsSUFBQyxDQUFBLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBdkIsR0FBZ0MsTUFEbEM7O01BR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsa0JBQXZCO01BQ2pCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLFFBQTdCO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsZ0JBQTdCO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQUEsQ0FBeUIsQ0FBQyxPQUExQixDQUFrQyxJQUFsQztNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixNQUE1QixFQUFv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QixDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7SUFGVzs7OztLQTlEeUI7O0VBa0V4QyxNQUFNLENBQUMsT0FBUCxHQUNBLFFBQVEsQ0FBQyxlQUFULENBQXlCLHVCQUF6QixFQUNFO0lBQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO0lBQ0EsU0FBQSxFQUFXLHlCQUF5QixDQUFDLFNBRHJDO0dBREY7QUFuRUEiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBFeENvbW1hbmRNb2RlSW5wdXRFbGVtZW50IGV4dGVuZHMgSFRNTERpdkVsZW1lbnRcbiAgY3JlYXRlZENhbGxiYWNrOiAtPlxuICAgIEBjbGFzc05hbWUgPSBcImNvbW1hbmQtbW9kZS1pbnB1dFwiXG5cbiAgICBAZWRpdG9yQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIEBlZGl0b3JDb250YWluZXIuY2xhc3NOYW1lID0gXCJlZGl0b3ItY29udGFpbmVyXCJcblxuICAgIEBhcHBlbmRDaGlsZChAZWRpdG9yQ29udGFpbmVyKVxuXG4gIGluaXRpYWxpemU6IChAdmlld01vZGVsLCBvcHRzID0ge30pIC0+XG4gICAgaWYgb3B0cy5jbGFzcz9cbiAgICAgIEBlZGl0b3JDb250YWluZXIuY2xhc3NMaXN0LmFkZChvcHRzLmNsYXNzKVxuXG4gICAgaWYgb3B0cy5oaWRkZW5cbiAgICAgIEBlZGl0b3JDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIlxuXG4gICAgQGVkaXRvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZWRpdG9yJykgIyBDb25zaWRlciB0aGlzIGRlcHJlY2F0ZWQhXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZXgtbW9kZS1lZGl0b3InKVxuICAgIEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0TWluaSh0cnVlKVxuICAgIEBlZGl0b3JFbGVtZW50LnNldEF0dHJpYnV0ZSgnbWluaScsICcnKVxuICAgIEBlZGl0b3JDb250YWluZXIuYXBwZW5kQ2hpbGQoQGVkaXRvckVsZW1lbnQpXG5cbiAgICBAc2luZ2xlQ2hhciA9IG9wdHMuc2luZ2xlQ2hhclxuICAgIEBkZWZhdWx0VGV4dCA9IG9wdHMuZGVmYXVsdFRleHQgPyAnJ1xuXG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgcHJpb3JpdHk6IDEwMClcblxuICAgIEBmb2N1cygpXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgICB0aGlzXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIGlmIEBzaW5nbGVDaGFyP1xuICAgICAgQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSAoZSkgPT5cbiAgICAgICAgQGNvbmZpcm0oKSBpZiBlLm5ld1RleHRcbiAgICBlbHNlXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2VkaXRvcjpuZXdsaW5lJywgQGNvbmZpcm0uYmluZCh0aGlzKSlcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnLCBAYmFja3NwYWNlLmJpbmQodGhpcykpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2NvcmU6Y29uZmlybScsIEBjb25maXJtLmJpbmQodGhpcykpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsICdjb3JlOmNhbmNlbCcsIEBjYW5jZWwuYmluZCh0aGlzKSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6Y2xvc2UnLCBAY2FuY2VsLmJpbmQodGhpcykpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsICdibHVyJywgQGNhbmNlbC5iaW5kKHRoaXMpKVxuXG4gIGJhY2tzcGFjZTogLT5cbiAgICAjIHByZXNzaW5nIGJhY2tzcGFjZSBvdmVyIGVtcHR5IGA6YCBzaG91bGQgY2FuY2VsIGV4LW1vZGVcbiAgICBAY2FuY2VsKCkgdW5sZXNzIEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuZ2V0VGV4dCgpLmxlbmd0aFxuXG4gIGNvbmZpcm06IC0+XG4gICAgQHZhbHVlID0gQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRUZXh0KCkgb3IgQGRlZmF1bHRUZXh0XG4gICAgQHZpZXdNb2RlbC5jb25maXJtKHRoaXMpXG4gICAgQHJlbW92ZVBhbmVsKClcblxuICBmb2N1czogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5mb2N1cygpXG5cbiAgY2FuY2VsOiAoZSkgLT5cbiAgICBAdmlld01vZGVsLmNhbmNlbCh0aGlzKVxuICAgIEByZW1vdmVQYW5lbCgpXG5cbiAgcmVtb3ZlUGFuZWw6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcbiAgICBAcGFuZWwuZGVzdHJveSgpXG5cbm1vZHVsZS5leHBvcnRzID1cbmRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudChcImV4LWNvbW1hbmQtbW9kZS1pbnB1dFwiXG4gIGV4dGVuZHM6IFwiZGl2XCIsXG4gIHByb3RvdHlwZTogRXhDb21tYW5kTW9kZUlucHV0RWxlbWVudC5wcm90b3R5cGVcbilcbiJdfQ==
