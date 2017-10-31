'use strict';

var editor = require('../core/editor');

angular.module('atmentionModule')
  .filter('atmention', atmentionFilter);

/**
 * Converts markup to plain text
 */
function atmentionFilter (atmention) {
  return function (markup, editorOptions) {
    return editor(editorOptions).parseMarkup(markup).getDisplay();
  };
}
