'use strict';

var controller = require('../src/controller');

var KEY = {
  ENTER: 13,
  ESCAPE: 27,
  UP: 38,
  DOWN: 40
};

var fakeSearchResults = [{
  suggestion: 'SUGGESTION_1',
  label: 'MENTION_LABEL_1',
  value: 'MENTION_VALUE_1'
}, {
  suggestion: 'SUGGESTION_2',
  label: 'MENTION_LABEL_2',
  value: 'MENTION_VALUE_2'
}];

function fakePromise(results) {
  return {
    then: function (callback) {
      callback(results);
    }
  };
}

function dispatchEvent(elm, eventType, props) {
  var evt = new Event(eventType);
  for (var key in props) {
    evt[key] = props[key];
  }
  elm.dispatchEvent(evt);
}

describe('Controller', function () {
  var instance;
  var textarea;
  var highlights;
  var suggestions;
  var hooks;

  function showSuggestions(searchResults) {
    hooks.search.and.returnValue(fakePromise(searchResults));

    // Type something to trigger search + show suggestions
    textarea.value = 'Hi, @query';
    textarea.setSelectionRange(12, 12); // place caret at end of query
    dispatchEvent(textarea, 'input'); // trigger search query
  }

  beforeAll(function () {
    textarea = document.createElement('textarea');
    highlights = document.createElement('div');
    suggestions = document.createElement('div');

    document.body.appendChild(textarea);
    document.body.appendChild(highlights);
    document.body.appendChild(suggestions);

    hooks = {
      angularAsync: function (func) { func(); }, // Handle view updates synchronously, for easier testing
      search: jasmine.createSpy('search'),
      updateMarkup: jasmine.createSpy('updateMarkup'),
      updateSuggestions: jasmine.createSpy('updateSuggestions'),
      updateActiveSuggestionIndex: jasmine.createSpy('updateActiveSuggestionIndex'),
      toggleSuggestions: jasmine.createSpy('toggleSuggestions'),
    };
  });

  beforeEach(function () {
    instance = controller({
      inputElement: textarea,
      highlighterElement: highlights,
      suggestionsElement: suggestions,
      hooks: hooks,
      options: {
        mentionTemplate: '[__LABEL__](__VALUE__)'
      }
    });

    // Clear textarea
    textarea.focus();
    textarea.value = '';
    textarea.setSelectionRange(0, 0);
  });

  afterEach(function () {
    instance.destroy();
  });

  it('Updates markup in response to input events', function () {
    // Setup
    hooks.updateMarkup.calls.reset();

    // Type `a`
    textarea.value = 'a';
    textarea.setSelectionRange(1, 1);
    dispatchEvent(textarea, 'input');

    // Verify
    expect(hooks.updateMarkup.calls.count()).toBe(1);
    expect(hooks.updateMarkup).toHaveBeenCalledWith('a');
  });

  it('Updates textarea when markup is set programmatically', function () {
    instance.setMarkup('abc');
    expect(textarea.value).toBe('abc');
  });

  it('Shows suggestions when a query is entered', function () {
    // Setup
    hooks.search.calls.reset();
    hooks.updateSuggestions.calls.reset();
    hooks.updateActiveSuggestionIndex.calls.reset();
    hooks.toggleSuggestions.calls.reset();

    showSuggestions(fakeSearchResults);

    // Verify
    expect(hooks.search).toHaveBeenCalledWith('query');
    expect(hooks.updateSuggestions).toHaveBeenCalled();
    expect(hooks.updateActiveSuggestionIndex).toHaveBeenCalledWith(0);
    expect(hooks.toggleSuggestions).toHaveBeenCalledWith(true);
  });

  it('Uses keyboard keys to navigate suggestions', function () {
    // Setup
    showSuggestions(fakeSearchResults);
    hooks.updateActiveSuggestionIndex.calls.reset();

    // Press arrow keys
    dispatchEvent(textarea, 'keydown', { keyCode: KEY.UP }); // shouldn't move index, already at top
    dispatchEvent(textarea, 'keydown', { keyCode: KEY.DOWN });
    dispatchEvent(textarea, 'keydown', { keyCode: KEY.DOWN }); // shouldn't move index, already at bottom

    // Verify
    expect(hooks.updateActiveSuggestionIndex.calls.count()).toBe(3);
    expect(hooks.updateActiveSuggestionIndex.calls.argsFor(0)).toEqual([0]);
    expect(hooks.updateActiveSuggestionIndex.calls.argsFor(1)).toEqual([1]);
    expect(hooks.updateActiveSuggestionIndex.calls.argsFor(2)).toEqual([1]);
  });

  it('Applies a suggestion when enter is pressed', function () {
    // Setup
    showSuggestions(fakeSearchResults);

    // Press enter
    dispatchEvent(textarea, 'keydown', { keyCode: KEY.ENTER });

    // Verify
    expect(textarea.value).toBe('Hi, MENTION_LABEL_1');
  });

  it('Clears suggestions when search doesn\'t return results', function () {
    // Setup
    showSuggestions(fakeSearchResults);
    hooks.search.calls.reset();
    hooks.search.and.returnValue(fakePromise([]));
    hooks.updateSuggestions.calls.reset();

    // Type backspace
    textarea.value = 'Hi, @quer';
    textarea.setSelectionRange(9, 9);
    dispatchEvent(textarea, 'input');

    // Verify
    expect(hooks.updateSuggestions).toHaveBeenCalledWith([]);
    expect(hooks.search).toHaveBeenCalledWith('quer');
  });

  it('Hides suggestions when selection is changed', function (done) {
    // Setup
    showSuggestions(fakeSearchResults);
    hooks.toggleSuggestions.calls.reset();

    // Move caret to beginning
    textarea.setSelectionRange(0, 0);
    dispatchEvent(document, 'selectionchange');

    // Verify
    setTimeout(function () { /// timeout to account for debounced selectionchange events
      expect(hooks.toggleSuggestions).toHaveBeenCalledWith(false);
      done();
    });
  });

  it('Hides suggestions on escape', function () {
    // Setup
    showSuggestions(fakeSearchResults);
    hooks.toggleSuggestions.calls.reset();

    // Press escape
    dispatchEvent(textarea, 'keydown', { keyCode: KEY.ESCAPE });

    // Verify
    expect(hooks.toggleSuggestions.calls.count()).toBe(1);
    expect(hooks.toggleSuggestions).toHaveBeenCalledWith(false);
  });

  it('Hides suggestions on blur', function (done) {
    // Setup
    showSuggestions(fakeSearchResults);
    hooks.toggleSuggestions.calls.reset();

    // Blur textarea
    dispatchEvent(textarea, 'blur');

    // Verify
    setTimeout(function () {
      expect(hooks.toggleSuggestions).toHaveBeenCalledWith(false);
      done();
    }, 250);
  });

});
