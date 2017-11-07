'use strict';

var log = require('../src/log');

describe('Log', function () {

  it('Doesn\'t throw', function () {
    log.enabled = true;
    log.log('testing');
    log.debug('testing');
    log.error('testing');

    log.enabled = false;
    log.log('testing');
    log.debug('testing');
    log.error('testing');
  });
});
