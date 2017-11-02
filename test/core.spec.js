'use strict';

var editor = require('../src/core/editor');
var extractMentions = require('../src/core/extract-mentions');
var markupToHtml = require('../src/core/markup-to-html');

describe('Core', function () {

  it('Extract mentions', function () {
    var mentions = extractMentions('Hi, [Wim](person:123)! and [Alex](person:456)');

    expect(mentions[0]).toEqual({
      display: 'Wim',
      id: 'person:123'
    });

    expect(mentions[1]).toEqual({
      display: 'Alex',
      id: 'person:456'
    });
  });

  it('Create HTML from markup, caret at 0', function () {
    var segments = editor().parseMarkup('12[3](xxx)4').getSegments();
    var html = markupToHtml(segments, 0, 'markup-class', 'caret-class');
    expect(html).toBe('<span class="caret-class"></span><span>12</span><span class="markup-class">3</span><span>4</span><br/><br/>');
  });

  it('Create HTML from markup, caret inside segment', function () {
    var segments = editor().parseMarkup('12[3](xxx)4').getSegments();
    var html = markupToHtml(segments, 1, 'markup-class', 'caret-class');
    expect(html).toBe('<span class="caret-class">1</span><span>2</span><span class="markup-class">3</span><span>4</span><br/><br/>');
  });

  it('Create HTML from markup, caret at end', function () {
    var segments = editor().parseMarkup('12[3](xxx)4').getSegments();
    var html = markupToHtml(segments, 4, 'markup-class', 'caret-class');
    expect(html).toBe('<span>12</span><span class="markup-class">3</span><span>4</span><span class="caret-class"></span><br/><br/>');
  });

});
