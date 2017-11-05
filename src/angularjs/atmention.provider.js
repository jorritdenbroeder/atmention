'use strict';

var atmention = require('../core');

angular.module('atmentionModule')
  .provider('atmention', AtmentionProvider);

function AtmentionProvider () {
  this.$get = function () {
    return atmention;
  };
}
