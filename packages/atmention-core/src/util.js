'use strict';

var constants = require('./constants');

var util = module.exports = {

  escapeRegex: function (str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  regexFromTemplate: function (tpl, matchAtEnd) {
    var pattern = util.escapeRegex(tpl);

    // TODO(?) allow any character except []() and/or make this configurable
    var allowedLabelChars = '([a-zA-Z0-9_ :.@]+?)';
    var allowedValueChars = '([a-zA-Z0-9_ @:.-]+?)';

    pattern = pattern.replace(constants.LABEL_TEMPLATE_LITERAL, allowedLabelChars); // '(.+?)'
    pattern = pattern.replace(constants.VALUE_TEMPLATE_LITERAL, allowedValueChars); // '(.+?)'
    pattern = pattern + (matchAtEnd ? '$' : '');

    return new RegExp(pattern, 'g');
  },

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
