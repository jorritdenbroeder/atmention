'use strict';

var extract = require('../src/core/extract-mentions');

describe('Core', function () {

  it('Extract mentions', function () {
    var mentions = extract('Hi, [Wim](person:123)! and [Alex](person:456)');

    expect(mentions[0]).toEqual({
      display: 'Wim',
      id: 'person:123'
    });

    expect(mentions[1]).toEqual({
      display: 'Alex',
      id: 'person:456'
    });
  });

});
