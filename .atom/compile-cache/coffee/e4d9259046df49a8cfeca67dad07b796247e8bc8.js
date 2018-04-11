(function() {
  var VimOption,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
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

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL3ZpbS1vcHRpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxTQUFBO0lBQUE7O0VBQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFDSixTQUFDLENBQUEsU0FBRCxHQUFZLFNBQUE7YUFDVixTQUFDLENBQUEsV0FBRCxTQUFDLENBQUEsU0FBVyxJQUFJO0lBRE47O3dCQUdaLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxJQUF6QztJQURJOzt3QkFHTixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsS0FBekM7SUFETTs7d0JBR1IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLElBQTFDO0lBRE07O3dCQUdSLEVBQUEsR0FBSSxTQUFBO2FBQ0YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQURFOzt3QkFHSixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsS0FBMUM7SUFEUTs7d0JBR1YsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsUUFBRCxDQUFBO0lBREk7O3dCQUdOLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxJQUF0QztJQURVOzt3QkFHWixHQUFBLEdBQUssU0FBQTthQUNILElBQUMsQ0FBQSxVQUFELENBQUE7SUFERzs7d0JBR0wsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLEtBQXRDO0lBRFk7O3dCQUdkLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURLOzt3QkFHUCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsSUFBdEM7SUFEVTs7d0JBR1osRUFBQSxHQUFJLFNBQUE7YUFDRixJQUFDLENBQUEsVUFBRCxDQUFBO0lBREU7O3dCQUdKLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxLQUF0QztJQURZOzt3QkFHZCxJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxZQUFELENBQUE7SUFESTs7d0JBR04sU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLEVBQWtELElBQWxEO0lBRFM7O3dCQUdYLEdBQUEsR0FBSyxTQUFBO2FBQ0gsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQURHOzt3QkFHTCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBa0QsS0FBbEQ7SUFEVzs7d0JBR2IsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsV0FBRCxDQUFBO0lBREs7Ozs7OztFQUdULE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBMURqQiIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFZpbU9wdGlvblxuICBAc2luZ2xldG9uOiA9PlxuICAgIEBvcHRpb24gfHw9IG5ldyBWaW1PcHRpb25cblxuICBsaXN0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93SW52aXNpYmxlc1wiLCB0cnVlKVxuXG4gIG5vbGlzdDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJlZGl0b3Iuc2hvd0ludmlzaWJsZXNcIiwgZmFsc2UpXG5cbiAgbnVtYmVyOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93TGluZU51bWJlcnNcIiwgdHJ1ZSlcblxuICBudTogPT5cbiAgICBAbnVtYmVyKClcblxuICBub251bWJlcjogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzXCIsIGZhbHNlKVxuXG4gIG5vbnU6ID0+XG4gICAgQG5vbnVtYmVyKClcblxuICBzcGxpdHJpZ2h0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRyaWdodFwiLCB0cnVlKVxuXG4gIHNwcjogPT5cbiAgICBAc3BsaXRyaWdodCgpXG5cbiAgbm9zcGxpdHJpZ2h0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRyaWdodFwiLCBmYWxzZSlcblxuICBub3NwcjogPT5cbiAgICBAbm9zcGxpdHJpZ2h0KClcblxuICBzcGxpdGJlbG93OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRiZWxvd1wiLCB0cnVlKVxuXG4gIHNiOiA9PlxuICAgIEBzcGxpdGJlbG93KClcblxuICBub3NwbGl0YmVsb3c6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdGJlbG93XCIsIGZhbHNlKVxuXG4gIG5vc2I6ID0+XG4gICAgQG5vc3BsaXRiZWxvdygpXG5cbiAgc21hcnRjYXNlOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcInZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaFwiLCB0cnVlKVxuXG4gIHNjczogPT5cbiAgICBAc21hcnRjYXNlKClcblxuICBub3NtYXJ0Y2FzZTogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJ2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2hcIiwgZmFsc2UpXG5cbiAgbm9zY3M6ID0+XG4gICAgQG5vc21hcnRjYXNlKClcblxubW9kdWxlLmV4cG9ydHMgPSBWaW1PcHRpb25cbiJdfQ==
