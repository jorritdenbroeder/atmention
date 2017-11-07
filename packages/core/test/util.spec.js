'use strict';

var util = require('../src/util');

describe('Util', function () {

  var mentionRegexTemplate = '[__LABEL__](__VALUE__)';
  var mentionRegex = util.regexFromTemplate(mentionRegexTemplate);

  it('Creates regex from template', function () {
    expect(mentionRegex.source).toEqual('\\[([a-zA-Z0-9_ :.@]+?)\\]\\(([a-zA-Z0-9_ @:.-]+?)\\)'); // double-escaped backslashes
  });

  it('Splices a string', function () {
    var result = util.spliceString('0123456', 3, 4, '-');
    expect(result).toEqual('012-456');
  });

});
