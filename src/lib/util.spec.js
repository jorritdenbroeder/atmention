'use strict';

var lib = require('.');

describe('Util', function () {

  var util = lib.util;
  var mentionRegexTemplate = '@[__DISPLAY__](__ID__)';
  var mentionRegex = util.regexFromTemplate(mentionRegexTemplate);

  it('Creates regex from template', function () {
    expect(mentionRegex.source).toEqual('@\\[([a-zA-Z0-9 :.@]+?)\\]\\(([a-zA-Z0-9 :.@]+?)\\)'); // double-escaped backslashes
  });

});
