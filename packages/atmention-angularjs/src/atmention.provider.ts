'use strict';

var atmention = require('atmention-core');

angular.module('atmentionModule')
  .provider('atmention', AtmentionProvider);

function AtmentionProvider () {
  this.$get = function () {
    return atmention;
  };
}
