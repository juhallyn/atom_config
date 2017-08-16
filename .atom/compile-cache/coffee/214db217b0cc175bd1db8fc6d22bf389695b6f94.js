(function() {
  module.exports = {
    config: {
      layoutMode: {
        title: 'Layout Mode',
        description: 'In Auto mode, the UI and font size will automatically change based on the window size.',
        type: 'string',
        "default": 'Auto',
        "enum": ['Compact', 'Auto', 'Spacious']
      }
    },
    activate: function(state) {
      return atom.themes.onDidChangeActiveThemes(function() {
        var Config;
        Config = require('./config');
        return Config.apply();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2RheWxpZ2h0LXVpL2xpYi9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxXQUFBLEVBQWEsd0ZBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFIVDtRQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixTQURJLEVBRUosTUFGSSxFQUdKLFVBSEksQ0FKTjtPQURGO0tBREY7SUFZQSxRQUFBLEVBQVUsU0FBQyxLQUFEO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBWixDQUFvQyxTQUFBO0FBQ2xDLFlBQUE7UUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7ZUFDVCxNQUFNLENBQUMsS0FBUCxDQUFBO01BRmtDLENBQXBDO0lBRFEsQ0FaVjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIGxheW91dE1vZGU6XG4gICAgICB0aXRsZTogJ0xheW91dCBNb2RlJ1xuICAgICAgZGVzY3JpcHRpb246ICdJbiBBdXRvIG1vZGUsIHRoZSBVSSBhbmQgZm9udCBzaXplIHdpbGwgYXV0b21hdGljYWxseSBjaGFuZ2UgYmFzZWQgb24gdGhlIHdpbmRvdyBzaXplLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnQXV0bydcbiAgICAgIGVudW06IFtcbiAgICAgICAgJ0NvbXBhY3QnLFxuICAgICAgICAnQXV0bycsXG4gICAgICAgICdTcGFjaW91cycsXG4gICAgICBdXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lcyAtPlxuICAgICAgQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcnXG4gICAgICBDb25maWcuYXBwbHkoKVxuIl19
