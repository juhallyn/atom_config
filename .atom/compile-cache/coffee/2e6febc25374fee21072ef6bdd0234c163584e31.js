(function() {
  module.exports = {
    apply: function() {
      var root, setLayoutMode;
      root = document.documentElement;
      setLayoutMode = function(layoutMode) {
        return root.setAttribute('theme-daylight-ui-layoutmode', layoutMode.toLowerCase());
      };
      atom.config.onDidChange('daylight-ui.layoutMode', function() {
        return setLayoutMode(atom.config.get('daylight-ui.layoutMode'));
      });
      return setLayoutMode(atom.config.get('daylight-ui.layoutMode'));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2RheWxpZ2h0LXVpL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLEtBQUEsRUFBTyxTQUFBO0FBRUwsVUFBQTtNQUFBLElBQUEsR0FBTyxRQUFRLENBQUM7TUFFaEIsYUFBQSxHQUFnQixTQUFDLFVBQUQ7ZUFDZCxJQUFJLENBQUMsWUFBTCxDQUFrQiw4QkFBbEIsRUFBa0QsVUFBVSxDQUFDLFdBQVgsQ0FBQSxDQUFsRDtNQURjO01BR2hCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3Qix3QkFBeEIsRUFBa0QsU0FBQTtlQUNoRCxhQUFBLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixDQUFkO01BRGdELENBQWxEO2FBR0EsYUFBQSxDQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsQ0FBZDtJQVZLLENBQVA7O0FBRkYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5cbiAgYXBwbHk6IC0+XG5cbiAgICByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cbiAgICBzZXRMYXlvdXRNb2RlID0gKGxheW91dE1vZGUpIC0+XG4gICAgICByb290LnNldEF0dHJpYnV0ZSgndGhlbWUtZGF5bGlnaHQtdWktbGF5b3V0bW9kZScsIGxheW91dE1vZGUudG9Mb3dlckNhc2UoKSlcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdkYXlsaWdodC11aS5sYXlvdXRNb2RlJywgLT5cbiAgICAgIHNldExheW91dE1vZGUoYXRvbS5jb25maWcuZ2V0KCdkYXlsaWdodC11aS5sYXlvdXRNb2RlJykpXG5cbiAgICBzZXRMYXlvdXRNb2RlKGF0b20uY29uZmlnLmdldCgnZGF5bGlnaHQtdWkubGF5b3V0TW9kZScpKVxuIl19
