'use strict';

angular.module('atmentionModule')
  .filter('atmention', atmentionFilter);

/**
 * Converts markup to plain text
 */
function atmentionFilter(atmention) {
  return function (markup, editorOptions) {

    return atmention.editor(editorOptions)
      .parseMarkup(markup)
      .getDisplay();

  };
}
