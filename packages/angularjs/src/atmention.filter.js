'use strict';

angular.module('atmentionModule')
  .filter('atmention', atmentionFilter);

/**
 * Formats markup as plain text
 */
function atmentionFilter(atmention) {
  return function (markup, options) {
    return atmention.parse(markup, options).getDisplay();
  };
}
