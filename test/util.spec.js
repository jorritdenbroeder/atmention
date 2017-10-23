'use strict';

var lib = require('../src/lib');

describe('Util', function () {

  var util = lib.util;
  var mentionRegexTemplate = '@[__DISPLAY__](__ID__)';
  var mentionRegex = util.regexFromTemplate(mentionRegexTemplate);

  it('Creates regex from template', function () {
    expect(mentionRegex.source).toEqual('@\\[([a-zA-Z0-9 :.@]+?)\\]\\(([a-zA-Z0-9 :.@]+?)\\)'); // double-escaped backslashes
  });

  it('Splices a string', function () {
    var result = util.spliceString('0123456', 3, 4, '-');
    expect(result).toEqual('012-456');
  });

  it('Creates markup from pattern', function () {
    var pattern = '@[__DISPLAY__](__ID__)';
    var markup = util.createMarkup(pattern, 'me', 'person:123');
    expect(markup).toEqual('@[me](person:123)');
  });

});
