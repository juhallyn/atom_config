(function() {
  var TextData, dispatch, getView, getVimState, ref, settings, withMockPlatform;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView, withMockPlatform = ref.withMockPlatform;

  settings = require('../lib/settings');

  describe("mini DSL used in vim-mode-plus's spec", function() {
    var editor, editorElement, ensure, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4];
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("old exisisting spec options", function() {
      beforeEach(function() {
        return set({
          text: "abc",
          cursor: [0, 0]
        });
      });
      return it("toggle and move right", function() {
        return ensure("~", {
          text: "Abc",
          cursor: [0, 1]
        });
      });
    });
    describe("new 'textC' spec options with explanatory ensure", function() {
      describe("| represent cursor", function() {
        beforeEach(function() {
          set({
            textC: "|abc"
          });
          return ensure(null, {
            text: "abc",
            cursor: [0, 0]
          });
        });
        return it("toggle and move right", function() {
          ensure("~", {
            textC: "A|bc"
          });
          return ensure(null, {
            text: "Abc",
            cursor: [0, 1]
          });
        });
      });
      describe("! represent cursor", function() {
        beforeEach(function() {
          set({
            textC: "!abc"
          });
          return ensure(null, {
            text: "abc",
            cursor: [0, 0]
          });
        });
        return it("toggle and move right", function() {
          ensure("~", {
            textC: "A!bc"
          });
          return ensure(null, {
            text: "Abc",
            cursor: [0, 1]
          });
        });
      });
      return describe("| and ! is exchangable", function() {
        return it("both are OK", function() {
          set({
            textC: "|abc"
          });
          ensure("~", {
            textC: "A!bc"
          });
          set({
            textC: "a!bc"
          });
          return ensure("~", {
            textC: "aB!c"
          });
        });
      });
    });
    return describe("multi-low, multi-cursor case", function() {
      describe("without ! cursor", function() {
        return it("last | become last cursor", function() {
          set({
            textC: "|0: line0\n|1: line1"
          });
          ensure(null, {
            cursor: [[0, 0], [1, 0]]
          });
          return expect(editor.getLastCursor().getBufferPosition()).toEqual([1, 0]);
        });
      });
      describe("with ! cursor", function() {
        return it("! become last cursor", function() {
          set({
            textC: "|012|345|678"
          });
          ensure(null, {
            textC: "|012|345|678"
          });
          ensure(null, {
            cursor: [[0, 0], [0, 3], [0, 6]]
          });
          expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 6]);
          set({
            textC: "!012|345|678"
          });
          ensure(null, {
            textC: "!012|345|678"
          });
          ensure(null, {
            cursor: [[0, 3], [0, 6], [0, 0]]
          });
          expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 0]);
          set({
            textC: "|012!345|678"
          });
          ensure(null, {
            textC: "|012!345|678"
          });
          ensure(null, {
            cursor: [[0, 0], [0, 6], [0, 3]]
          });
          expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 3]);
          set({
            textC: "|012|345!678"
          });
          ensure(null, {
            textC: "|012|345!678"
          });
          ensure(null, {
            cursor: [[0, 0], [0, 3], [0, 6]]
          });
          return expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 6]);
        });
      });
      return describe("without ! cursor", function() {
        beforeEach(function() {
          set({
            textC: "|ab|cde|fg\nhi|jklmn\nopqrstu\n"
          });
          return ensure(null, {
            text: "abcdefg\nhijklmn\nopqrstu\n",
            cursor: [[0, 0], [0, 2], [0, 5], [1, 2]]
          });
        });
        return it("toggle and move right", function() {
          ensure('~', {
            textC: "A|bC|deF|g\nhiJ|klmn\nopqrstu\n"
          });
          return ensure(null, {
            text: "AbCdeFg\nhiJklmn\nopqrstu\n",
            cursor: [[0, 1], [0, 3], [0, 6], [1, 3]]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zcGVjLWhlbHBlci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBK0QsT0FBQSxDQUFRLGVBQVIsQ0FBL0QsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVCQUF4QixFQUFrQyxxQkFBbEMsRUFBMkM7O0VBQzNDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUE7QUFDaEQsUUFBQTtJQUFBLE9BQWlELEVBQWpELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsZ0JBQWQsRUFBc0IsdUJBQXRCLEVBQXFDO0lBRXJDLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWdCO01BSE4sQ0FBWjthQUtBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFERyxDQUFMO0lBTlMsQ0FBWDtJQVNBLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBO01BQ3RDLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUFJO1VBQUEsSUFBQSxFQUFNLEtBQU47VUFBYSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFyQjtTQUFKO01BRFMsQ0FBWDthQUdBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO2VBQzFCLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxJQUFBLEVBQU0sS0FBTjtVQUFhLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXJCO1NBQVo7TUFEMEIsQ0FBNUI7SUFKc0MsQ0FBeEM7SUFPQSxRQUFBLENBQVMsa0RBQVQs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VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlldywgd2l0aE1vY2tQbGF0Zm9ybX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwibWluaSBEU0wgdXNlZCBpbiB2aW0tbW9kZS1wbHVzJ3Mgc3BlY1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmV9ID0gdmltXG5cbiAgICBydW5zIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJvbGQgZXhpc2lzdGluZyBzcGVjIG9wdGlvbnNcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJhYmNcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwidG9nZ2xlIGFuZCBtb3ZlIHJpZ2h0XCIsIC0+XG4gICAgICBlbnN1cmUgXCJ+XCIsIHRleHQ6IFwiQWJjXCIsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgXCJuZXcgJ3RleHRDJyBzcGVjIG9wdGlvbnMgd2l0aCBleHBsYW5hdG9yeSBlbnN1cmVcIiwgLT5cbiAgICBkZXNjcmliZSBcInwgcmVwcmVzZW50IGN1cnNvclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiXG4gICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0OiBcImFiY1wiLCBjdXJzb3I6IFswLCAwXSAjIGV4cGxhbmF0b3J5IHB1cnBvc2VcblxuICAgICAgaXQgXCJ0b2dnbGUgYW5kIG1vdmUgcmlnaHRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiflwiLCB0ZXh0QzogXCJBfGJjXCJcbiAgICAgICAgZW5zdXJlIG51bGwsIHRleHQ6IFwiQWJjXCIsIGN1cnNvcjogWzAsIDFdICMgZXhwbGFuYXRvcnkgcHVycG9zZVxuXG4gICAgZGVzY3JpYmUgXCIhIHJlcHJlc2VudCBjdXJzb3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHRDOiBcIiFhYmNcIlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCJhYmNcIiwgY3Vyc29yOiBbMCwgMF0gIyBleHBsYW5hdG9yeSBwdXJwb3NlXG5cbiAgICAgIGl0IFwidG9nZ2xlIGFuZCBtb3ZlIHJpZ2h0XCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIn5cIiwgdGV4dEM6IFwiQSFiY1wiXG4gICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0OiBcIkFiY1wiLCBjdXJzb3I6IFswLCAxXSAjIGV4cGxhbmF0b3J5IHB1cnBvc2VcblxuICAgIGRlc2NyaWJlIFwifCBhbmQgISBpcyBleGNoYW5nYWJsZVwiLCAtPlxuICAgICAgaXQgXCJib3RoIGFyZSBPS1wiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiXG4gICAgICAgIGVuc3VyZSBcIn5cIiwgdGV4dEM6IFwiQSFiY1wiXG5cbiAgICAgICAgc2V0IHRleHRDOiBcImEhYmNcIlxuICAgICAgICBlbnN1cmUgXCJ+XCIsIHRleHRDOiBcImFCIWNcIlxuXG4gIGRlc2NyaWJlIFwibXVsdGktbG93LCBtdWx0aS1jdXJzb3IgY2FzZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aG91dCAhIGN1cnNvclwiLCAtPlxuICAgICAgaXQgXCJsYXN0IHwgYmVjb21lIGxhc3QgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8MDogbGluZTBcbiAgICAgICAgICB8MTogbGluZTFcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgbnVsbCwgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoWzEsIDBdKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoICEgY3Vyc29yXCIsIC0+XG4gICAgICBpdCBcIiEgYmVjb21lIGxhc3QgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyfDM0NXw2NzhcIlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwifDAxMnwzNDV8Njc4XCJcbiAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogW1swLCAwXSwgWzAsIDNdLCBbMCwgNl1dXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoWzAsIDZdKVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCIhMDEyfDM0NXw2NzhcIlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiITAxMnwzNDV8Njc4XCJcbiAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogW1swLCAzXSwgWzAsIDZdLCBbMCwgMF1dXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoWzAsIDBdKVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyITM0NXw2NzhcIlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwifDAxMiEzNDV8Njc4XCJcbiAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogW1swLCAwXSwgWzAsIDZdLCBbMCwgM11dXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoWzAsIDNdKVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyfDM0NSE2NzhcIlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwifDAxMnwzNDUhNjc4XCJcbiAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogW1swLCAwXSwgWzAsIDNdLCBbMCwgNl1dXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldEJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwoWzAsIDZdKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRob3V0ICEgY3Vyc29yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8YWJ8Y2RlfGZnXG4gICAgICAgICAgaGl8amtsbW5cbiAgICAgICAgICBvcHFyc3R1XFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgIGhpamtsbW5cbiAgICAgICAgICBvcHFyc3R1XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMCwgMl0sIFswLCA1XSwgWzEsIDJdXVxuXG4gICAgICBpdCBcInRvZ2dsZSBhbmQgbW92ZSByaWdodFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ34nLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBBfGJDfGRlRnxnXG4gICAgICAgICAgaGlKfGtsbW5cbiAgICAgICAgICBvcHFyc3R1XFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgQWJDZGVGZ1xuICAgICAgICAgIGhpSmtsbW5cbiAgICAgICAgICBvcHFyc3R1XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDFdLCBbMCwgM10sIFswLCA2XSwgWzEsIDNdXVxuIl19
