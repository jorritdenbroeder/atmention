'use strict';

var lib = require('../../lib');

angular.module('mentionModule', [])
  .factory('mention', libraryWrapper);

function libraryWrapper () {
  return lib;
}
