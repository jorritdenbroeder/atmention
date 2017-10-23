'use strict';

var atmention = require('../../lib');

angular.module('atmentionModule', [])
  .factory('atmention', atmentionFactory);

function atmentionFactory () {
  return atmention;
}
