'use strict';

var log = module.exports = {
  log: function (/* arguments */) {
    if (!log.enabled) { return; }
    /* eslint no-console:0 */
    console.log.apply(console, arguments);
  },

  debug: function () {
    if (!log.enabled) { return; }
    /* eslint no-console:0 */
    console.log.apply(console, arguments);
  },

  error: function () {
    if (!log.enabled) { return; }
    /* eslint no-console:0 */
    console.error.apply(console, arguments);
  }
};
