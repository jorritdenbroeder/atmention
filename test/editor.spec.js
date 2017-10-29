'use strict';

var core = require('../src/core');

describe('Editor', function () {

  var editor = core.editor({
    pattern: '[__DISPLAY__](__ID__)'
  });

  it('Parses markup', function () {
    var markup = 'Hi, [Mike](person:123)!';
    var segments = editor.parseMarkup(markup).getSegments();

    expect(segments[0].markup.text).toEqual('Hi, ');
    expect(segments[1].markup.text).toEqual('[Mike](person:123)');
    expect(segments[2].markup.text).toEqual('!');

    expect(segments[0].display.text).toEqual('Hi, ');
    expect(segments[1].display.text).toEqual('Mike');
    expect(segments[2].display.text).toEqual('!');
  });

  it('Accepts empty markup', function () {
    expect(editor.parseMarkup(null).getSegments().length).toBe(0);
  });

  it('Handles type character from caret', function () {
    editor.handleSelectionChangeEvent(0, 0);
    editor.handleInputEvent('a', 1, 1);
    expect(editor.getMarkup()).toBe('a');
  });

  it('Handles paste at caret', function () {
    editor.handleSelectionChangeEvent(0, 0);
    editor.handleInputEvent('abc', 3, 3);
    expect(editor.getMarkup()).toBe('abc');
  });

  it('Handles deletekey from caret', function () {
    editor.parseMarkup('abcdefg');
    editor.handleSelectionChangeEvent(2, 2);
    editor.handleInputEvent('abdefg', 2, 2);
    expect(editor.getMarkup()).toBe('abdefg');
  });

  it('Handles backspace from caret', function () {
    editor.parseMarkup('abcdefg');
    editor.handleSelectionChangeEvent(2, 2);
    editor.handleInputEvent('acdefg', 1, 1);
    expect(editor.getMarkup()).toBe('acdefg');
  });

  it('Handles cut selection', function () {
    editor.parseMarkup('abcdefg');
    editor.handleSelectionChangeEvent(2, 5);
    editor.handleInputEvent('', 2, 2);
    expect(editor.getMarkup()).toBe('abfg');
  });

  it('Handles overwrite selection', function () {
    editor.parseMarkup('abcdefg');
    editor.handleSelectionChangeEvent(2, 5);
    editor.handleInputEvent('abxfg', 3, 3);
    expect(editor.getMarkup()).toBe('abxfg');
  });

  it('Handles IME compositions', function () {
    editor.handleSelectionChangeEvent(0, 0);
    editor.handleInputEvent('a', 0, 1);
    expect(editor.getMarkup()).toBe('a');
  });

});
