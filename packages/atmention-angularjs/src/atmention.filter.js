'use strict';

angular.module('atmentionModule')
  .filter('atmention', atmentionFilter);

/**
 * Parses markup into an atmention instance
 */
function atmentionFilter(atmention) {
  return function (markup) {
    return atmention.parse(markup);
  };
}
