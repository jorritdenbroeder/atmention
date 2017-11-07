'use strict';

var atmention = require('atmention');

angular.module('atmentionModule')
  .provider('atmention', AtmentionProvider);

function AtmentionProvider () {
  this.$get = function () {
    return atmention;
  };
}
