'use strict';

var parse = require('../../src/core/parse');

describe('Format as html', function () {

  var options = {
    mentionTemplate: '[__LABEL__](__VALUE__)'
  };

  var htmlOptions = {
    mentionClass: 'mention'
  };

  it('No mentions', function () {
    var message = parse('Ok, looking good', options);
    var html = message.toHTML(htmlOptions);
    expect(html).toBe('<span>Ok, looking good</span>');
  });

  it('With mentions', function () {
    var message = parse('Ok, [x](x) looking good', options);
    var html = message.toHTML(htmlOptions);
    expect(html).toBe('<span>Ok, </span><span class="mention">x</span><span> looking good</span>');
  });

});
