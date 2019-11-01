'use strict';

module.exports = {
  spliceString: function (str, start, end, insert) {
    return str.substring(0, start) + (insert || '') + str.substring(end);
  },

  extend: function (target) {
    var extended = target || {};

    for (var i = 1; i < arguments.length; i += 1) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          extended[key] = arguments[i][key];
        }
      }
    }

    return extended;
  }
};
