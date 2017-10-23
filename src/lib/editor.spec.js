'use strict';

var lib = require('.');

describe('Editor', function () {

  var editor = lib.editor({
    pattern: '@[__DISPLAY__](__ID__)'
  });

  it('Parses markup', function () {
    var markup = 'Hi, @[Mike](person:123)!';
    var segments = editor.parseMarkup(markup).getSegments();

    expect(segments[0].markup.text).toEqual('Hi, ');
    expect(segments[1].markup.text).toEqual('@[Mike](person:123)');
    expect(segments[2].markup.text).toEqual('!');

    expect(segments[0].display.text).toEqual('Hi, ');
    expect(segments[1].display.text).toEqual('Mike');
    expect(segments[2].display.text).toEqual('!');
  });

  it('Accepts empty markup', function () {
    var segments = editor.parseMarkup('').getSegments();
    expect(segments.length).toBe(0);
  });

});
