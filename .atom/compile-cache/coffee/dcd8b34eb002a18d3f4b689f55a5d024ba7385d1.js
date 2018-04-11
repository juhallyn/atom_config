(function() {
  var _, getVimState;

  _ = require('underscore-plus');

  getVimState = require('./spec-helper').getVimState;

  xdescribe("visual-mode performance", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, _vim;
      });
    });
    afterEach(function() {
      vimState.resetNormalMode();
      return vimState.globalState.reset();
    });
    return describe("slow down editor", function() {
      var measureWithTimeEnd, moveRightAndLeftCheck;
      moveRightAndLeftCheck = function(scenario, modeSig) {
        var moveBySelect, moveByVMP, moveCount;
        console.log([scenario, modeSig, atom.getVersion(), atom.packages.getActivePackage('vim-mode-plus').metadata.version]);
        moveCount = 89;
        switch (scenario) {
          case 'vmp':
            moveByVMP = function() {
              _.times(moveCount, function() {
                return ensure('l');
              });
              return _.times(moveCount, function() {
                return ensure('h');
              });
            };
            return _.times(10, function() {
              return measureWithTimeEnd(moveByVMP);
            });
          case 'sel':
            moveBySelect = function() {
              _.times(moveCount, function() {
                return editor.getLastSelection().selectRight();
              });
              return _.times(moveCount, function() {
                return editor.getLastSelection().selectLeft();
              });
            };
            return _.times(15, function() {
              return measureWithTimeEnd(moveBySelect);
            });
        }
      };
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      beforeEach(function() {
        return set({
          cursor: [0, 0],
          text: "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
        });
      });
      return describe("vmp", function() {
        it("[normal] slow down editor", function() {
          return moveRightAndLeftCheck('vmp', 'moveCount');
        });
        it("[vC] slow down editor", function() {
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          ensure('escape', {
            mode: 'normal'
          });
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          return ensure('escape', {
            mode: 'normal'
          });
        });
        return it("[vC] slow down editor", function() {
          return moveRightAndLeftCheck('sel', 'vC');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9wZXJmb3JtYW5jZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSCxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUVoQixTQUFBLENBQVUseUJBQVYsRUFBcUMsU0FBQTtBQUNuQyxRQUFBO0lBQUEsTUFBaUQsRUFBakQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGVBQWQsRUFBc0Isc0JBQXRCLEVBQXFDO0lBRXJDLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWdCO01BSE4sQ0FBWjtJQURTLENBQVg7SUFNQSxTQUFBLENBQVUsU0FBQTtNQUNSLFFBQVEsQ0FBQyxlQUFULENBQUE7YUFDQSxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQXJCLENBQUE7SUFGUSxDQUFWO1dBSUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUFBLHFCQUFBLEdBQXdCLFNBQUMsUUFBRCxFQUFXLE9BQVg7QUFDdEIsWUFBQTtRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQyxRQUFELEVBQVcsT0FBWCxFQUFvQixJQUFJLENBQUMsVUFBTCxDQUFBLENBQXBCLEVBQXVDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsZUFBL0IsQ0FBK0MsQ0FBQyxRQUFRLENBQUMsT0FBaEcsQ0FBWjtRQUVBLFNBQUEsR0FBWTtBQUNaLGdCQUFPLFFBQVA7QUFBQSxlQUNPLEtBRFA7WUFFSSxTQUFBLEdBQVksU0FBQTtjQUNWLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLE1BQUEsQ0FBTyxHQUFQO2NBQUgsQ0FBbkI7cUJBQ0EsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsTUFBQSxDQUFPLEdBQVA7Y0FBSCxDQUFuQjtZQUZVO21CQUdaLENBQUMsQ0FBQyxLQUFGLENBQVEsRUFBUixFQUFZLFNBQUE7cUJBQUcsa0JBQUEsQ0FBbUIsU0FBbkI7WUFBSCxDQUFaO0FBTEosZUFNTyxLQU5QO1lBT0ksWUFBQSxHQUFlLFNBQUE7Y0FDYixDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDLFdBQTFCLENBQUE7Y0FBSCxDQUFuQjtxQkFDQSxDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDLFVBQTFCLENBQUE7Y0FBSCxDQUFuQjtZQUZhO21CQUdmLENBQUMsQ0FBQyxLQUFGLENBQVEsRUFBUixFQUFZLFNBQUE7cUJBQUcsa0JBQUEsQ0FBbUIsWUFBbkI7WUFBSCxDQUFaO0FBVko7TUFKc0I7TUFnQnhCLGtCQUFBLEdBQXFCLFNBQUMsRUFBRDtRQUNuQixPQUFPLENBQUMsSUFBUixDQUFhLEVBQUUsQ0FBQyxJQUFoQjtRQUNBLEVBQUEsQ0FBQTtlQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQUUsQ0FBQyxJQUFuQjtNQUhtQjtNQUtyQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7VUFDQSxJQUFBLEVBQU0sNEZBRE47U0FERjtNQURTLENBQVg7YUFPQSxRQUFBLENBQVMsS0FBVCxFQUFnQixTQUFBO1FBRWQsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7aUJBQzlCLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLFdBQTdCO1FBRDhCLENBQWhDO1FBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7VUFDMUIsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBQU47V0FBWjtVQUNBLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLElBQTdCO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtVQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsZUFBWCxDQUFOO1dBQVo7VUFDQSxxQkFBQSxDQUFzQixLQUF0QixFQUE2QixJQUE3QjtpQkFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO1FBUDBCLENBQTVCO2VBU0EsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7aUJBRTFCLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLElBQTdCO1FBRjBCLENBQTVCO01BYmMsQ0FBaEI7SUE3QjJCLENBQTdCO0VBYm1DLENBQXJDO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxueGRlc2NyaWJlIFwidmlzdWFsLW1vZGUgcGVyZm9ybWFuY2VcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZX0gPSBfdmltXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgpXG5cbiAgZGVzY3JpYmUgXCJzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrID0gKHNjZW5hcmlvLCBtb2RlU2lnKSAtPlxuICAgICAgY29uc29sZS5sb2cgW3NjZW5hcmlvLCBtb2RlU2lnLCBhdG9tLmdldFZlcnNpb24oKSwgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykubWV0YWRhdGEudmVyc2lvbl1cblxuICAgICAgbW92ZUNvdW50ID0gODlcbiAgICAgIHN3aXRjaCBzY2VuYXJpb1xuICAgICAgICB3aGVuICd2bXAnXG4gICAgICAgICAgbW92ZUJ5Vk1QID0gLT5cbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBlbnN1cmUgJ2wnXG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4gZW5zdXJlICdoJ1xuICAgICAgICAgIF8udGltZXMgMTAsIC0+IG1lYXN1cmVXaXRoVGltZUVuZChtb3ZlQnlWTVApXG4gICAgICAgIHdoZW4gJ3NlbCdcbiAgICAgICAgICBtb3ZlQnlTZWxlY3QgPSAtPlxuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuc2VsZWN0UmlnaHQoKVxuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuc2VsZWN0TGVmdCgpXG4gICAgICAgICAgXy50aW1lcyAxNSwgLT4gbWVhc3VyZVdpdGhUaW1lRW5kKG1vdmVCeVNlbGVjdClcblxuICAgIG1lYXN1cmVXaXRoVGltZUVuZCA9IChmbikgLT5cbiAgICAgIGNvbnNvbGUudGltZShmbi5uYW1lKVxuICAgICAgZm4oKVxuICAgICAgY29uc29sZS50aW1lRW5kKGZuLm5hbWUpXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInZtcFwiLCAtPlxuICAgICAgIyBiZWZvcmVFYWNoIC0+XG4gICAgICBpdCBcIltub3JtYWxdIHNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCd2bXAnLCAnbW92ZUNvdW50JylcbiAgICAgIGl0IFwiW3ZDXSBzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3ZtcCcsICd2QycpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCd2bXAnLCAndkMnKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiW3ZDXSBzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgICAgICMgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygnc2VsJywgJ3ZDJylcbiJdfQ==
