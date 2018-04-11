(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure;
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        var component, initialRowRange;
        component = editor.component;
        component.element.style.height = component.getLineHeight() * 5 + 'px';
        editorElement.measureDimensions();
        initialRowRange = [0, 5];
        set({
          textC: "100\n200\n30|0\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual(initialRowRange);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [3, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(6);
          ensure('2 ctrl-e', {
            cursor: [5, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(8);
          ensure('2 ctrl-y', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(6);
        });
      });
    });
    describe("redraw-cursor-line keybindings", function() {
      var _ensure;
      _ensure = function(keystroke, arg) {
        var moveToFirstChar, scrollTop;
        scrollTop = arg.scrollTop, moveToFirstChar = arg.moveToFirstChar;
        ensure(keystroke);
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(scrollTop);
        if (moveToFirstChar) {
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        } else {
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        }
      };
      beforeEach(function() {
        var j, results;
        editor.setText((function() {
          results = [];
          for (j = 1; j <= 200; j++){ results.push(j); }
          return results;
        }).apply(this).join("\n"));
        editorElement.style.lineHeight = "20px";
        editorElement.setHeight(20 * 10);
        editorElement.measureDimensions();
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        spyOn(editor, 'getFirstVisibleScreenRow').andReturn(90);
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(110);
        return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
          top: 1000,
          left: 0
        });
      });
      describe("at top", function() {
        it("without move cursor", function() {
          return _ensure('z t', {
            scrollTop: 960,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z enter', {
            scrollTop: 960,
            moveToFirstChar: true
          });
        });
      });
      describe("at upper-middle", function() {
        it("without move cursor", function() {
          return _ensure('z u', {
            scrollTop: 950,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z space', {
            scrollTop: 950,
            moveToFirstChar: true
          });
        });
      });
      describe("at middle", function() {
        it("without move cursor", function() {
          return _ensure('z z', {
            scrollTop: 900,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z .', {
            scrollTop: 900,
            moveToFirstChar: true
          });
        });
      });
      return describe("at bottom", function() {
        it("without move cursor", function() {
          return _ensure('z b', {
            scrollTop: 860,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z -', {
            scrollTop: 860,
            moveToFirstChar: true
          });
        });
      });
    });
    return describe("horizontal scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, j, text;
        editorElement.setWidth(600);
        editorElement.setHeight(600);
        editorElement.style.lineHeight = "10px";
        editorElement.style.font = "16px monospace";
        editorElement.measureDimensions();
        text = "";
        for (i = j = 100; j <= 199; i = ++j) {
          text += i + " ";
        }
        editor.setText(text);
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("the zs keybinding", function() {
        var startPosition, zsPos;
        startPosition = null;
        zsPos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          ensure('z s');
          return editorElement.getScrollLeft();
        };
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        xit("does nothing near the start of the line", function() {
          var pos1;
          pos1 = zsPos(1);
          return expect(pos1).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the left edge of the editor", function() {
          var pos10, pos11;
          pos10 = zsPos(10);
          expect(pos10).toBeGreaterThan(startPosition);
          pos11 = zsPos(11);
          return expect(pos11 - pos10).toEqual(10);
        });
        it("does nothing near the end of the line", function() {
          var pos340, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          return expect(pos340).toEqual(posEnd);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zsPos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zsPos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
      return describe("the ze keybinding", function() {
        var startPosition, zePos;
        zePos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          ensure('z e');
          return editorElement.getScrollLeft();
        };
        startPosition = null;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          expect(zePos(1)).toEqual(startPosition);
          return expect(zePos(40)).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          return expect(pos110 - zePos(109)).toEqual(10);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, posEnd;
          posEnd = zePos(399);
          expect(zePos(397)).toBeLessThan(posEnd);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          return expect(zePos(382) - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          expect(zePos(1)).toEqual(startPosition);
          return expect(zePos(10)).toEqual(startPosition);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zY3JvbGwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVI7O0VBRWhCLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUE7QUFDcEIsUUFBQTtJQUFBLE1BQWlELEVBQWpELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxlQUFkLEVBQXNCLHNCQUF0QixFQUFxQztJQUVyQyxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTTtlQUNOLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO01BSlUsQ0FBWjtJQURTLENBQVg7SUFPQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTtNQUNoQyxVQUFBLENBQVcsU0FBQTtBQUNULFlBQUE7UUFBQyxZQUFhO1FBQ2QsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBeEIsR0FBaUMsU0FBUyxDQUFDLGFBQVYsQ0FBQSxDQUFBLEdBQTRCLENBQTVCLEdBQWdDO1FBQ2pFLGFBQWEsQ0FBQyxpQkFBZCxDQUFBO1FBQ0EsZUFBQSxHQUFrQixDQUFDLENBQUQsRUFBSSxDQUFKO1FBRWxCLEdBQUEsQ0FDRTtVQUFBLEtBQUEsRUFBTyxvREFBUDtTQURGO2VBYUEsTUFBQSxDQUFPLGFBQWEsQ0FBQyxrQkFBZCxDQUFBLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxlQUFuRDtNQW5CUyxDQUFYO2FBcUJBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBO2VBQzVDLEVBQUEsQ0FBRywrREFBSCxFQUFvRSxTQUFBO1VBQ2xFLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsTUFBQSxFQUFR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QixDQUFDLE9BQTVCLENBQW9DLEVBQXBDO1FBTG9ELENBQXREO2VBT0EsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUE7VUFDeEMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxPQUFmO1VBQ0EsYUFBQSxHQUFnQixhQUFhLENBQUMsYUFBZCxDQUFBO1VBQ2hCLE1BQUEsQ0FBTyxLQUFBLENBQU0sQ0FBTixDQUFQLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsYUFBekI7aUJBQ0EsTUFBQSxDQUFPLEtBQUEsQ0FBTSxFQUFOLENBQVAsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQixhQUExQjtRQUp3QyxDQUExQztNQTVCNEIsQ0FBOUI7SUExRCtDLENBQWpEO0VBakZvQixDQUF0QjtBQUZBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiU2Nyb2xsaW5nXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICBkZXNjcmliZSBcInNjcm9sbGluZyBrZXliaW5kaW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHtjb21wb25lbnR9ID0gZWRpdG9yXG4gICAgICBjb21wb25lbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBjb21wb25lbnQuZ2V0TGluZUhlaWdodCgpICogNSArICdweCdcbiAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuICAgICAgaW5pdGlhbFJvd1JhbmdlID0gWzAsIDVdXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMTAwXG4gICAgICAgICAgMjAwXG4gICAgICAgICAgMzB8MFxuICAgICAgICAgIDQwMFxuICAgICAgICAgIDUwMFxuICAgICAgICAgIDYwMFxuICAgICAgICAgIDcwMFxuICAgICAgICAgIDgwMFxuICAgICAgICAgIDkwMFxuICAgICAgICAgIDEwMDBcbiAgICAgICAgXCJcIlwiXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRWaXNpYmxlUm93UmFuZ2UoKSkudG9FcXVhbChpbml0aWFsUm93UmFuZ2UpXG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLWUgYW5kIGN0cmwteSBrZXliaW5kaW5nc1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHVwIGFuZCBkb3duIGJ5IG9uZSBhbmQga2VlcHMgY3Vyc29yIG9uc2NyZWVuXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1lJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAxXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA2XG5cbiAgICAgICAgZW5zdXJlICcyIGN0cmwtZScsIGN1cnNvcjogWzUsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgM1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgOFxuXG4gICAgICAgIGVuc3VyZSAnMiBjdHJsLXknLCBjdXJzb3I6IFs0LCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDFcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDZcblxuICBkZXNjcmliZSBcInJlZHJhdy1jdXJzb3ItbGluZSBrZXliaW5kaW5nc1wiLCAtPlxuICAgIF9lbnN1cmUgPSAoa2V5c3Ryb2tlLCB7c2Nyb2xsVG9wLCBtb3ZlVG9GaXJzdENoYXJ9KSAtPlxuICAgICAgZW5zdXJlKGtleXN0cm9rZSlcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoc2Nyb2xsVG9wKVxuICAgICAgaWYgbW92ZVRvRmlyc3RDaGFyXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBbMS4uMjAwXS5qb2luKFwiXFxuXCIpXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjIwcHhcIlxuXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCgyMCAqIDEwKVxuICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG5cbiAgICAgIHNweU9uKGVkaXRvciwgJ21vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lJylcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdzZXRTY3JvbGxUb3AnKVxuICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDkwKVxuICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMTEwKVxuICAgICAgc3B5T24oZWRpdG9yRWxlbWVudCwgJ3BpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbicpLmFuZFJldHVybih7dG9wOiAxMDAwLCBsZWZ0OiAwfSlcblxuICAgIGRlc2NyaWJlIFwiYXQgdG9wXCIsIC0+XG4gICAgICBpdCBcIndpdGhvdXQgbW92ZSBjdXJzb3JcIiwgLT4gICBfZW5zdXJlICd6IHQnLCAgICAgc2Nyb2xsVG9wOiA5NjAsIG1vdmVUb0ZpcnN0Q2hhcjogZmFsc2VcbiAgICAgIGl0IFwid2l0aCBtb3ZlIHRvIDFzdCBjaGFyXCIsIC0+IF9lbnN1cmUgJ3ogZW50ZXInLCBzY3JvbGxUb3A6IDk2MCwgbW92ZVRvRmlyc3RDaGFyOiB0cnVlXG4gICAgZGVzY3JpYmUgXCJhdCB1cHBlci1taWRkbGVcIiwgLT5cbiAgICAgIGl0IFwid2l0aG91dCBtb3ZlIGN1cnNvclwiLCAtPiAgIF9lbnN1cmUgJ3ogdScsICAgICBzY3JvbGxUb3A6IDk1MCwgbW92ZVRvRmlyc3RDaGFyOiBmYWxzZVxuICAgICAgaXQgXCJ3aXRoIG1vdmUgdG8gMXN0IGNoYXJcIiwgLT4gX2Vuc3VyZSAneiBzcGFjZScsIHNjcm9sbFRvcDogOTUwLCBtb3ZlVG9GaXJzdENoYXI6IHRydWVcbiAgICBkZXNjcmliZSBcImF0IG1pZGRsZVwiLCAtPlxuICAgICAgaXQgXCJ3aXRob3V0IG1vdmUgY3Vyc29yXCIsIC0+ICAgX2Vuc3VyZSAneiB6JywgICAgIHNjcm9sbFRvcDogOTAwLCBtb3ZlVG9GaXJzdENoYXI6IGZhbHNlXG4gICAgICBpdCBcIndpdGggbW92ZSB0byAxc3QgY2hhclwiLCAtPiBfZW5zdXJlICd6IC4nLCAgICAgc2Nyb2xsVG9wOiA5MDAsIG1vdmVUb0ZpcnN0Q2hhcjogdHJ1ZVxuICAgIGRlc2NyaWJlIFwiYXQgYm90dG9tXCIsIC0+XG4gICAgICBpdCBcIndpdGhvdXQgbW92ZSBjdXJzb3JcIiwgLT4gICBfZW5zdXJlICd6IGInLCAgICAgc2Nyb2xsVG9wOiA4NjAsIG1vdmVUb0ZpcnN0Q2hhcjogZmFsc2VcbiAgICAgIGl0IFwid2l0aCBtb3ZlIHRvIDFzdCBjaGFyXCIsIC0+IF9lbnN1cmUgJ3ogLScsICAgICBzY3JvbGxUb3A6IDg2MCwgbW92ZVRvRmlyc3RDaGFyOiB0cnVlXG5cbiAgZGVzY3JpYmUgXCJob3Jpem9udGFsIHNjcm9sbCBjdXJzb3Iga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDYwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDYwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUubGluZUhlaWdodCA9IFwiMTBweFwiXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmZvbnQgPSBcIjE2cHggbW9ub3NwYWNlXCJcbiAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuXG4gICAgICB0ZXh0ID0gXCJcIlxuICAgICAgZm9yIGkgaW4gWzEwMC4uMTk5XVxuICAgICAgICB0ZXh0ICs9IFwiI3tpfSBcIlxuICAgICAgZWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBkZXNjcmliZSBcInRoZSB6cyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBzdGFydFBvc2l0aW9uID0gbnVsbFxuXG4gICAgICB6c1BvcyA9IChwb3MpIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgcG9zXSlcbiAgICAgICAgZW5zdXJlICd6IHMnXG4gICAgICAgIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgICMgRklYTUU6IHJlbW92ZSBpbiBmdXR1cmVcbiAgICAgIHhpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBzdGFydCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3MxID0genNQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRoZSBuZWFyZXN0IGl0IGNhbiB0byB0aGUgbGVmdCBlZGdlIG9mIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgICAgcG9zMTAgPSB6c1BvcygxMClcbiAgICAgICAgZXhwZWN0KHBvczEwKS50b0JlR3JlYXRlclRoYW4oc3RhcnRQb3NpdGlvbilcblxuICAgICAgICBwb3MxMSA9IHpzUG9zKDExKVxuICAgICAgICBleHBlY3QocG9zMTEgLSBwb3MxMCkudG9FcXVhbCgxMClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvc0VuZCA9IHpzUG9zKDM5OSlcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTldXG5cbiAgICAgICAgcG9zMzkwID0genNQb3MoMzkwKVxuICAgICAgICBleHBlY3QocG9zMzkwKS50b0VxdWFsKHBvc0VuZClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTBdXG5cbiAgICAgICAgcG9zMzQwID0genNQb3MoMzQwKVxuICAgICAgICBleHBlY3QocG9zMzQwKS50b0VxdWFsKHBvc0VuZClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgYWxsIGxpbmVzIGFyZSBzaG9ydFwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnc2hvcnQnKVxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICAgICAgcG9zMSA9IHpzUG9zKDEpXG4gICAgICAgIGV4cGVjdChwb3MxKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMV1cbiAgICAgICAgcG9zMTAgPSB6c1BvcygxMClcbiAgICAgICAgZXhwZWN0KHBvczEwKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwidGhlIHplIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIHplUG9zID0gKHBvcykgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCBwb3NdKVxuICAgICAgICBlbnN1cmUgJ3ogZSdcbiAgICAgICAgZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgc3RhcnRQb3NpdGlvbiA9IG51bGxcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgZXhwZWN0KHplUG9zKDEpKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdCh6ZVBvcyg0MCkpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRoZSBuZWFyZXN0IGl0IGNhbiB0byB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICAgIHBvczExMCA9IHplUG9zKDExMClcbiAgICAgICAgZXhwZWN0KHBvczExMCkudG9CZUdyZWF0ZXJUaGFuKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChwb3MxMTAgLSB6ZVBvcygxMDkpKS50b0VxdWFsKDEwKVxuXG4gICAgICAjIEZJWE1FIGRlc2NyaXB0aW9uIGlzIG5vIGxvbmdlciBhcHByb3ByaWF0ZVxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgd2hlbiB2ZXJ5IG5lYXIgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3NFbmQgPSB6ZVBvcygzOTkpXG4gICAgICAgIGV4cGVjdCh6ZVBvcygzOTcpKS50b0JlTGVzc1RoYW4ocG9zRW5kKVxuICAgICAgICBwb3MzODAgPSB6ZVBvcygzODApXG4gICAgICAgIGV4cGVjdChwb3MzODApLnRvQmVMZXNzVGhhbihwb3NFbmQpXG4gICAgICAgIGV4cGVjdCh6ZVBvcygzODIpIC0gcG9zMzgwKS50b0VxdWFsKDE5KVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiBhbGwgbGluZXMgYXJlIHNob3J0XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdzaG9ydCcpXG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgICAgICBleHBlY3QoemVQb3MoMSkpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KHplUG9zKDEwKSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuIl19
