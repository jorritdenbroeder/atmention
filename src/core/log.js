'use strict';

var log = module.exports = {
  log: function (/* arguments */) {
    if (!log.enabled) { return; }
    console.log.apply(console, arguments);
  },
  debug: function () {
    if (!log.enabled) { return; }
    console.log.apply(console, arguments);
  }
};
