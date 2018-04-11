(function() {
  var ExState, GlobalExState, activateExMode, dispatchKeyboardEvent, dispatchTextEvent, getEditorElement, keydown,
    slice = [].slice;

  ExState = require('../lib/ex-state');

  GlobalExState = require('../lib/global-ex-state');

  beforeEach(function() {
    return atom.workspace || (atom.workspace = {});
  });

  activateExMode = function() {
    return atom.workspace.open().then(function() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'ex-mode:open');
      keydown('escape');
      return atom.workspace.getActivePane().destroyActiveItem();
    });
  };

  getEditorElement = function(callback) {
    var textEditor;
    textEditor = null;
    waitsForPromise(function() {
      return atom.workspace.open().then(function(e) {
        return textEditor = e;
      });
    });
    return runs(function() {
      var element;
      element = atom.views.getView(textEditor);
      return callback(element);
    });
  };

  dispatchKeyboardEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    e = document.createEvent('KeyboardEvent');
    e.initKeyboardEvent.apply(e, eventArgs);
    if (e.keyCode === 0) {
      Object.defineProperty(e, 'keyCode', {
        get: function() {
          return void 0;
        }
      });
    }
    return target.dispatchEvent(e);
  };

  dispatchTextEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    e = document.createEvent('TextEvent');
    e.initTextEvent.apply(e, eventArgs);
    return target.dispatchEvent(e);
  };

  keydown = function(key, arg) {
    var alt, canceled, ctrl, element, eventArgs, meta, raw, ref, shift;
    ref = arg != null ? arg : {}, element = ref.element, ctrl = ref.ctrl, shift = ref.shift, alt = ref.alt, meta = ref.meta, raw = ref.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    element || (element = document.activeElement);
    eventArgs = [true, true, null, key, 0, ctrl, alt, shift, meta];
    canceled = !dispatchKeyboardEvent.apply(null, [element, 'keydown'].concat(slice.call(eventArgs)));
    dispatchKeyboardEvent.apply(null, [element, 'keypress'].concat(slice.call(eventArgs)));
    if (!canceled) {
      if (dispatchTextEvent.apply(null, [element, 'textInput'].concat(slice.call(eventArgs)))) {
        element.value += key;
      }
    }
    return dispatchKeyboardEvent.apply(null, [element, 'keyup'].concat(slice.call(eventArgs)));
  };

  module.exports = {
    keydown: keydown,
    getEditorElement: getEditorElement,
    activateExMode: activateExMode
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJHQUFBO0lBQUE7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxpQkFBUjs7RUFDVixhQUFBLEdBQWdCLE9BQUEsQ0FBUSx3QkFBUjs7RUFFaEIsVUFBQSxDQUFXLFNBQUE7V0FDVCxJQUFJLENBQUMsY0FBTCxJQUFJLENBQUMsWUFBYztFQURWLENBQVg7O0VBR0EsY0FBQSxHQUFpQixTQUFBO1dBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFBO01BQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQXZCLEVBQTJELGNBQTNEO01BQ0EsT0FBQSxDQUFRLFFBQVI7YUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLGlCQUEvQixDQUFBO0lBSHlCLENBQTNCO0VBRGU7O0VBT2pCLGdCQUFBLEdBQW1CLFNBQUMsUUFBRDtBQUNqQixRQUFBO0lBQUEsVUFBQSxHQUFhO0lBRWIsZUFBQSxDQUFnQixTQUFBO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLENBQUQ7ZUFDekIsVUFBQSxHQUFhO01BRFksQ0FBM0I7SUFEYyxDQUFoQjtXQUlBLElBQUEsQ0FBSyxTQUFBO0FBU0gsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkI7YUFFVixRQUFBLENBQVMsT0FBVDtJQVhHLENBQUw7RUFQaUI7O0VBb0JuQixxQkFBQSxHQUF3QixTQUFBO0FBQ3RCLFFBQUE7SUFEdUIsdUJBQVE7SUFDL0IsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxXQUFULENBQXFCLGVBQXJCO0lBQ0osQ0FBQyxDQUFDLGlCQUFGLFVBQW9CLFNBQXBCO0lBRUEsSUFBMEQsQ0FBQyxDQUFDLE9BQUYsS0FBYSxDQUF2RTtNQUFBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQXRCLEVBQXlCLFNBQXpCLEVBQW9DO1FBQUEsR0FBQSxFQUFLLFNBQUE7aUJBQUc7UUFBSCxDQUFMO09BQXBDLEVBQUE7O1dBQ0EsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsQ0FBckI7RUFMc0I7O0VBT3hCLGlCQUFBLEdBQW9CLFNBQUE7QUFDbEIsUUFBQTtJQURtQix1QkFBUTtJQUMzQixDQUFBLEdBQUksUUFBUSxDQUFDLFdBQVQsQ0FBcUIsV0FBckI7SUFDSixDQUFDLENBQUMsYUFBRixVQUFnQixTQUFoQjtXQUNBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLENBQXJCO0VBSGtCOztFQUtwQixPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sR0FBTjtBQUNSLFFBQUE7d0JBRGMsTUFBdUMsSUFBdEMsdUJBQVMsaUJBQU0sbUJBQU8sZUFBSyxpQkFBTTtJQUNoRCxJQUFBLENBQUEsQ0FBbUQsR0FBQSxLQUFPLFFBQVAsSUFBbUIsYUFBdEUsQ0FBQTtNQUFBLEdBQUEsR0FBTSxJQUFBLEdBQUksQ0FBQyxHQUFHLENBQUMsVUFBSixDQUFlLENBQWYsQ0FBaUIsQ0FBQyxRQUFsQixDQUEyQixFQUEzQixDQUFELEVBQVY7O0lBQ0EsWUFBQSxVQUFZLFFBQVEsQ0FBQztJQUNyQixTQUFBLEdBQVksQ0FDVixJQURVLEVBRVYsSUFGVSxFQUdWLElBSFUsRUFJVixHQUpVLEVBS1YsQ0FMVSxFQU1WLElBTlUsRUFNSixHQU5JLEVBTUMsS0FORCxFQU1RLElBTlI7SUFTWixRQUFBLEdBQVcsQ0FBSSxxQkFBQSxhQUFzQixDQUFBLE9BQUEsRUFBUyxTQUFXLFNBQUEsV0FBQSxTQUFBLENBQUEsQ0FBMUM7SUFDZixxQkFBQSxhQUFzQixDQUFBLE9BQUEsRUFBUyxVQUFZLFNBQUEsV0FBQSxTQUFBLENBQUEsQ0FBM0M7SUFDQSxJQUFHLENBQUksUUFBUDtNQUNFLElBQUcsaUJBQUEsYUFBa0IsQ0FBQSxPQUFBLEVBQVMsV0FBYSxTQUFBLFdBQUEsU0FBQSxDQUFBLENBQXhDLENBQUg7UUFDRSxPQUFPLENBQUMsS0FBUixJQUFpQixJQURuQjtPQURGOztXQUdBLHFCQUFBLGFBQXNCLENBQUEsT0FBQSxFQUFTLE9BQVMsU0FBQSxXQUFBLFNBQUEsQ0FBQSxDQUF4QztFQWpCUTs7RUFtQlYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxTQUFBLE9BQUQ7SUFBVSxrQkFBQSxnQkFBVjtJQUE0QixnQkFBQSxjQUE1Qjs7QUFoRWpCIiwic291cmNlc0NvbnRlbnQiOlsiRXhTdGF0ZSA9IHJlcXVpcmUgJy4uL2xpYi9leC1zdGF0ZSdcbkdsb2JhbEV4U3RhdGUgPSByZXF1aXJlICcuLi9saWIvZ2xvYmFsLWV4LXN0YXRlJ1xuXG5iZWZvcmVFYWNoIC0+XG4gIGF0b20ud29ya3NwYWNlIHx8PSB7fVxuXG5hY3RpdmF0ZUV4TW9kZSA9IC0+XG4gIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnZXgtbW9kZTpvcGVuJylcbiAgICBrZXlkb3duKCdlc2NhcGUnKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5kZXN0cm95QWN0aXZlSXRlbSgpXG5cblxuZ2V0RWRpdG9yRWxlbWVudCA9IChjYWxsYmFjaykgLT5cbiAgdGV4dEVkaXRvciA9IG51bGxcblxuICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZSkgLT5cbiAgICAgIHRleHRFZGl0b3IgPSBlXG5cbiAgcnVucyAtPlxuICAgICMgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdG9tLXRleHQtZWRpdG9yXCIpXG4gICAgIyBlbGVtZW50LnNldE1vZGVsKHRleHRFZGl0b3IpXG4gICAgIyBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlJylcbiAgICAjIGVsZW1lbnQuZXhTdGF0ZSA9IG5ldyBFeFN0YXRlKGVsZW1lbnQsIG5ldyBHbG9iYWxFeFN0YXRlKVxuICAgICNcbiAgICAjIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImtleWRvd25cIiwgKGUpIC0+XG4gICAgIyAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGUpXG5cbiAgICBlbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpXG5cbiAgICBjYWxsYmFjayhlbGVtZW50KVxuXG5kaXNwYXRjaEtleWJvYXJkRXZlbnQgPSAodGFyZ2V0LCBldmVudEFyZ3MuLi4pIC0+XG4gIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnS2V5Ym9hcmRFdmVudCcpXG4gIGUuaW5pdEtleWJvYXJkRXZlbnQoZXZlbnRBcmdzLi4uKVxuICAjIDAgaXMgdGhlIGRlZmF1bHQsIGFuZCBpdCdzIHZhbGlkIEFTQ0lJLCBidXQgaXQncyB3cm9uZy5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsICdrZXlDb2RlJywgZ2V0OiAtPiB1bmRlZmluZWQpIGlmIGUua2V5Q29kZSBpcyAwXG4gIHRhcmdldC5kaXNwYXRjaEV2ZW50IGVcblxuZGlzcGF0Y2hUZXh0RXZlbnQgPSAodGFyZ2V0LCBldmVudEFyZ3MuLi4pIC0+XG4gIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVGV4dEV2ZW50JylcbiAgZS5pbml0VGV4dEV2ZW50KGV2ZW50QXJncy4uLilcbiAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQgZVxuXG5rZXlkb3duID0gKGtleSwge2VsZW1lbnQsIGN0cmwsIHNoaWZ0LCBhbHQsIG1ldGEsIHJhd309e30pIC0+XG4gIGtleSA9IFwiVSsje2tleS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KX1cIiB1bmxlc3Mga2V5IGlzICdlc2NhcGUnIG9yIHJhdz9cbiAgZWxlbWVudCB8fD0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICBldmVudEFyZ3MgPSBbXG4gICAgdHJ1ZSwgIyBidWJibGVzXG4gICAgdHJ1ZSwgIyBjYW5jZWxhYmxlXG4gICAgbnVsbCwgIyB2aWV3XG4gICAga2V5LCAgIyBrZXlcbiAgICAwLCAgICAjIGxvY2F0aW9uXG4gICAgY3RybCwgYWx0LCBzaGlmdCwgbWV0YVxuICBdXG5cbiAgY2FuY2VsZWQgPSBub3QgZGlzcGF0Y2hLZXlib2FyZEV2ZW50KGVsZW1lbnQsICdrZXlkb3duJywgZXZlbnRBcmdzLi4uKVxuICBkaXNwYXRjaEtleWJvYXJkRXZlbnQoZWxlbWVudCwgJ2tleXByZXNzJywgZXZlbnRBcmdzLi4uKVxuICBpZiBub3QgY2FuY2VsZWRcbiAgICBpZiBkaXNwYXRjaFRleHRFdmVudChlbGVtZW50LCAndGV4dElucHV0JywgZXZlbnRBcmdzLi4uKVxuICAgICAgZWxlbWVudC52YWx1ZSArPSBrZXlcbiAgZGlzcGF0Y2hLZXlib2FyZEV2ZW50KGVsZW1lbnQsICdrZXl1cCcsIGV2ZW50QXJncy4uLilcblxubW9kdWxlLmV4cG9ydHMgPSB7a2V5ZG93biwgZ2V0RWRpdG9yRWxlbWVudCwgYWN0aXZhdGVFeE1vZGV9XG4iXX0=
