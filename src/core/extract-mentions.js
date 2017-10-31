'use strict';

var editor = require('./editor');

/**
 * Extracts mentions from markup
 *
 * @param markup
 * @param options.pattern
 */
module.exports = function (markup, options) {
  var opts = options || {};

  return editor({ pattern: opts.pattern })
    .parseMarkup(markup)
    .getSegments()
    .filter(function (segment) {
      return !!segment.data;
    })
    .map(function (segment) {
      return segment.data;
    });
};
