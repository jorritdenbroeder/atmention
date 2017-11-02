'use strict';

var bootstrap = require('../src/core/textarea');

function noop() {}

function fakePromise(results) {
  return {
    then: function (callback) {
      callback(results);
    }
  };
}

function fireEvent(sourceElm, eventClass, eventType) {
  var evt = document.createEvent(eventClass);
  evt.initEvent(eventType);
  sourceElm.dispatchEvent(evt);
}

describe('Input component', function () {
  var instance;
  var textarea;
  var highlights;
  var suggestions;
  var hooks;

  beforeAll(function () {
    textarea = document.createElement('textarea');
    highlights = document.createElement('div');
    suggestions = document.createElement('div');

    document.body.appendChild(textarea);
    document.body.appendChild(highlights);
    document.body.appendChild(suggestions);

    hooks = {
      updateMarkup: jasmine.createSpy('updateMarkup'),
      search: function () { return fakePromise([]); },
      updateSuggestions: noop, //jasmine.createSpy('updateSuggestions'),
      updateActiveSuggestionIndex: jasmine.createSpy('updateActiveSuggestionIndex'),
      toggleSuggestions: jasmine.createSpy('toggleSuggestions')
    };
  });

  beforeEach(function () {
    instance = bootstrap({
      inputElement: textarea,
      highlighterElement: highlights,
      suggestionsElement: suggestions,
      hooks: hooks
    });

    // clear textarea
    textarea.focus();
    textarea.value = 'a';
    textarea.setSelectionRange(0, 0);
  });

  afterEach(function () {
    instance.destroy();
  });

  it('Updates markup when typing', function (done) {
    // type `a`
    textarea.value = 'a';
    textarea.setSelectionRange(1, 1);
    fireEvent(textarea, 'Event', 'input');

    // test
    setTimeout(function () {
      expect(hooks.updateMarkup).toHaveBeenCalledWith('a')
      done();
    });
  });

  it('Triggers search', function (done) {
    var searchResults = [{}, {}, {}];
    var actualSuggestions;

    // setup
    spyOn(hooks, 'search').and.returnValue(fakePromise(searchResults));
    spyOn(hooks, 'updateSuggestions').and.callFake(function (suggestions) {
      actualSuggestions = suggestions;
    });

    // type search query
    textarea.value = 'Hi, @mention';
    textarea.setSelectionRange(12, 12);
    fireEvent(textarea, 'Event', 'input');

    // test
    setTimeout(function () {
      expect(actualSuggestions.length).toBe(searchResults.length);
      expect(hooks.search).toHaveBeenCalledWith('mention');
      expect(hooks.updateSuggestions).toHaveBeenCalled();
      expect(hooks.updateActiveSuggestionIndex).toHaveBeenCalledWith(0);
      expect(hooks.toggleSuggestions).toHaveBeenCalledWith(true);
      done();
    });
  });

});
