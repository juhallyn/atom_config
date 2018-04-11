(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe("dirty work for fast package activation", function() {
    var ensureRequiredFiles, withCleanActivation;
    withCleanActivation = null;
    ensureRequiredFiles = null;
    beforeEach(function() {
      return runs(function() {
        var cleanRequireCache, getRequiredLibOrNodeModulePaths, packPath;
        packPath = atom.packages.loadPackage('vim-mode-plus').path;
        getRequiredLibOrNodeModulePaths = function() {
          return Object.keys(require.cache).filter(function(p) {
            return p.startsWith(packPath + 'lib') || p.startsWith(packPath + 'node_modules');
          });
        };
        cleanRequireCache = function() {
          var oldPaths, savedCache;
          savedCache = {};
          oldPaths = getRequiredLibOrNodeModulePaths();
          oldPaths.forEach(function(p) {
            savedCache[p] = require.cache[p];
            return delete require.cache[p];
          });
          return function() {
            oldPaths.forEach(function(p) {
              return require.cache[p] = savedCache[p];
            });
            return getRequiredLibOrNodeModulePaths().forEach(function(p) {
              if (indexOf.call(oldPaths, p) < 0) {
                return delete require.cache[p];
              }
            });
          };
        };
        withCleanActivation = function(fn) {
          var restoreRequireCache;
          restoreRequireCache = null;
          runs(function() {
            return restoreRequireCache = cleanRequireCache();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('vim-mode-plus').then(fn);
          });
          return runs(function() {
            return restoreRequireCache();
          });
        };
        return ensureRequiredFiles = function(files) {
          var should;
          should = files.map(function(file) {
            return packPath + file;
          });
          return expect(getRequiredLibOrNodeModulePaths()).toEqual(should);
        };
      });
    });
    describe("requrie as minimum num of file as possible on startup", function() {
      var shouldRequireFilesInOrdered;
      shouldRequireFilesInOrdered = null;
      beforeEach(function() {
        shouldRequireFilesInOrdered = ["lib/main.js", "lib/settings.js", "lib/vim-state.js", "lib/json/command-table.json"];
        if (atom.inDevMode()) {
          return shouldRequireFilesInOrdered.push('lib/developer.js');
        }
      });
      it("THIS IS WORKAROUND FOR Travis-CI's", function() {
        return withCleanActivation(function() {
          return null;
        });
      });
      it("require minimum set of files", function() {
        return withCleanActivation(function() {
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("[one editor opened] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open();
          });
          return runs(function() {
            var files;
            files = shouldRequireFilesInOrdered.concat('lib/status-bar-manager.js');
            return ensureRequiredFiles(files);
          });
        });
      });
      it("[after motion executed] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open().then(function(e) {
              return atom.commands.dispatch(e.element, 'vim-mode-plus:move-right');
            });
          });
          return runs(function() {
            var extraShouldRequireFilesInOrdered, files;
            extraShouldRequireFilesInOrdered = ["lib/status-bar-manager.js", "lib/operation-stack.js", "lib/base.js", "lib/json/file-table.json", "lib/motion.js", "lib/utils.js", "lib/cursor-style-manager.js"];
            files = shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered);
            return ensureRequiredFiles(files);
          });
        });
      });
      it("just referencing service function doesn't load base.js", function() {
        return withCleanActivation(function(pack) {
          var i, key, len, ref, service;
          service = pack.mainModule.provideVimModePlus();
          ref = Object.keys(service);
          for (i = 0, len = ref.length; i < len; i++) {
            key = ref[i];
            service.key;
          }
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("calling service.getClass load base.js", function() {
        return withCleanActivation(function(pack) {
          var extraShouldRequireFilesInOrdered, service;
          service = pack.mainModule.provideVimModePlus();
          service.getClass("MoveRight");
          extraShouldRequireFilesInOrdered = ["lib/base.js", "lib/json/file-table.json", "lib/motion.js"];
          return ensureRequiredFiles(shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered));
        });
      });
      return it("calling service.registerCommandFromSpec doesn't load base.js", function() {
        return withCleanActivation(function(pack) {
          var service;
          service = pack.mainModule.provideVimModePlus();
          service.registerCommandFromSpec("SampleCommand", {
            prefix: 'vim-mode-plus-user',
            getClass: function() {
              return "SampleCommand";
            }
          });
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
    });
    return describe("command-table", function() {
      describe("initial classRegistry", function() {
        return it("is empty", function() {
          return withCleanActivation(function(pack) {
            var Base;
            Base = require('../lib/base');
            return expect(Base.classByName.size).toBe(0);
          });
        });
      });
      describe("fully populated Base.classByName", function() {
        return it("Base.getClass(motionClass) populate class table for all members belonging to same file(motions)", function() {
          return withCleanActivation(function(pack) {
            var Base, fileTable;
            Base = require('../lib/base');
            expect(Base.classByName.size).toBe(0);
            Base.getClass("MoveRight");
            fileTable = require("../lib/json/file-table.json");
            expect(fileTable["./motion"].length).toBe(Base.classByName.size);
            return expect(Base.classByName.size > 0).toBe(true);
          });
        });
      });
      return describe("make sure command-table and file-table is NOT out-of-date", function() {
        return it("buildCommandTable return table which is equals to initially loaded command table", function() {
          return withCleanActivation(function(pack) {
            var Base, commandTable, developer, fileTable, oldCommandTable, oldFileTable, ref;
            Base = require('../lib/base');
            oldCommandTable = require("../lib/json/command-table.json");
            oldFileTable = require("../lib/json/file-table.json");
            developer = require("../lib/developer");
            ref = developer.buildCommandTableAndFileTable(), commandTable = ref.commandTable, fileTable = ref.fileTable;
            expect(oldCommandTable).not.toBe(commandTable);
            expect(oldCommandTable).toEqual(commandTable);
            expect(oldFileTable).not.toBe(fileTable);
            return expect(oldFileTable).toEqual(fileTable);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9mYXN0LWFjdGl2YXRpb24tc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0JBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQTtBQUNqRCxRQUFBO0lBQUEsbUJBQUEsR0FBc0I7SUFDdEIsbUJBQUEsR0FBc0I7SUFFdEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxJQUFBLENBQUssU0FBQTtBQUNILFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLGVBQTFCLENBQTBDLENBQUM7UUFFdEQsK0JBQUEsR0FBa0MsU0FBQTtpQkFDaEMsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsS0FBcEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxTQUFDLENBQUQ7bUJBQ2hDLENBQUMsQ0FBQyxVQUFGLENBQWEsUUFBQSxHQUFXLEtBQXhCLENBQUEsSUFBa0MsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxRQUFBLEdBQVcsY0FBeEI7VUFERixDQUFsQztRQURnQztRQUtsQyxpQkFBQSxHQUFvQixTQUFBO0FBQ2xCLGNBQUE7VUFBQSxVQUFBLEdBQWE7VUFDYixRQUFBLEdBQVcsK0JBQUEsQ0FBQTtVQUNYLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRDtZQUNmLFVBQVcsQ0FBQSxDQUFBLENBQVgsR0FBZ0IsT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBO21CQUM5QixPQUFPLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQTtVQUZOLENBQWpCO0FBSUEsaUJBQU8sU0FBQTtZQUNMLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRDtxQkFDZixPQUFPLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBZCxHQUFtQixVQUFXLENBQUEsQ0FBQTtZQURmLENBQWpCO21C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RCxFQUFlO1lBRWYsTUFBQSxDQUFPLGVBQVAsQ0FBdUIsQ0FBQyxHQUFHLENBQUMsSUFBNUIsQ0FBaUMsWUFBakM7WUFDQSxNQUFBLENBQU8sZUFBUCxDQUF1QixDQUFDLE9BQXhCLENBQWdDLFlBQWhDO1lBRUEsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxHQUFHLENBQUMsSUFBekIsQ0FBOEIsU0FBOUI7bUJBQ0EsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QixTQUE3QjtVQVprQixDQUFwQjtRQURxRixDQUF2RjtNQURvRSxDQUF0RTtJQXZCd0IsQ0FBMUI7RUExSGlELENBQW5EO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIjIFtEQU5HRVJdXG4jIFdoYXQgSSdtIGRvaW5nIGluIHRoaXMgdGVzdC1zcGVjIGlzIFNVUEVSIGhhY2t5LCBhbmQgSSBkb24ndCBsaWtlIHRoaXMuXG4jXG4jIC0gV2hhdCBJJ20gZG9pbmcgYW5kIHdoeVxuIyAgLSBJbnZhbGlkYXRlIHJlcXVpcmUuY2FjaGUgdG8gXCJvYnNlcnZlIHJlcXVpcmVkIGZpbGUgb24gc3RhcnR1cFwiLlxuIyAgLSBUaGVuIHJlc3RvcmUgcmVxdWlyZS5jYWNoZSB0byBvcmlnaW5hbCBzdGF0ZS5cbiNcbiMgLSBKdXN0IGludmFsaWRhdGluZyBpcyBub3QgZW5vdWdoIHVubGVzcyByZXN0b3JlaW5nIG90aGVyIHNwZWMgZmlsZSBmYWlsLlxuI1xuIyAtIFdoYXQgaGFwcGVucyBqdXN0IGludmFsaWRhdGUgcmVxdWlyZS5jYWNoZSBhbmQgTk9UIHJlc3RvcmVkIHRvIG9yaWdpbmFsIHJlcXVpcmUuY2FjaGU/XG4jICAtIEZvciBtb2R1bGUgc3VjaCBsaWtlIGBnbG9ibGFsLXN0YXRlLmNvZmZlZWAgaXQgaW5zdGFudGlhdGVkIGF0IHJlcXVpcmVkIHRpbWUuXG4jICAtIEludmFsaWRhdGluZyByZXF1aXJlLmNhY2hlIGZvciBgZ2xvYmFsLXN0YXRlLmNvZmZlZWAgbWVhbnMsIGl0J3MgcmVsb2FkZWQgYWdhaW4uXG4jICAtIFRoaXMgMm5kIHJlbG9hZCByZXR1cm4gRElGRkVSRU5UIGdsb2JhbFN0YXRlIGluc3RhbmNlLlxuIyAgLSBTbyBnbG9iYWxTdGF0ZSBpcyBub3cgbm8gbG9uZ2VyIGdsb2JhbGx5IHJlZmVyZW5jaW5nIHNhbWUgc2FtZSBvYmplY3QsIGl0J3MgYnJva2VuLlxuIyAgLSBUaGlzIHNpdHVhdGlvbiBpcyBjYXVzZWQgYnkgZXhwbGljaXQgY2FjaGUgaW52YWxpZGF0aW9uIGFuZCBub3QgaGFwcGVuIGluIHJlYWwgdXNhZ2UuXG4jXG4jIC0gSSBrbm93IHRoaXMgc3BlYyBpcyBzdGlsbCBzdXBlciBoYWNreSBhbmQgSSB3YW50IHRvIGZpbmQgc2FmZXIgd2F5LlxuIyAgLSBCdXQgSSBuZWVkIHRoaXMgc3BlYyB0byBkZXRlY3QgdW53YW50ZWQgZmlsZSBpcyByZXF1aXJlZCBhdCBzdGFydHVwKCB2bXAgZ2V0IHNsb3dlciBzdGFydHVwICkuXG5kZXNjcmliZSBcImRpcnR5IHdvcmsgZm9yIGZhc3QgcGFja2FnZSBhY3RpdmF0aW9uXCIsIC0+XG4gIHdpdGhDbGVhbkFjdGl2YXRpb24gPSBudWxsXG4gIGVuc3VyZVJlcXVpcmVkRmlsZXMgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHJ1bnMgLT5cbiAgICAgIHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgndmltLW1vZGUtcGx1cycpLnBhdGhcblxuICAgICAgZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocyA9IC0+XG4gICAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpLmZpbHRlciAocCkgLT5cbiAgICAgICAgICBwLnN0YXJ0c1dpdGgocGFja1BhdGggKyAnbGliJykgb3IgcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgJ25vZGVfbW9kdWxlcycpXG5cbiAgICAgICMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmUgb3JpZ2luYWwgcmVxdWlyZS5jYWNoZSBvZiBpbnRlcmVzdFxuICAgICAgY2xlYW5SZXF1aXJlQ2FjaGUgPSAtPlxuICAgICAgICBzYXZlZENhY2hlID0ge31cbiAgICAgICAgb2xkUGF0aHMgPSBnZXRSZXF1aXJlZExpYk9yTm9kZU1vZHVsZVBhdGhzKClcbiAgICAgICAgb2xkUGF0aHMuZm9yRWFjaCAocCkgLT5cbiAgICAgICAgICBzYXZlZENhY2hlW3BdID0gcmVxdWlyZS5jYWNoZVtwXVxuICAgICAgICAgIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdXG5cbiAgICAgICAgcmV0dXJuIC0+XG4gICAgICAgICAgb2xkUGF0aHMuZm9yRWFjaCAocCkgLT5cbiAgICAgICAgICAgIHJlcXVpcmUuY2FjaGVbcF0gPSBzYXZlZENhY2hlW3BdXG4gICAgICAgICAgZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgICBpZiBwIG5vdCBpbiBvbGRQYXRoc1xuICAgICAgICAgICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXVxuXG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uID0gKGZuKSAtPlxuICAgICAgICByZXN0b3JlUmVxdWlyZUNhY2hlID0gbnVsbFxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSA9IGNsZWFuUmVxdWlyZUNhY2hlKClcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS50aGVuKGZuKVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSgpXG5cbiAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMgPSAoZmlsZXMpIC0+XG4gICAgICAgIHNob3VsZCA9IGZpbGVzLm1hcCgoZmlsZSkgLT4gcGFja1BhdGggKyBmaWxlKVxuXG4gICAgICAgICMgY29uc29sZS5sb2cgXCIjIHNob3VsZFwiLCBzaG91bGQuam9pbihcIlxcblwiKVxuICAgICAgICAjIGNvbnNvbGUubG9nIFwiIyBhY3R1YWxcIiwgZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpLmpvaW4oXCJcXG5cIilcblxuICAgICAgICBleHBlY3QoZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpKS50b0VxdWFsKHNob3VsZClcblxuICAjICogVG8gcmVkdWNlIElPIGFuZCBjb21waWxlLWV2YWx1YXRpb24gb2YganMgZmlsZSBvbiBzdGFydHVwXG4gIGRlc2NyaWJlIFwicmVxdXJpZSBhcyBtaW5pbXVtIG51bSBvZiBmaWxlIGFzIHBvc3NpYmxlIG9uIHN0YXJ0dXBcIiwgLT5cbiAgICBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQgPSBbXG4gICAgICAgIFwibGliL21haW4uanNcIlxuICAgICAgICBcImxpYi9zZXR0aW5ncy5qc1wiXG4gICAgICAgIFwibGliL3ZpbS1zdGF0ZS5qc1wiXG4gICAgICAgIFwibGliL2pzb24vY29tbWFuZC10YWJsZS5qc29uXCJcbiAgICAgIF1cbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgICAgc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLnB1c2goJ2xpYi9kZXZlbG9wZXIuanMnKVxuXG4gICAgaXQgXCJUSElTIElTIFdPUktBUk9VTkQgRk9SIFRyYXZpcy1DSSdzXCIsIC0+XG4gICAgICAjIEhBQ0s6XG4gICAgICAjIEFmdGVyIHZlcnkgZmlyc3QgY2FsbCBvZiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpXG4gICAgICAjIHJlcXVpcmUuY2FjaGUgaXMgTk9UIHBvcHVsYXRlZCB5ZXQgb24gVHJhdmlzLUNJLlxuICAgICAgIyBJdCBkb2Vzbid0IGluY2x1ZGUgbGliL21haW4uY29mZmVlKCB0aGlzIGlzIG9kZCBzdGF0ZSEgKS5cbiAgICAgICMgVGhpcyBvbmx5IGhhcHBlbnMgaW4gdmVyeSBmaXJzdCBhY3RpdmF0aW9uLlxuICAgICAgIyBTbyBwdXRpbmcgaGVyZSB1c2VsZXNzIHRlc3QganVzdCBhY3RpdmF0ZSBwYWNrYWdlIGNhbiBiZSB3b3JrYXJvdW5kLlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICBudWxsXG5cbiAgICBpdCBcInJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQpXG5cbiAgICBpdCBcIltvbmUgZWRpdG9yIG9wZW5lZF0gcmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGZpbGVzID0gc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLmNvbmNhdCgnbGliL3N0YXR1cy1iYXItbWFuYWdlci5qcycpXG4gICAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhmaWxlcylcblxuICAgIGl0IFwiW2FmdGVyIG1vdGlvbiBleGVjdXRlZF0gcmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZSkgLT5cbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZS5lbGVtZW50LCAndmltLW1vZGUtcGx1czptb3ZlLXJpZ2h0JylcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gW1xuICAgICAgICAgICAgXCJsaWIvc3RhdHVzLWJhci1tYW5hZ2VyLmpzXCJcbiAgICAgICAgICAgIFwibGliL29wZXJhdGlvbi1zdGFjay5qc1wiXG4gICAgICAgICAgICBcImxpYi9iYXNlLmpzXCJcbiAgICAgICAgICAgIFwibGliL2pzb24vZmlsZS10YWJsZS5qc29uXCJcbiAgICAgICAgICAgIFwibGliL21vdGlvbi5qc1wiXG4gICAgICAgICAgICBcImxpYi91dGlscy5qc1wiXG4gICAgICAgICAgICBcImxpYi9jdXJzb3Itc3R5bGUtbWFuYWdlci5qc1wiXG4gICAgICAgICAgXVxuICAgICAgICAgIGZpbGVzID0gc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLmNvbmNhdChleHRyYVNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZClcbiAgICAgICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzKGZpbGVzKVxuXG4gICAgaXQgXCJqdXN0IHJlZmVyZW5jaW5nIHNlcnZpY2UgZnVuY3Rpb24gZG9lc24ndCBsb2FkIGJhc2UuanNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgIHNlcnZpY2UgPSBwYWNrLm1haW5Nb2R1bGUucHJvdmlkZVZpbU1vZGVQbHVzKClcbiAgICAgICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyhzZXJ2aWNlKVxuICAgICAgICAgIHNlcnZpY2Uua2V5XG4gICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkKVxuXG4gICAgaXQgXCJjYWxsaW5nIHNlcnZpY2UuZ2V0Q2xhc3MgbG9hZCBiYXNlLmpzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICBzZXJ2aWNlID0gcGFjay5tYWluTW9kdWxlLnByb3ZpZGVWaW1Nb2RlUGx1cygpXG4gICAgICAgIHNlcnZpY2UuZ2V0Q2xhc3MoXCJNb3ZlUmlnaHRcIilcbiAgICAgICAgZXh0cmFTaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQgPSBbXG4gICAgICAgICAgXCJsaWIvYmFzZS5qc1wiXG4gICAgICAgICAgXCJsaWIvanNvbi9maWxlLXRhYmxlLmpzb25cIlxuICAgICAgICAgIFwibGliL21vdGlvbi5qc1wiXG4gICAgICAgIF1cbiAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQuY29uY2F0KGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkKSlcblxuICAgIGl0IFwiY2FsbGluZyBzZXJ2aWNlLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjIGRvZXNuJ3QgbG9hZCBiYXNlLmpzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICBzZXJ2aWNlID0gcGFjay5tYWluTW9kdWxlLnByb3ZpZGVWaW1Nb2RlUGx1cygpXG4gICAgICAgIHNlcnZpY2UucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMoXCJTYW1wbGVDb21tYW5kXCIsIHtwcmVmaXg6ICd2aW0tbW9kZS1wbHVzLXVzZXInLCBnZXRDbGFzczogLT4gXCJTYW1wbGVDb21tYW5kXCJ9KVxuICAgICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzKHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZClcblxuICBkZXNjcmliZSBcImNvbW1hbmQtdGFibGVcIiwgLT5cbiAgICAjICogTG9hZGluZyBhdG9tIGNvbW1hbmRzIGZyb20gcHJlLWdlbmVyYXRlZCBjb21tYW5kLXRhYmxlLlxuICAgICMgKiBXaHk/XG4gICAgIyAgdm1wIGFkZHMgYWJvdXQgMzAwIGNtZHMsIHdoaWNoIGlzIGh1Z2UsIGR5bmFtaWNhbGx5IGNhbGN1bGF0aW5nIGFuZCByZWdpc3RlciBjbWRzXG4gICAgIyAgdG9vayB2ZXJ5IGxvbmcgdGltZS5cbiAgICAjICBTbyBjYWxjbHVhdGUgbm9uLWR5bmFtaWMgcGFyIHRoZW4gc2F2ZSB0byBjb21tYW5kLXRhYmxlLmNvZmZlIGFuZCBsb2FkIGluIG9uIHN0YXJ0dXAuXG4gICAgIyAgV2hlbiBjb21tYW5kIGFyZSBleGVjdXRlZCwgbmVjZXNzYXJ5IGNvbW1hbmQgY2xhc3MgZmlsZSBpcyBsYXp5LXJlcXVpcmVkLlxuICAgIGRlc2NyaWJlIFwiaW5pdGlhbCBjbGFzc1JlZ2lzdHJ5XCIsIC0+XG4gICAgICBpdCBcImlzIGVtcHR5XCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHJlcXVpcmUgJy4uL2xpYi9iYXNlJ1xuICAgICAgICAgIGV4cGVjdChCYXNlLmNsYXNzQnlOYW1lLnNpemUpLnRvQmUoMClcblxuICAgIGRlc2NyaWJlIFwiZnVsbHkgcG9wdWxhdGVkIEJhc2UuY2xhc3NCeU5hbWVcIiwgLT5cbiAgICAgIGl0IFwiQmFzZS5nZXRDbGFzcyhtb3Rpb25DbGFzcykgcG9wdWxhdGUgY2xhc3MgdGFibGUgZm9yIGFsbCBtZW1iZXJzIGJlbG9uZ2luZyB0byBzYW1lIGZpbGUobW90aW9ucylcIiwgLT5cbiAgICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgICBCYXNlID0gcmVxdWlyZSAnLi4vbGliL2Jhc2UnXG4gICAgICAgICAgZXhwZWN0KEJhc2UuY2xhc3NCeU5hbWUuc2l6ZSkudG9CZSgwKVxuICAgICAgICAgIEJhc2UuZ2V0Q2xhc3MoXCJNb3ZlUmlnaHRcIilcbiAgICAgICAgICBmaWxlVGFibGUgPSByZXF1aXJlKFwiLi4vbGliL2pzb24vZmlsZS10YWJsZS5qc29uXCIpXG4gICAgICAgICAgZXhwZWN0KGZpbGVUYWJsZVtcIi4vbW90aW9uXCJdLmxlbmd0aCkudG9CZShCYXNlLmNsYXNzQnlOYW1lLnNpemUpXG4gICAgICAgICAgZXhwZWN0KEJhc2UuY2xhc3NCeU5hbWUuc2l6ZSA+IDApLnRvQmUgdHJ1ZVxuXG4gICAgZGVzY3JpYmUgXCJtYWtlIHN1cmUgY29tbWFuZC10YWJsZSBhbmQgZmlsZS10YWJsZSBpcyBOT1Qgb3V0LW9mLWRhdGVcIiwgLT5cbiAgICAgIGl0IFwiYnVpbGRDb21tYW5kVGFibGUgcmV0dXJuIHRhYmxlIHdoaWNoIGlzIGVxdWFscyB0byBpbml0aWFsbHkgbG9hZGVkIGNvbW1hbmQgdGFibGVcIiwgLT5cbiAgICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgICBCYXNlID0gcmVxdWlyZSAnLi4vbGliL2Jhc2UnXG4gICAgICAgICAgb2xkQ29tbWFuZFRhYmxlID0gcmVxdWlyZShcIi4uL2xpYi9qc29uL2NvbW1hbmQtdGFibGUuanNvblwiKVxuICAgICAgICAgIG9sZEZpbGVUYWJsZSA9IHJlcXVpcmUoXCIuLi9saWIvanNvbi9maWxlLXRhYmxlLmpzb25cIilcblxuICAgICAgICAgIGRldmVsb3BlciA9IHJlcXVpcmUgXCIuLi9saWIvZGV2ZWxvcGVyXCJcbiAgICAgICAgICB7Y29tbWFuZFRhYmxlLCBmaWxlVGFibGV9ID0gZGV2ZWxvcGVyLmJ1aWxkQ29tbWFuZFRhYmxlQW5kRmlsZVRhYmxlKClcblxuICAgICAgICAgIGV4cGVjdChvbGRDb21tYW5kVGFibGUpLm5vdC50b0JlKGNvbW1hbmRUYWJsZSlcbiAgICAgICAgICBleHBlY3Qob2xkQ29tbWFuZFRhYmxlKS50b0VxdWFsKGNvbW1hbmRUYWJsZSlcblxuICAgICAgICAgIGV4cGVjdChvbGRGaWxlVGFibGUpLm5vdC50b0JlKGZpbGVUYWJsZSlcbiAgICAgICAgICBleHBlY3Qob2xkRmlsZVRhYmxlKS50b0VxdWFsKGZpbGVUYWJsZSlcbiJdfQ==
