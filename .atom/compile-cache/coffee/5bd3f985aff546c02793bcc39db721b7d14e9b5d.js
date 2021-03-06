(function() {
  var IncreaseOperators, IndentOperators, InputOperators, Operators, Put, Replace, _;

  _ = require('underscore-plus');

  IndentOperators = require('./indent-operators');

  IncreaseOperators = require('./increase-operators');

  Put = require('./put-operator');

  InputOperators = require('./input');

  Replace = require('./replace-operator');

  Operators = require('./general-operators');

  Operators.Put = Put;

  Operators.Replace = Replace;

  _.extend(Operators, IndentOperators);

  _.extend(Operators, IncreaseOperators);

  _.extend(Operators, InputOperators);

  module.exports = Operators;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlL2xpYi9vcGVyYXRvcnMvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVI7O0VBQ3BCLEdBQUEsR0FBTSxPQUFBLENBQVEsZ0JBQVI7O0VBQ04sY0FBQSxHQUFpQixPQUFBLENBQVEsU0FBUjs7RUFDakIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxvQkFBUjs7RUFDVixTQUFBLEdBQVksT0FBQSxDQUFRLHFCQUFSOztFQUVaLFNBQVMsQ0FBQyxHQUFWLEdBQWdCOztFQUNoQixTQUFTLENBQUMsT0FBVixHQUFvQjs7RUFDcEIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxTQUFULEVBQW9CLGVBQXBCOztFQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVCxFQUFvQixpQkFBcEI7O0VBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxTQUFULEVBQW9CLGNBQXBCOztFQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBYmpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbkluZGVudE9wZXJhdG9ycyA9IHJlcXVpcmUgJy4vaW5kZW50LW9wZXJhdG9ycydcbkluY3JlYXNlT3BlcmF0b3JzID0gcmVxdWlyZSAnLi9pbmNyZWFzZS1vcGVyYXRvcnMnXG5QdXQgPSByZXF1aXJlICcuL3B1dC1vcGVyYXRvcidcbklucHV0T3BlcmF0b3JzID0gcmVxdWlyZSAnLi9pbnB1dCdcblJlcGxhY2UgPSByZXF1aXJlICcuL3JlcGxhY2Utb3BlcmF0b3InXG5PcGVyYXRvcnMgPSByZXF1aXJlICcuL2dlbmVyYWwtb3BlcmF0b3JzJ1xuXG5PcGVyYXRvcnMuUHV0ID0gUHV0XG5PcGVyYXRvcnMuUmVwbGFjZSA9IFJlcGxhY2Vcbl8uZXh0ZW5kKE9wZXJhdG9ycywgSW5kZW50T3BlcmF0b3JzKVxuXy5leHRlbmQoT3BlcmF0b3JzLCBJbmNyZWFzZU9wZXJhdG9ycylcbl8uZXh0ZW5kKE9wZXJhdG9ycywgSW5wdXRPcGVyYXRvcnMpXG5tb2R1bGUuZXhwb3J0cyA9IE9wZXJhdG9yc1xuIl19
