(function() {
  var VimOption,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
      this.nogdefault = bind(this.nogdefault, this);
      this.gdefault = bind(this.gdefault, this);
      this.noscs = bind(this.noscs, this);
      this.nosmartcase = bind(this.nosmartcase, this);
      this.scs = bind(this.scs, this);
      this.smartcase = bind(this.smartcase, this);
      this.nosb = bind(this.nosb, this);
      this.nosplitbelow = bind(this.nosplitbelow, this);
      this.sb = bind(this.sb, this);
      this.splitbelow = bind(this.splitbelow, this);
      this.nospr = bind(this.nospr, this);
      this.nosplitright = bind(this.nosplitright, this);
      this.spr = bind(this.spr, this);
      this.splitright = bind(this.splitright, this);
      this.nonu = bind(this.nonu, this);
      this.nonumber = bind(this.nonumber, this);
      this.nu = bind(this.nu, this);
      this.number = bind(this.number, this);
      this.nolist = bind(this.nolist, this);
      this.list = bind(this.list, this);
    }

    VimOption.singleton = function() {
      return VimOption.option || (VimOption.option = new VimOption);
    };

    VimOption.prototype.list = function() {
      return atom.config.set("editor.showInvisibles", true);
    };

    VimOption.prototype.nolist = function() {
      return atom.config.set("editor.showInvisibles", false);
    };

    VimOption.prototype.number = function() {
      return atom.config.set("editor.showLineNumbers", true);
    };

    VimOption.prototype.nu = function() {
      return this.number();
    };

    VimOption.prototype.nonumber = function() {
      return atom.config.set("editor.showLineNumbers", false);
    };

    VimOption.prototype.nonu = function() {
      return this.nonumber();
    };

    VimOption.prototype.splitright = function() {
      return atom.config.set("ex-mode.splitright", true);
    };

    VimOption.prototype.spr = function() {
      return this.splitright();
    };

    VimOption.prototype.nosplitright = function() {
      return atom.config.set("ex-mode.splitright", false);
    };

    VimOption.prototype.nospr = function() {
      return this.nosplitright();
    };

    VimOption.prototype.splitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", true);
    };

    VimOption.prototype.sb = function() {
      return this.splitbelow();
    };

    VimOption.prototype.nosplitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", false);
    };

    VimOption.prototype.nosb = function() {
      return this.nosplitbelow();
    };

    VimOption.prototype.smartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", true);
    };

    VimOption.prototype.scs = function() {
      return this.smartcase();
    };

    VimOption.prototype.nosmartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", false);
    };

    VimOption.prototype.noscs = function() {
      return this.nosmartcase();
    };

    VimOption.prototype.gdefault = function() {
      return atom.config.set("ex-mode.gdefault", true);
    };

    VimOption.prototype.nogdefault = function() {
      return atom.config.set("ex-mode.gdefault", false);
    };

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL3ZpbS1vcHRpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxTQUFBO0lBQUE7O0VBQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUNKLFNBQUMsQ0FBQSxTQUFELEdBQVksU0FBQTthQUNWLFNBQUMsQ0FBQSxXQUFELFNBQUMsQ0FBQSxTQUFXLElBQUk7SUFETjs7d0JBR1osSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLElBQXpDO0lBREk7O3dCQUdOLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxLQUF6QztJQURNOzt3QkFHUixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsSUFBMUM7SUFETTs7d0JBR1IsRUFBQSxHQUFJLFNBQUE7YUFDRixJQUFDLENBQUEsTUFBRCxDQUFBO0lBREU7O3dCQUdKLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxLQUExQztJQURROzt3QkFHVixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxRQUFELENBQUE7SUFESTs7d0JBR04sVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLElBQXRDO0lBRFU7O3dCQUdaLEdBQUEsR0FBSyxTQUFBO2FBQ0gsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQURHOzt3QkFHTCxZQUFBLEdBQWMsU0FBQTthQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsS0FBdEM7SUFEWTs7d0JBR2QsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsWUFBRCxDQUFBO0lBREs7O3dCQUdQLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxJQUF0QztJQURVOzt3QkFHWixFQUFBLEdBQUksU0FBQTthQUNGLElBQUMsQ0FBQSxVQUFELENBQUE7SUFERTs7d0JBR0osWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLEtBQXRDO0lBRFk7O3dCQUdkLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURJOzt3QkFHTixTQUFBLEdBQVcsU0FBQTthQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBa0QsSUFBbEQ7SUFEUzs7d0JBR1gsR0FBQSxHQUFLLFNBQUE7YUFDSCxJQUFDLENBQUEsU0FBRCxDQUFBO0lBREc7O3dCQUdMLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixFQUFrRCxLQUFsRDtJQURXOzt3QkFHYixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxXQUFELENBQUE7SUFESzs7d0JBR1AsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLEVBQW9DLElBQXBDO0lBRFE7O3dCQUdWLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQyxLQUFwQztJQURVOzs7Ozs7RUFHZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWhFakIiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBWaW1PcHRpb25cbiAgQHNpbmdsZXRvbjogPT5cbiAgICBAb3B0aW9uIHx8PSBuZXcgVmltT3B0aW9uXG5cbiAgbGlzdDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJlZGl0b3Iuc2hvd0ludmlzaWJsZXNcIiwgdHJ1ZSlcblxuICBub2xpc3Q6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZWRpdG9yLnNob3dJbnZpc2libGVzXCIsIGZhbHNlKVxuXG4gIG51bWJlcjogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzXCIsIHRydWUpXG5cbiAgbnU6ID0+XG4gICAgQG51bWJlcigpXG5cbiAgbm9udW1iZXI6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZWRpdG9yLnNob3dMaW5lTnVtYmVyc1wiLCBmYWxzZSlcblxuICBub251OiA9PlxuICAgIEBub251bWJlcigpXG5cbiAgc3BsaXRyaWdodDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLnNwbGl0cmlnaHRcIiwgdHJ1ZSlcblxuICBzcHI6ID0+XG4gICAgQHNwbGl0cmlnaHQoKVxuXG4gIG5vc3BsaXRyaWdodDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLnNwbGl0cmlnaHRcIiwgZmFsc2UpXG5cbiAgbm9zcHI6ID0+XG4gICAgQG5vc3BsaXRyaWdodCgpXG5cbiAgc3BsaXRiZWxvdzogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLnNwbGl0YmVsb3dcIiwgdHJ1ZSlcblxuICBzYjogPT5cbiAgICBAc3BsaXRiZWxvdygpXG5cbiAgbm9zcGxpdGJlbG93OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRiZWxvd1wiLCBmYWxzZSlcblxuICBub3NiOiA9PlxuICAgIEBub3NwbGl0YmVsb3coKVxuXG4gIHNtYXJ0Y2FzZTogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJ2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2hcIiwgdHJ1ZSlcblxuICBzY3M6ID0+XG4gICAgQHNtYXJ0Y2FzZSgpXG5cbiAgbm9zbWFydGNhc2U6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwidmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoXCIsIGZhbHNlKVxuXG4gIG5vc2NzOiA9PlxuICAgIEBub3NtYXJ0Y2FzZSgpXG5cbiAgZ2RlZmF1bHQ6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5nZGVmYXVsdFwiLCB0cnVlKVxuXG4gIG5vZ2RlZmF1bHQ6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5nZGVmYXVsdFwiLCBmYWxzZSlcblxubW9kdWxlLmV4cG9ydHMgPSBWaW1PcHRpb25cbiJdfQ==
