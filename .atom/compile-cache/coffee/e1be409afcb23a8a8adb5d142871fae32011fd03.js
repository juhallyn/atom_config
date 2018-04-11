(function() {
  var getView, getVimState, packageName, ref;

  ref = require('./spec-helper'), getVimState = ref.getVimState, getView = ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, ref1, set, vimState, workspaceElement;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4], workspaceElement = ref1[5];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure(null, {
          mode: 'normal'
        });
      });
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tbW9kZS1wbHVzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUF5QixPQUFBLENBQVEsZUFBUixDQUF6QixFQUFDLDZCQUFELEVBQWM7O0VBRWQsV0FBQSxHQUFjOztFQUNkLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7QUFDeEIsUUFBQTtJQUFBLE9BQW1FLEVBQW5FLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsZ0JBQWQsRUFBc0IsdUJBQXRCLEVBQXFDLGtCQUFyQyxFQUErQztJQUUvQyxVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLFNBQUQsRUFBWSxHQUFaO1FBQ1YsUUFBQSxHQUFXO1FBQ1YseUJBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFnQjtNQUhOLENBQVo7TUFLQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWI7YUFFbkIsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFlBQTlCO01BRGMsQ0FBaEI7SUFSUyxDQUFYO0lBV0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtNQUNwQixFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtlQUN4RCxNQUFBLENBQU8sSUFBUCxFQUFhO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FBYjtNQUR3RCxDQUExRDthQUdBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO0FBQ2pELFlBQUE7UUFBQSxhQUFBLEdBQWdCO1FBRWhCLFFBQUEsQ0FBUyxTQUFBO2lCQUNQLGFBQUEsR0FBZ0IsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsMkJBQS9CO1FBRFQsQ0FBVDtlQUdBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsTUFBQSxDQUFPLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxDQUFDLElBQWxDLENBQXVDLEdBQXZDO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQVo7aUJBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxDQUFDLElBQWxDLENBQXVDLEdBQXZDO1FBSEcsQ0FBTDtNQU5pRCxDQUFuRDtJQUpvQixDQUF0QjtXQWVBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7TUFDdEIsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7UUFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyxXQUFoQztRQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXhCLENBQWlDLGVBQWpDLENBQVAsQ0FBeUQsQ0FBQyxJQUExRCxDQUErRCxLQUEvRDtlQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXhCLENBQWlDLGFBQWpDLENBQVAsQ0FBdUQsQ0FBQyxJQUF4RCxDQUE2RCxLQUE3RDtNQUg0QyxDQUE5QzthQUtBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBO0FBQ3JELFlBQUE7UUFBQSxXQUFBLEdBQWMsU0FBQTtpQkFDWixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQWQsQ0FBMkI7WUFBQSxNQUFBLEVBQVEsYUFBUjtXQUEzQixDQUFpRCxDQUFDLE1BQWxELENBQXlELFNBQUMsR0FBRDttQkFDdkQsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFULENBQW9CLGdCQUFwQjtVQUR1RCxDQUF6RDtRQURZO1FBSWQsTUFBQSxDQUFPLFdBQUEsQ0FBQSxDQUFhLENBQUMsTUFBckIsQ0FBNEIsQ0FBQyxlQUE3QixDQUE2QyxDQUE3QztRQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0MsV0FBaEM7ZUFDQSxNQUFBLENBQU8sV0FBQSxDQUFBLENBQWEsQ0FBQyxNQUFyQixDQUE0QixDQUFDLElBQTdCLENBQWtDLENBQWxDO01BUHFELENBQXZEO0lBTnNCLENBQXhCO0VBN0J3QixDQUExQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbnBhY2thZ2VOYW1lID0gJ3ZpbS1tb2RlLXBsdXMnXG5kZXNjcmliZSBcInZpbS1tb2RlLXBsdXNcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlLCB3b3Jrc3BhY2VFbGVtZW50XSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChfdmltU3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gX3ZpbVN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IF92aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlfSA9IHZpbVxuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdzdGF0dXMtYmFyJylcblxuICBkZXNjcmliZSBcIi5hY3RpdmF0ZVwiLCAtPlxuICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGluIG5vcm1hbC1tb2RlIGluaXRpYWxseSBieSBkZWZhdWx0XCIsIC0+XG4gICAgICBlbnN1cmUgbnVsbCwgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwic2hvd3MgdGhlIGN1cnJlbnQgdmltIG1vZGUgaW4gdGhlIHN0YXR1cyBiYXJcIiwgLT5cbiAgICAgIHN0YXR1c0JhclRpbGUgPSBudWxsXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIHN0YXR1c0JhclRpbGUgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhdHVzLWJhci12aW0tbW9kZS1wbHVzXCIpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHN0YXR1c0JhclRpbGUudGV4dENvbnRlbnQpLnRvQmUoXCJOXCIpXG4gICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGV4cGVjdChzdGF0dXNCYXJUaWxlLnRleHRDb250ZW50KS50b0JlKFwiSVwiKVxuXG4gIGRlc2NyaWJlIFwiLmRlYWN0aXZhdGVcIiwgLT5cbiAgICBpdCBcInJlbW92ZXMgdGhlIHZpbSBjbGFzc2VzIGZyb20gdGhlIGVkaXRvclwiLCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrYWdlTmFtZSlcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcInZpbS1tb2RlLXBsdXNcIikpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJub3JtYWwtbW9kZVwiKSkudG9CZShmYWxzZSlcblxuICAgIGl0IFwicmVtb3ZlcyB0aGUgdmltIGNvbW1hbmRzIGZyb20gdGhlIGVkaXRvciBlbGVtZW50XCIsIC0+XG4gICAgICB2aW1Db21tYW5kcyA9IC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZmluZENvbW1hbmRzKHRhcmdldDogZWRpdG9yRWxlbWVudCkuZmlsdGVyIChjbWQpIC0+XG4gICAgICAgICAgY21kLm5hbWUuc3RhcnRzV2l0aChcInZpbS1tb2RlLXBsdXM6XCIpXG5cbiAgICAgIGV4cGVjdCh2aW1Db21tYW5kcygpLmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuKDApXG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICAgICAgZXhwZWN0KHZpbUNvbW1hbmRzKCkubGVuZ3RoKS50b0JlKDApXG4iXX0=
