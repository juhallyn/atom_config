(function() {
  var _, getSearchTerm;

  _ = require('underscore-plus');

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, j, len, modFlags, term_;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (j = 0, len = term_.length; j < len; j++) {
      char = term_[j];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get("vim-mode:useSmartcaseForSearch")) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (error) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  module.exports = {
    findInBuffer: function(buffer, pattern) {
      var found;
      found = [];
      buffer.scan(new RegExp(pattern, 'g'), function(obj) {
        return found.push(obj.range);
      });
      return found;
    },
    findNextInBuffer: function(buffer, curPos, pattern) {
      var found, i, more;
      found = this.findInBuffer(buffer, pattern);
      more = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = found.length; j < len; j++) {
          i = found[j];
          if (i.compare([curPos, curPos]) === 1) {
            results.push(i);
          }
        }
        return results;
      })();
      if (more.length > 0) {
        return more[0].start.row;
      } else if (found.length > 0) {
        return found[0].start.row;
      } else {
        return null;
      }
    },
    findPreviousInBuffer: function(buffer, curPos, pattern) {
      var found, i, less;
      found = this.findInBuffer(buffer, pattern);
      less = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = found.length; j < len; j++) {
          i = found[j];
          if (i.compare([curPos, curPos]) === -1) {
            results.push(i);
          }
        }
        return results;
      })();
      if (less.length > 0) {
        return less[less.length - 1].start.row;
      } else if (found.length > 0) {
        return found[found.length - 1].start.row;
      } else {
        return null;
      }
    },
    scanEditor: function(term, editor, position, reverse) {
      var rangesAfter, rangesBefore, ref;
      if (reverse == null) {
        reverse = false;
      }
      ref = [[], []], rangesBefore = ref[0], rangesAfter = ref[1];
      editor.scan(getSearchTerm(term), function(arg) {
        var isBefore, range;
        range = arg.range;
        if (reverse) {
          isBefore = range.start.compare(position) < 0;
        } else {
          isBefore = range.start.compare(position) <= 0;
        }
        if (isBefore) {
          return rangesBefore.push(range);
        } else {
          return rangesAfter.push(range);
        }
      });
      if (reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2ZpbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLGFBQUEsR0FBZ0IsU0FBQyxJQUFELEVBQU8sU0FBUDtBQUVkLFFBQUE7O01BRnFCLFlBQVk7UUFBQyxHQUFBLEVBQUssSUFBTjs7O0lBRWpDLE9BQUEsR0FBVTtJQUNWLElBQUEsR0FBTztJQUNQLElBQUEsR0FBTztJQUNQLEtBQUEsR0FBUTtJQUNSLElBQUEsR0FBTztBQUNQLFNBQUEsdUNBQUE7O01BQ0UsSUFBRyxJQUFBLEtBQVEsSUFBUixJQUFpQixDQUFJLE9BQXhCO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsSUFBQSxJQUFRLEtBRlY7T0FBQSxNQUFBO1FBSUUsSUFBRyxJQUFBLEtBQVEsR0FBUixJQUFnQixPQUFuQjtVQUNFLElBQUEsR0FBTztVQUNQLElBQUEsR0FBTyxJQUFLLGNBRmQ7U0FBQSxNQUdLLElBQUcsSUFBQSxLQUFRLEdBQVIsSUFBZ0IsT0FBbkI7VUFDSCxJQUFBLEdBQU87VUFDUCxJQUFBLEdBQU8sSUFBSyxjQUZUO1NBQUEsTUFHQSxJQUFHLElBQUEsS0FBVSxJQUFiO1VBQ0gsSUFBQSxJQUFRLEtBREw7O1FBRUwsT0FBQSxHQUFVLE1BWlo7O0FBREY7SUFlQSxJQUFHLElBQUg7TUFDRSxTQUFVLENBQUEsR0FBQSxDQUFWLEdBQWlCLE1BRG5COztJQUVBLElBQUcsQ0FBQyxDQUFJLElBQUosSUFBYSxDQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxDQUFqQixJQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FERCxDQUFBLElBQ3VELElBRDFEO01BRUUsU0FBVSxDQUFBLEdBQUEsQ0FBVixHQUFpQixLQUZuQjs7SUFJ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QSxJQUFHLFFBQUg7aUJBQ0UsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBbEIsRUFERjtTQUFBLE1BQUE7aUJBR0UsV0FBVyxDQUFDLElBQVosQ0FBaUIsS0FBakIsRUFIRjs7TUFOK0IsQ0FBakM7TUFXQSxJQUFHLE9BQUg7ZUFDRSxXQUFXLENBQUMsTUFBWixDQUFtQixZQUFuQixDQUFnQyxDQUFDLE9BQWpDLENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxXQUFXLENBQUMsTUFBWixDQUFtQixZQUFuQixFQUhGOztJQWJVLENBOUJHOztBQXJDakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5nZXRTZWFyY2hUZXJtID0gKHRlcm0sIG1vZGlmaWVycyA9IHsnZyc6IHRydWV9KSAtPlxuXG4gIGVzY2FwZWQgPSBmYWxzZVxuICBoYXNjID0gZmFsc2VcbiAgaGFzQyA9IGZhbHNlXG4gIHRlcm1fID0gdGVybVxuICB0ZXJtID0gJydcbiAgZm9yIGNoYXIgaW4gdGVybV9cbiAgICBpZiBjaGFyIGlzICdcXFxcJyBhbmQgbm90IGVzY2FwZWRcbiAgICAgIGVzY2FwZWQgPSB0cnVlXG4gICAgICB0ZXJtICs9IGNoYXJcbiAgICBlbHNlXG4gICAgICBpZiBjaGFyIGlzICdjJyBhbmQgZXNjYXBlZFxuICAgICAgICBoYXNjID0gdHJ1ZVxuICAgICAgICB0ZXJtID0gdGVybVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpcyAnQycgYW5kIGVzY2FwZWRcbiAgICAgICAgaGFzQyA9IHRydWVcbiAgICAgICAgdGVybSA9IHRlcm1bLi4uLTFdXG4gICAgICBlbHNlIGlmIGNoYXIgaXNudCAnXFxcXCdcbiAgICAgICAgdGVybSArPSBjaGFyXG4gICAgICBlc2NhcGVkID0gZmFsc2VcblxuICBpZiBoYXNDXG4gICAgbW9kaWZpZXJzWydpJ10gPSBmYWxzZVxuICBpZiAobm90IGhhc0MgYW5kIG5vdCB0ZXJtLm1hdGNoKCdbQS1aXScpIGFuZCBcXFxuICAgICAgYXRvbS5jb25maWcuZ2V0KFwidmltLW1vZGU6dXNlU21hcnRjYXNlRm9yU2VhcmNoXCIpKSBvciBoYXNjXG4gICAgbW9kaWZpZXJzWydpJ10gPSB0cnVlXG5cbiAgbW9kRmxhZ3MgPSBPYmplY3Qua2V5cyhtb2RpZmllcnMpLmZpbHRlcigoa2V5KSAtPiBtb2RpZmllcnNba2V5XSkuam9pbignJylcblxuICB0cnlcbiAgICBuZXcgUmVnRXhwKHRlcm0sIG1vZEZsYWdzKVxuICBjYXRjaFxuICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZEZsYWdzKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmluZEluQnVmZmVyIDogKGJ1ZmZlciwgcGF0dGVybikgLT5cbiAgICBmb3VuZCA9IFtdXG4gICAgYnVmZmVyLnNjYW4obmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpLCAob2JqKSAtPiBmb3VuZC5wdXNoIG9iai5yYW5nZSlcbiAgICByZXR1cm4gZm91bmRcblxuICBmaW5kTmV4dEluQnVmZmVyIDogKGJ1ZmZlciwgY3VyUG9zLCBwYXR0ZXJuKSAtPlxuICAgIGZvdW5kID0gQGZpbmRJbkJ1ZmZlcihidWZmZXIsIHBhdHRlcm4pXG4gICAgbW9yZSA9IChpIGZvciBpIGluIGZvdW5kIHdoZW4gaS5jb21wYXJlKFtjdXJQb3MsIGN1clBvc10pIGlzIDEpXG4gICAgaWYgbW9yZS5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gbW9yZVswXS5zdGFydC5yb3dcbiAgICBlbHNlIGlmIGZvdW5kLmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBmb3VuZFswXS5zdGFydC5yb3dcbiAgICBlbHNlXG4gICAgICByZXR1cm4gbnVsbFxuXG4gIGZpbmRQcmV2aW91c0luQnVmZmVyIDogKGJ1ZmZlciwgY3VyUG9zLCBwYXR0ZXJuKSAtPlxuICAgIGZvdW5kID0gQGZpbmRJbkJ1ZmZlcihidWZmZXIsIHBhdHRlcm4pXG4gICAgbGVzcyA9IChpIGZvciBpIGluIGZvdW5kIHdoZW4gaS5jb21wYXJlKFtjdXJQb3MsIGN1clBvc10pIGlzIC0xKVxuICAgIGlmIGxlc3MubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIGxlc3NbbGVzcy5sZW5ndGggLSAxXS5zdGFydC5yb3dcbiAgICBlbHNlIGlmIGZvdW5kLmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBmb3VuZFtmb3VuZC5sZW5ndGggLSAxXS5zdGFydC5yb3dcbiAgICBlbHNlXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICMgUmV0dXJucyBhbiBhcnJheSBvZiByYW5nZXMgb2YgYWxsIG9jY3VyZW5jZXMgb2YgYHRlcm1gIGluIGBlZGl0b3JgLlxuICAjICBUaGUgYXJyYXkgaXMgc29ydGVkIHNvIHRoYXQgdGhlIGZpcnN0IG9jY3VyZW5jZXMgYWZ0ZXIgdGhlIGN1cnNvciBjb21lXG4gICMgIGZpcnN0IChhbmQgdGhlIHNlYXJjaCB3cmFwcyBhcm91bmQpLiBJZiBgcmV2ZXJzZWAgaXMgdHJ1ZSwgdGhlIGFycmF5IGlzXG4gICMgIHJldmVyc2VkIHNvIHRoYXQgdGhlIGZpcnN0IG9jY3VyZW5jZSBiZWZvcmUgdGhlIGN1cnNvciBjb21lcyBmaXJzdC5cbiAgc2NhbkVkaXRvcjogKHRlcm0sIGVkaXRvciwgcG9zaXRpb24sIHJldmVyc2UgPSBmYWxzZSkgLT5cbiAgICBbcmFuZ2VzQmVmb3JlLCByYW5nZXNBZnRlcl0gPSBbW10sIFtdXVxuICAgIGVkaXRvci5zY2FuIGdldFNlYXJjaFRlcm0odGVybSksICh7cmFuZ2V9KSAtPlxuICAgICAgaWYgcmV2ZXJzZVxuICAgICAgICBpc0JlZm9yZSA9IHJhbmdlLnN0YXJ0LmNvbXBhcmUocG9zaXRpb24pIDwgMFxuICAgICAgZWxzZVxuICAgICAgICBpc0JlZm9yZSA9IHJhbmdlLnN0YXJ0LmNvbXBhcmUocG9zaXRpb24pIDw9IDBcblxuICAgICAgaWYgaXNCZWZvcmVcbiAgICAgICAgcmFuZ2VzQmVmb3JlLnB1c2gocmFuZ2UpXG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlc0FmdGVyLnB1c2gocmFuZ2UpXG5cbiAgICBpZiByZXZlcnNlXG4gICAgICByYW5nZXNBZnRlci5jb25jYXQocmFuZ2VzQmVmb3JlKS5yZXZlcnNlKClcbiAgICBlbHNlXG4gICAgICByYW5nZXNBZnRlci5jb25jYXQocmFuZ2VzQmVmb3JlKVxufVxuIl19
