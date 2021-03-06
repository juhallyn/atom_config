Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _atom = require('atom');

'use babel';
var config = {
  accentColor: {
    type: 'string',
    'default': 'red',
    'enum': ['red', 'purple', 'blue', 'green'],
    order: 1
  },
  coloredTabs: {
    description: 'Match the active tab\'s background color with the text editor',
    type: 'boolean',
    'default': true,
    order: 2
  }
};

exports.config = config;
var disposable;

function activate() {
  disposable = new _atom.CompositeDisposable(atom.config.observe('dark-flat-ui.accentColor', updateAccentColor), atom.config.observe('dark-flat-ui.coloredTabs', updateTabColor));
}

function deactivate() {
  disposable.dispose();
}

var workspaceView = atom.views.getView(atom.workspace);

function updateAccentColor(accentColor) {
  workspaceView.setAttribute('data-dark-flat-ui-accent-color', accentColor);
}

function updateTabColor(tabColor) {
  workspaceView.setAttribute('data-dark-flat-ui-colored-tabs', tabColor);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdWhhbGx5bi8uYXRvbS9wYWNrYWdlcy9kYXJrLWZsYXQtdWkvbGliL2RhcmstZmxhdC11aS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBQ29DLE1BQU07O0FBRDFDLFdBQVcsQ0FBQztBQUdMLElBQUksTUFBTSxHQUFHO0FBQ2xCLGFBQVcsRUFBRTtBQUNYLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxLQUFLO0FBQ2QsWUFBTSxDQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBRTtBQUMxQyxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsYUFBVyxFQUFFO0FBQ1gsZUFBVyxFQUFFLCtEQUErRDtBQUM1RSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsSUFBSTtBQUNiLFNBQUssRUFBRSxDQUFDO0dBQ1Q7Q0FDRixDQUFDOzs7QUFFRixJQUFJLFVBQVUsQ0FBQzs7QUFFUixTQUFTLFFBQVEsR0FBRztBQUN6QixZQUFVLEdBQUcsOEJBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsaUJBQWlCLENBQUMsRUFDbEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsY0FBYyxDQUFDLENBQ2hFLENBQUM7Q0FDSDs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixZQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDdEI7O0FBRUQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUV2RCxTQUFTLGlCQUFpQixDQUFDLFdBQVcsRUFBRTtBQUN0QyxlQUFhLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQzNFOztBQUVELFNBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRTtBQUNoQyxlQUFhLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ3hFIiwiZmlsZSI6Ii9Vc2Vycy9qdWhhbGx5bi8uYXRvbS9wYWNrYWdlcy9kYXJrLWZsYXQtdWkvbGliL2RhcmstZmxhdC11aS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgdmFyIGNvbmZpZyA9IHtcbiAgYWNjZW50Q29sb3I6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAncmVkJyxcbiAgICBlbnVtOiBbICdyZWQnLCAncHVycGxlJywgJ2JsdWUnLCAnZ3JlZW4nIF0sXG4gICAgb3JkZXI6IDFcbiAgfSxcbiAgY29sb3JlZFRhYnM6IHtcbiAgICBkZXNjcmlwdGlvbjogJ01hdGNoIHRoZSBhY3RpdmUgdGFiXFwncyBiYWNrZ3JvdW5kIGNvbG9yIHdpdGggdGhlIHRleHQgZWRpdG9yJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogMlxuICB9XG59O1xuXG52YXIgZGlzcG9zYWJsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnZGFyay1mbGF0LXVpLmFjY2VudENvbG9yJywgdXBkYXRlQWNjZW50Q29sb3IpLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2RhcmstZmxhdC11aS5jb2xvcmVkVGFicycsIHVwZGF0ZVRhYkNvbG9yKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG59XG5cbnZhciB3b3Jrc3BhY2VWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcblxuZnVuY3Rpb24gdXBkYXRlQWNjZW50Q29sb3IoYWNjZW50Q29sb3IpIHtcbiAgd29ya3NwYWNlVmlldy5zZXRBdHRyaWJ1dGUoJ2RhdGEtZGFyay1mbGF0LXVpLWFjY2VudC1jb2xvcicsIGFjY2VudENvbG9yKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVGFiQ29sb3IodGFiQ29sb3IpIHtcbiAgd29ya3NwYWNlVmlldy5zZXRBdHRyaWJ1dGUoJ2RhdGEtZGFyay1mbGF0LXVpLWNvbG9yZWQtdGFicycsIHRhYkNvbG9yKTtcbn1cbiJdfQ==