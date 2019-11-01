'use strict';

var parse = require('../src/parse');

describe('Parse', function () {

  it('Initializes from markup', function () {
    var markup = 'Hi, [Wim](person:123) and [Alex](person:456)!';
    var message = parse(markup);

    expect(message).toBeDefined();
    expect(message.getMarkup()).toBe(markup);
    expect(message.getDisplay()).toBe('Hi, Wim and Alex!');
  });

  it('Extracts mentions', function () {
    var markup = 'Hi, [Wim](person:123) and [Alex](person:456)!';
    var message = parse(markup);
    var mentions = message.getMentions();

    expect(mentions.length).toBe(2);

    expect(mentions[0]).toEqual({
      start: 4,
      end: 21,
      markup: '[Wim](person:123)',
      label: 'Wim',
      value: 'person:123'
    });

    expect(mentions[1]).toEqual({
      start: 26,
      end: 44,
      markup: '[Alex](person:456)',
      label: 'Alex',
      value: 'person:456'
    });
  });

  it('Accepts empty markup', function () {
    var markup = null;
    var message = parse(markup);
    expect(message).toBeDefined();
    expect(message.getMarkup()).toBe('');
    expect(message.getDisplay()).toBe('');
    expect(message.getMentions().length).toBe(0);
  });

  it('Handles typing character from caret', function () {
    var message = parse('');
    message.setSelectionRange(0, 0);
    message.handleInputEvent('a', 1, 1);
    expect(message.getMarkup()).toBe('a');
  });

  it('Handles paste at caret', function () {
    var message = parse('');
    message.setSelectionRange(0, 0);
    message.handleInputEvent('abc', 3, 3);
    expect(message.getMarkup()).toBe('abc');
  });

  it('Handles delete key from caret', function () {
    var message = parse('abcdefg');
    message.setSelectionRange(2, 2);
    message.handleInputEvent('abdefg', 2, 2);
    expect(message.getMarkup()).toBe('abdefg');
  });

  it('Handles backspace from caret', function () {
    var message = parse('abcdefg');
    message.setSelectionRange(2, 2);
    message.handleInputEvent('acdefg', 1, 1);
    expect(message.getMarkup()).toBe('acdefg');
  });

  it('Handles cut selection', function () {
    var message = parse('abcdefg');
    message.setSelectionRange(2, 5);
    message.handleInputEvent('', 2, 2);
    expect(message.getMarkup()).toBe('abfg');
  });

  it('Handles overwrite selection', function () {
    var message = parse('abcdefg');
    message.setSelectionRange(2, 5);
    message.handleInputEvent('abxfg', 3, 3);
    expect(message.getMarkup()).toBe('abxfg');
  });

  it('Handles IME compositions', function () {
    var message = parse('');
    message.setSelectionRange(0, 0);
    message.handleInputEvent('a', 0, 1);
    expect(message.getMarkup()).toBe('a');
  });

});
