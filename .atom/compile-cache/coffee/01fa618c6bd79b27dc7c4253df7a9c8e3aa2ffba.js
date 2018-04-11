(function() {
  var root, setFontSize, setLayoutMode, setTabSizing, unsetFontSize, unsetLayoutMode, unsetTabSizing;

  root = document.documentElement;

  module.exports = {
    activate: function(state) {
      atom.config.observe('vanian-ui.fontSize', function(value) {
        return setFontSize(value);
      });
      atom.config.observe('vanian-ui.layoutMode', function(value) {
        return setLayoutMode(value);
      });
      return atom.config.observe('vanian-ui.tabSizing', function(value) {
        return setTabSizing(value);
      });
    },
    deactivate: function() {
      unsetFontSize();
      unsetLayoutMode();
      return unsetTabSizing();
    }
  };

  setFontSize = function(currentFontSize) {
    if (Number.isInteger(currentFontSize)) {
      return root.style.fontSize = currentFontSize + "px";
    } else if (currentFontSize === 'Auto') {
      return unsetFontSize();
    }
  };

  unsetFontSize = function() {
    return root.style.fontSize = '';
  };

  setLayoutMode = function(layoutMode) {
    return root.setAttribute('theme-vanian-ui-layoutmode', layoutMode.toLowerCase());
  };

  unsetLayoutMode = function() {
    return root.removeAttribute('theme-vanian-ui-layoutmode');
  };

  setTabSizing = function(tabSizing) {
    return root.setAttribute('theme-vanian-ui-tabsizing', tabSizing.toLowerCase());
  };

  unsetTabSizing = function() {
    return root.removeAttribute('theme-vanian-ui-tabsizing');
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2p1aGFsbHluLy5hdG9tL3BhY2thZ2VzL3Zhbmlhbi11aS9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxRQUFRLENBQUM7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG9CQUFwQixFQUEwQyxTQUFDLEtBQUQ7ZUFDeEMsV0FBQSxDQUFZLEtBQVo7TUFEd0MsQ0FBMUM7TUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isc0JBQXBCLEVBQTRDLFNBQUMsS0FBRDtlQUMxQyxhQUFBLENBQWMsS0FBZDtNQUQwQyxDQUE1QzthQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixxQkFBcEIsRUFBMkMsU0FBQyxLQUFEO2VBQ3pDLFlBQUEsQ0FBYSxLQUFiO01BRHlDLENBQTNDO0lBUFEsQ0FBVjtJQVVBLFVBQUEsRUFBWSxTQUFBO01BQ1YsYUFBQSxDQUFBO01BQ0EsZUFBQSxDQUFBO2FBQ0EsY0FBQSxDQUFBO0lBSFUsQ0FWWjs7O0VBZ0JGLFdBQUEsR0FBYyxTQUFDLGVBQUQ7SUFDWixJQUFHLE1BQU0sQ0FBQyxTQUFQLENBQWlCLGVBQWpCLENBQUg7YUFDRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVgsR0FBeUIsZUFBRCxHQUFpQixLQUQzQztLQUFBLE1BRUssSUFBRyxlQUFBLEtBQW1CLE1BQXRCO2FBQ0gsYUFBQSxDQUFBLEVBREc7O0VBSE87O0VBTWQsYUFBQSxHQUFnQixTQUFBO1dBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFYLEdBQXNCO0VBRFI7O0VBSWhCLGFBQUEsR0FBZ0IsU0FBQyxVQUFEO1dBQ2QsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsNEJBQWxCLEVBQWdELFVBQVUsQ0FBQyxXQUFYLENBQUEsQ0FBaEQ7RUFEYzs7RUFHaEIsZUFBQSxHQUFrQixTQUFBO1dBQ2hCLElBQUksQ0FBQyxlQUFMLENBQXFCLDRCQUFyQjtFQURnQjs7RUFJbEIsWUFBQSxHQUFlLFNBQUMsU0FBRDtXQUNiLElBQUksQ0FBQyxZQUFMLENBQWtCLDJCQUFsQixFQUErQyxTQUFTLENBQUMsV0FBVixDQUFBLENBQS9DO0VBRGE7O0VBR2YsY0FBQSxHQUFpQixTQUFBO1dBQ2YsSUFBSSxDQUFDLGVBQUwsQ0FBcUIsMkJBQXJCO0VBRGU7QUF2Q2pCIiwic291cmNlc0NvbnRlbnQiOlsicm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAndmFuaWFuLXVpLmZvbnRTaXplJywgKHZhbHVlKSAtPlxuICAgICAgc2V0Rm9udFNpemUodmFsdWUpXG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd2YW5pYW4tdWkubGF5b3V0TW9kZScsICh2YWx1ZSkgLT5cbiAgICAgIHNldExheW91dE1vZGUodmFsdWUpXG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd2YW5pYW4tdWkudGFiU2l6aW5nJywgKHZhbHVlKSAtPlxuICAgICAgc2V0VGFiU2l6aW5nKHZhbHVlKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgdW5zZXRGb250U2l6ZSgpXG4gICAgdW5zZXRMYXlvdXRNb2RlKClcbiAgICB1bnNldFRhYlNpemluZygpXG5cbiMgRm9udCBTaXplIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zZXRGb250U2l6ZSA9IChjdXJyZW50Rm9udFNpemUpIC0+XG4gIGlmIE51bWJlci5pc0ludGVnZXIoY3VycmVudEZvbnRTaXplKVxuICAgIHJvb3Quc3R5bGUuZm9udFNpemUgPSBcIiN7Y3VycmVudEZvbnRTaXplfXB4XCJcbiAgZWxzZSBpZiBjdXJyZW50Rm9udFNpemUgaXMgJ0F1dG8nXG4gICAgdW5zZXRGb250U2l6ZSgpXG5cbnVuc2V0Rm9udFNpemUgPSAtPlxuICByb290LnN0eWxlLmZvbnRTaXplID0gJydcblxuIyBMYXlvdXQgTW9kZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2V0TGF5b3V0TW9kZSA9IChsYXlvdXRNb2RlKSAtPlxuICByb290LnNldEF0dHJpYnV0ZSgndGhlbWUtdmFuaWFuLXVpLWxheW91dG1vZGUnLCBsYXlvdXRNb2RlLnRvTG93ZXJDYXNlKCkpXG5cbnVuc2V0TGF5b3V0TW9kZSA9IC0+XG4gIHJvb3QucmVtb3ZlQXR0cmlidXRlKCd0aGVtZS12YW5pYW4tdWktbGF5b3V0bW9kZScpXG5cbiMgVGFiIFNpemluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2V0VGFiU2l6aW5nID0gKHRhYlNpemluZykgLT5cbiAgcm9vdC5zZXRBdHRyaWJ1dGUoJ3RoZW1lLXZhbmlhbi11aS10YWJzaXppbmcnLCB0YWJTaXppbmcudG9Mb3dlckNhc2UoKSlcblxudW5zZXRUYWJTaXppbmcgPSAtPlxuICByb290LnJlbW92ZUF0dHJpYnV0ZSgndGhlbWUtdmFuaWFuLXVpLXRhYnNpemluZycpXG4iXX0=
