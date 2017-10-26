'use strict';

var util = module.exports = {

  escapeRegex: function (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  regexFromTemplate: function (tpl, matchAtEnd) {
    var pattern = util.escapeRegex(tpl);

    // TODO(?) allow any character except []() and/or make this configurable
    var allowedDisplayChars = '([a-zA-Z0-9 :\.@]+?)';
    var allowedIdChars = '([a-zA-Z0-9 @:\.\-]+?)';

    pattern = pattern.replace('__DISPLAY__', allowedDisplayChars); // '(.+?)'
    pattern = pattern.replace('__ID__', allowedIdChars); // '(.+?)'
    pattern = pattern + (matchAtEnd ? '$' : '');

    return new RegExp(pattern, 'g');
  },

  spliceString: function (str, start, end, insert) {
    return str.substring(0, start) + (insert || '') + str.substring(end);
  },

  createMarkup: function (pattern, display, id) {
    var markup = pattern;
    markup = markup.replace('__DISPLAY__', display);
    markup = markup.replace('__ID__', id);
    return markup;
  }
};
