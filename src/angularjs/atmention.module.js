'use strict';

var atmention = require('../core');

angular.module('atmentionModule', [])
  .factory('atmention', atmentionFactory);

function atmentionFactory () {
  return atmention;
}
