(function() {
  var ExNormalModeInputElement, Input, ViewModel;

  ExNormalModeInputElement = require('./ex-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      ref = this.command, this.editor = ref.editor, this.exState = ref.exState;
      this.view = new ExNormalModeInputElement().initialize(this, opts);
      this.editor.normalModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
      this.done = false;
    }

    ViewModel.prototype.confirm = function(view) {
      this.exState.pushOperations(new Input(this.view.value));
      return this.done = true;
    };

    ViewModel.prototype.cancel = function(view) {
      if (!this.done) {
        this.exState.pushOperations(new Input(''));
        return this.done = true;
      }
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL3ZpZXctbW9kZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSx3QkFBQSxHQUEyQixPQUFBLENBQVEsZ0NBQVI7O0VBRXJCO0lBQ1MsbUJBQUMsT0FBRCxFQUFXLElBQVg7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFVBQUQ7O1FBQVUsT0FBSzs7TUFDM0IsTUFBc0IsSUFBQyxDQUFBLE9BQXZCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxjQUFBO01BRVgsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLHdCQUFBLENBQUEsQ0FBMEIsQ0FBQyxVQUEzQixDQUFzQyxJQUF0QyxFQUF5QyxJQUF6QztNQUNaLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsR0FBOEIsSUFBQyxDQUFBO01BQy9CLElBQUMsQ0FBQSxPQUFPLENBQUMsa0JBQVQsQ0FBNEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQU5HOzt3QkFRYixPQUFBLEdBQVMsU0FBQyxJQUFEO01BQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQTRCLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBWixDQUE1QjthQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFGRDs7d0JBSVQsTUFBQSxHQUFRLFNBQUMsSUFBRDtNQUNOLElBQUEsQ0FBTyxJQUFDLENBQUEsSUFBUjtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUE0QixJQUFBLEtBQUEsQ0FBTSxFQUFOLENBQTVCO2VBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxLQUZWOztJQURNOzs7Ozs7RUFLSjtJQUNTLGVBQUMsVUFBRDtNQUFDLElBQUMsQ0FBQSxhQUFEO0lBQUQ7Ozs7OztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsV0FBQSxTQURlO0lBQ0osT0FBQSxLQURJOztBQXZCakIiLCJzb3VyY2VzQ29udGVudCI6WyJFeE5vcm1hbE1vZGVJbnB1dEVsZW1lbnQgPSByZXF1aXJlICcuL2V4LW5vcm1hbC1tb2RlLWlucHV0LWVsZW1lbnQnXG5cbmNsYXNzIFZpZXdNb2RlbFxuICBjb25zdHJ1Y3RvcjogKEBjb21tYW5kLCBvcHRzPXt9KSAtPlxuICAgIHtAZWRpdG9yLCBAZXhTdGF0ZX0gPSBAY29tbWFuZFxuXG4gICAgQHZpZXcgPSBuZXcgRXhOb3JtYWxNb2RlSW5wdXRFbGVtZW50KCkuaW5pdGlhbGl6ZShALCBvcHRzKVxuICAgIEBlZGl0b3Iubm9ybWFsTW9kZUlucHV0VmlldyA9IEB2aWV3XG4gICAgQGV4U3RhdGUub25EaWRGYWlsVG9FeGVjdXRlID0+IEB2aWV3LnJlbW92ZSgpXG4gICAgQGRvbmUgPSBmYWxzZVxuXG4gIGNvbmZpcm06ICh2aWV3KSAtPlxuICAgIEBleFN0YXRlLnB1c2hPcGVyYXRpb25zKG5ldyBJbnB1dChAdmlldy52YWx1ZSkpXG4gICAgQGRvbmUgPSB0cnVlXG5cbiAgY2FuY2VsOiAodmlldykgLT5cbiAgICB1bmxlc3MgQGRvbmVcbiAgICAgIEBleFN0YXRlLnB1c2hPcGVyYXRpb25zKG5ldyBJbnB1dCgnJykpXG4gICAgICBAZG9uZSA9IHRydWVcblxuY2xhc3MgSW5wdXRcbiAgY29uc3RydWN0b3I6IChAY2hhcmFjdGVycykgLT5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFZpZXdNb2RlbCwgSW5wdXRcbn1cbiJdfQ==
