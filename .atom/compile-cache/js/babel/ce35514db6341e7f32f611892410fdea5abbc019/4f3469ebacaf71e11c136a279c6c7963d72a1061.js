var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

'use babel';

var SelectListView = require('atom-select-list');
var fuzzaldrinPlus = require('fuzzaldrin-plus');

module.exports = (function () {
  function SelectList() {
    var _this = this;

    _classCallCheck(this, SelectList);

    this.selectListView = new SelectListView({
      initiallyVisibleItemCount: 10,
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.displayName;
      },
      elementForItem: function elementForItem(item, _ref) {
        var index = _ref.index;
        var selected = _ref.selected;
        var visible = _ref.visible;

        if (!visible) {
          return document.createElement('li');
        }
        var li = document.createElement('li');
        var div = document.createElement('div');
        div.classList.add('pull-right');

        var commandName = item.klass.getCommandName();
        _this.keyBindingsForActiveElement.filter(function (_ref2) {
          var command = _ref2.command;
          return command === commandName;
        }).forEach(function (keyBinding) {
          var kbd = document.createElement('kbd');
          kbd.classList.add('key-binding');
          kbd.textContent = (0, _underscorePlus.humanizeKeystroke)(keyBinding.keystrokes);
          div.appendChild(kbd);
        });

        var span = document.createElement('span');
        highlightMatchesInElement(item.displayName, _this.selectListView.getQuery(), span);

        li.appendChild(div);
        li.appendChild(span);
        return li;
      },
      emptyMessage: 'No matches found',
      didConfirmSelection: function didConfirmSelection(item) {
        _this.confirmed = true;
        if (_this.onConfirm) _this.onConfirm(item);
        _this.hide();
      },
      didCancelSelection: function didCancelSelection() {
        if (_this.confirmed) return;
        if (_this.onCancel) _this.onCancel();
        _this.hide();
      }
    });
    this.selectListView.element.classList.add('vim-mode-plus-select-list');
  }

  _createClass(SelectList, [{
    key: 'selectFromItems',
    value: function selectFromItems(items) {
      var _this2 = this;

      return new Promise(function (resolve) {
        _this2.show({
          items: items,
          onCancel: resolve,
          onConfirm: resolve
        });
      });
    }
  }, {
    key: 'show',
    value: _asyncToGenerator(function* (_ref3) {
      var items = _ref3.items;
      var onCancel = _ref3.onCancel;
      var onConfirm = _ref3.onConfirm;

      this.keyBindingsForActiveElement = atom.keymaps.findKeyBindings({ target: this.activeElement });

      this.confirmed = false;
      this.onConfirm = onConfirm;
      this.onCancel = onCancel;

      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      }
      this.selectListView.reset();
      yield this.selectListView.update({ items: items });

      this.previouslyFocusedElement = document.activeElement;
      this.panel.show();
      this.selectListView.focus();
    })
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }
  }]);

  return SelectList;
})();

function highlightMatchesInElement(text, query, el) {
  var matches = fuzzaldrinPlus.match(text, query);
  var matchedChars = [];
  var lastIndex = 0;
  for (var matchIndex of matches) {
    var _unmatched = text.substring(lastIndex, matchIndex);
    if (_unmatched) {
      if (matchedChars.length > 0) {
        var matchSpan = document.createElement('span');
        matchSpan.classList.add('character-match');
        matchSpan.textContent = matchedChars.join('');
        el.appendChild(matchSpan);
        matchedChars = [];
      }

      el.appendChild(document.createTextNode(_unmatched));
    }

    matchedChars.push(text[matchIndex]);
    lastIndex = matchIndex + 1;
  }

  if (matchedChars.length > 0) {
    var matchSpan = document.createElement('span');
    matchSpan.classList.add('character-match');
    matchSpan.textContent = matchedChars.join('');
    el.appendChild(matchSpan);
  }

  var unmatched = text.substring(lastIndex);
  if (unmatched) {
    el.appendChild(document.createTextNode(unmatched));
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hwdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWxlY3QtbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OEJBRWdDLGlCQUFpQjs7QUFGakQsV0FBVyxDQUFBOztBQUdYLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQ2xELElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztBQUVqRCxNQUFNLENBQUMsT0FBTztBQUNBLFdBRFMsVUFBVSxHQUNoQjs7OzBCQURNLFVBQVU7O0FBRTdCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUM7QUFDdkMsK0JBQXlCLEVBQUUsRUFBRTtBQUM3QixXQUFLLEVBQUUsRUFBRTtBQUNULHNCQUFnQixFQUFFLDBCQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsV0FBVztPQUFBO0FBQzFDLG9CQUFjLEVBQUUsd0JBQUMsSUFBSSxFQUFFLElBQTBCLEVBQUs7WUFBOUIsS0FBSyxHQUFOLElBQTBCLENBQXpCLEtBQUs7WUFBRSxRQUFRLEdBQWhCLElBQTBCLENBQWxCLFFBQVE7WUFBRSxPQUFPLEdBQXpCLElBQTBCLENBQVIsT0FBTzs7QUFDOUMsWUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGlCQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDcEM7QUFDRCxZQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZDLFlBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDekMsV0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRS9CLFlBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDL0MsY0FBSywyQkFBMkIsQ0FBQyxN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bEI7O0FBRUQsUUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVMsQ0FBQyxDQUFDLENBQUE7S0FDbkQ7O0FBRUQsZ0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDbkMsYUFBUyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUE7R0FDM0I7O0FBRUQsTUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUMzQixRQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2hELGFBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDMUMsYUFBUyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzdDLE1BQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7R0FDMUI7O0FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUMzQyxNQUFJLFNBQVMsRUFBRTtBQUNiLE1BQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0dBQ25EO0NBQ0YiLCJmaWxlIjoiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdC1saXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtodW1hbml6ZUtleXN0cm9rZX0gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuY29uc3QgU2VsZWN0TGlzdFZpZXcgPSByZXF1aXJlKCdhdG9tLXNlbGVjdC1saXN0JylcbmNvbnN0IGZ1enphbGRyaW5QbHVzID0gcmVxdWlyZSgnZnV6emFsZHJpbi1wbHVzJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTZWxlY3RMaXN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcgPSBuZXcgU2VsZWN0TGlzdFZpZXcoe1xuICAgICAgaW5pdGlhbGx5VmlzaWJsZUl0ZW1Db3VudDogMTAsXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBpdGVtID0+IGl0ZW0uZGlzcGxheU5hbWUsXG4gICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW0sIHtpbmRleCwgc2VsZWN0ZWQsIHZpc2libGV9KSA9PiB7XG4gICAgICAgIGlmICghdmlzaWJsZSkge1xuICAgICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdwdWxsLXJpZ2h0JylcblxuICAgICAgICBjb25zdCBjb21tYW5kTmFtZSA9IGl0ZW0ua2xhc3MuZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgICB0aGlzLmtleUJpbmRpbmdzRm9yQWN0aXZlRWxlbWVudC5maWx0ZXIoKHtjb21tYW5kfSkgPT4gY29tbWFuZCA9PT0gY29tbWFuZE5hbWUpLmZvckVhY2goa2V5QmluZGluZyA9PiB7XG4gICAgICAgICAgY29uc3Qga2JkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgna2JkJylcbiAgICAgICAgICBrYmQuY2xhc3NMaXN0LmFkZCgna2V5LWJpbmRpbmcnKVxuICAgICAgICAgIGtiZC50ZXh0Q29udGVudCA9IGh1bWFuaXplS2V5c3Ryb2tlKGtleUJpbmRpbmcua2V5c3Ryb2tlcylcbiAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoa2JkKVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgaGlnaGxpZ2h0TWF0Y2hlc0luRWxlbWVudChpdGVtLmRpc3BsYXlOYW1lLCB0aGlzLnNlbGVjdExpc3RWaWV3LmdldFF1ZXJ5KCksIHNwYW4pXG5cbiAgICAgICAgbGkuYXBwZW5kQ2hpbGQoZGl2KVxuICAgICAgICBsaS5hcHBlbmRDaGlsZChzcGFuKVxuICAgICAgICByZXR1cm4gbGlcbiAgICAgIH0sXG4gICAgICBlbXB0eU1lc3NhZ2U6ICdObyBtYXRjaGVzIGZvdW5kJyxcbiAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IGl0ZW0gPT4ge1xuICAgICAgICB0aGlzLmNvbmZpcm1lZCA9IHRydWVcbiAgICAgICAgaWYgKHRoaXMub25Db25maXJtKSB0aGlzLm9uQ29uZmlybShpdGVtKVxuICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb25maXJtZWQpIHJldHVyblxuICAgICAgICBpZiAodGhpcy5vbkNhbmNlbCkgdGhpcy5vbkNhbmNlbCgpXG4gICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUtcGx1cy1zZWxlY3QtbGlzdCcpXG4gIH1cblxuICBzZWxlY3RGcm9tSXRlbXMgKGl0ZW1zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zaG93KHtcbiAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICBvbkNhbmNlbDogcmVzb2x2ZSxcbiAgICAgICAgb25Db25maXJtOiByZXNvbHZlXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBzaG93ICh7aXRlbXMsIG9uQ2FuY2VsLCBvbkNvbmZpcm19KSB7XG4gICAgdGhpcy5rZXlCaW5kaW5nc0ZvckFjdGl2ZUVsZW1lbnQgPSBhdG9tLmtleW1hcHMuZmluZEtleUJpbmRpbmdzKHt0YXJnZXQ6IHRoaXMuYWN0aXZlRWxlbWVudH0pXG5cbiAgICB0aGlzLmNvbmZpcm1lZCA9IGZhbHNlXG4gICAgdGhpcy5vbkNvbmZpcm0gPSBvbkNvbmZpcm1cbiAgICB0aGlzLm9uQ2FuY2VsID0gb25DYW5jZWxcblxuICAgIGlmICghdGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe2l0ZW06IHRoaXMuc2VsZWN0TGlzdFZpZXd9KVxuICAgIH1cbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LnJlc2V0KClcbiAgICBhd2FpdCB0aGlzLnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7aXRlbXN9KVxuXG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgdGhpcy5wYW5lbC5zaG93KClcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKClcbiAgfVxuXG4gIGhpZGUgKCkge1xuICAgIHRoaXMucGFuZWwuaGlkZSgpXG4gICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpXG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGxcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlnaGxpZ2h0TWF0Y2hlc0luRWxlbWVudCAodGV4dCwgcXVlcnksIGVsKSB7XG4gIGNvbnN0IG1hdGNoZXMgPSBmdXp6YWxkcmluUGx1cy5tYXRjaCh0ZXh0LCBxdWVyeSlcbiAgbGV0IG1hdGNoZWRDaGFycyA9IFtdXG4gIGxldCBsYXN0SW5kZXggPSAwXG4gIGZvciAoY29uc3QgbWF0Y2hJbmRleCBvZiBtYXRjaGVzKSB7XG4gICAgY29uc3QgdW5tYXRjaGVkID0gdGV4dC5zdWJzdHJpbmcobGFzdEluZGV4LCBtYXRjaEluZGV4KVxuICAgIGlmICh1bm1hdGNoZWQpIHtcbiAgICAgIGlmIChtYXRjaGVkQ2hhcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBtYXRjaFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgbWF0Y2hTcGFuLmNsYXNzTGlzdC5hZGQoJ2NoYXJhY3Rlci1tYXRjaCcpXG4gICAgICAgIG1hdGNoU3Bhbi50ZXh0Q29udGVudCA9IG1hdGNoZWRDaGFycy5qb2luKCcnKVxuICAgICAgICBlbC5hcHBlbmRDaGlsZChtYXRjaFNwYW4pXG4gICAgICAgIG1hdGNoZWRDaGFycyA9IFtdXG4gICAgICB9XG5cbiAgICAgIGVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHVubWF0Y2hlZCkpXG4gICAgfVxuXG4gICAgbWF0Y2hlZENoYXJzLnB1c2godGV4dFttYXRjaEluZGV4XSlcbiAgICBsYXN0SW5kZXggPSBtYXRjaEluZGV4ICsgMVxuICB9XG5cbiAgaWYgKG1hdGNoZWRDaGFycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbWF0Y2hTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgbWF0Y2hTcGFuLmNsYXNzTGlzdC5hZGQoJ2NoYXJhY3Rlci1tYXRjaCcpXG4gICAgbWF0Y2hTcGFuLnRleHRDb250ZW50ID0gbWF0Y2hlZENoYXJzLmpvaW4oJycpXG4gICAgZWwuYXBwZW5kQ2hpbGQobWF0Y2hTcGFuKVxuICB9XG5cbiAgY29uc3QgdW5tYXRjaGVkID0gdGV4dC5zdWJzdHJpbmcobGFzdEluZGV4KVxuICBpZiAodW5tYXRjaGVkKSB7XG4gICAgZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodW5tYXRjaGVkKSlcbiAgfVxufVxuIl19