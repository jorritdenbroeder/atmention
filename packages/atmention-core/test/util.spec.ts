'use strict';

var util = require('../src/util');

describe('Util', function () {

  it('Splices a string', function () {
    var result = util.spliceString('0123456', 3, 4, '-');
    expect(result).toEqual('012-456');
  });

});
