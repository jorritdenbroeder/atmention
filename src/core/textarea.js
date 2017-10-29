'use strict';

var textEditor = require('./editor');

var KEY = {
  ENTER: 13,
  ESCAPE: 27,
  UP: 38,
  DOWN: 40
};

/**
 * Textarea component with atmention functionality
 *
 * @param config
 * @param config.inputElement textarea for user input
 * @param config.highlighterElement DOM element for highlighting mentions
 * @param config.hooks callbacks fired when the view needs to be updeted
 */
module.exports = function (config) {
  var instance = {};
  var editor;
  var inputElement = config.inputElement;
  var highlighterElement = config.highlighterElement;
  var destroyQueue = [];
  var lastQuery;
  var suggestions = [];
  var activeSuggestionIndex = -1;

  var forcedCaretPositionAfterNextSelectionChanges = null;
  var numUnappliedSelectionChanges = 0;

  instance.destroy = destroy;
  instance.setMarkup = setMarkup;
  instance.applySuggestion = applySuggestion;

  init();

  function init () {
    editor = textEditor();

    // Register event listeners
    addListener(document, 'selectionchange', onSelectionChanged);
    addListener(inputElement, 'input', onInput);
    addListener(inputElement, 'scroll', onInputElementScrolled);
    addListener(inputElement, 'keydown', onKeyDown);
    addListener(inputElement, 'blur', onBlur);

    // Keep selection range in sync
    addListener(inputElement, 'select', onSelectionChanged);
    addListener(inputElement, 'keyup', onSelectionChanged);
    addListener(inputElement, 'mousedown', onSelectionChanged);
  }

  function destroy() {
    destroyQueue.forEach(function (func) {
      func();
    });
  }

  function addListener(elm, eventName, listener) {
    elm.addEventListener(eventName, listener);
    destroyQueue.push(function () {
      elm.removeEventListener(eventName, listener);
    });
  }

  function async(func) {
    if (config.hooks.angularAsync) {
      config.hooks.angularAsync(func);
    } else {
      setTimeout(func, 0);
    }
  }

  function setMarkup (markup) {
    editor.parseMarkup(markup);
    updateDisplay();
  }

  function onSelectionChanged(evt) {
    editor.handleSelectionChangeEvent(inputElement.selectionStart, inputElement.selectionEnd);

    // Wait until all selection changes have fired
    numUnappliedSelectionChanges += 1;

    async(function () {
      numUnappliedSelectionChanges -= 1;

      if (!numUnappliedSelectionChanges && forcedCaretPositionAfterNextSelectionChanges !== null) {
        inputElement.selectionStart = forcedCaretPositionAfterNextSelectionChanges;
        inputElement.selectionEnd = forcedCaretPositionAfterNextSelectionChanges;
        forcedCaretPositionAfterNextSelectionChanges = null;
      }

      detectSearchQuery();
      updateDebugInfo();
    });
  }

  function onInput(evt) {
    var text = inputElement.value;
    var start = evt.target.selectionStart;
    var end = evt.target.selectionEnd;

    editor.handleInputEvent(text, start, end);

    // Force caret position on next selectionchange event
    // TODO only needed if a mention was inserted/deleted
    forcedCaretPositionAfterNextSelectionChanges = editor.getSelectionRange().end;

    async(function () {
      updateDisplay();
      detectSearchQuery();
      updateDebugInfo();
    });
  }

  function onInputElementScrolled(evt) {
    // Sync highlighter scroll position
    highlighterElement.scrollTop = inputElement.scrollTop;
    highlighterElement.scrollLeft = inputElement.scrollLeft;
  }

  function onKeyDown(evt) {
    // Do nothing when there are no suggestions
    if (!suggestions || !suggestions.length) {
      return;
    }

    switch (evt.keyCode) {
      case KEY.UP: {
        evt.preventDefault();
        async(function () { moveActiveSuggestionIndex(-1); });
        return;
      }
      case KEY.DOWN: {
        evt.preventDefault();
        async(function () { moveActiveSuggestionIndex(+1); });
        return;
      }
      case KEY.ENTER: {
        evt.preventDefault();
        async(function () { applySuggestion(suggestions[activeSuggestionIndex]); });
        return;
      }
      case KEY.ESCAPE: {
        evt.preventDefault();
        async(clearSuggestions);
        return;
      }
    }
  }

  function clearSuggestions() {
    suggestions = [];
    activeSuggestionIndex = -1;
    config.hooks.updateSuggestions(suggestions);
    config.hooks.updateActiveSuggestionIndex(activeSuggestionIndex);
}

  function onBlur() {
    // Using timeout to prevent active suggestion from being reset before we had a chance to handle it.
    // FIXME: solve without using a timeout
    setTimeout(clearSuggestions, 250);
  }

  // Scans for new @mention search query right before caret
  function detectSearchQuery() {
    var queryInfo = editor.detectSearchQuery(inputElement.value, inputElement.selectionStart, inputElement.selectionEnd);
    var query = queryInfo ? queryInfo.query : null;

    if (query !== lastQuery) {
      lastQuery = query;
      handleQueryChanged(queryInfo || {});
    }
  }

  function handleQueryChanged(queryInfo) {
    if (!config.hooks.search) {
      return;
    }

    if (!queryInfo.query) {
      clearSuggestions();
    }
    else {
      config.hooks.search(queryInfo.query).then(function (searchResults) {
        if (!searchResults) {
          // Explicit log
          console.error('[atmention] Search callback must return an array');
          return;
        }

        // Do nothing if query has changed in the mean time
        if (queryInfo.query !== lastQuery) {
          return;
        }

        if (!searchResults.length) {
          clearSuggestions();
        } else {
          // Show suggestions
          suggestions = searchResults.map(function (searchResult) {
            var suggestion = {
              queryInfo: queryInfo,
              searchResult: searchResult
            };
            return suggestion;
          });
          activeSuggestionIndex = 0;
          config.hooks.updateSuggestions(suggestions);
          config.hooks.updateActiveSuggestionIndex(activeSuggestionIndex);
        }
      });
    }
  }

  function moveActiveSuggestionIndex(direction) {
    var index = activeSuggestionIndex + direction;

    if (index < 0) {
      index = 0;
    }

    if (index > suggestions.length - 1) {
      index = suggestions.length - 1;
    }

    activeSuggestionIndex = index;

    config.hooks.updateActiveSuggestionIndex(activeSuggestionIndex);
  }

  function updateDisplay() {
    inputElement.value = editor.getDisplay();
    config.hooks.updateHighlighter(editor.getSegments());
    config.hooks.updateMarkup(editor.getMarkup());
  }

  /**
   * Inserts a new mention from a suggestion
   *
   * @param suggestion.queryInfo
   * @param suggestion.searchResult
   * @param suggestion.searchResult.display
   * @param suggestion.searchResult.id
   */
  function applySuggestion(suggestion) {
    editor.insertMarkup(suggestion.searchResult.display, suggestion.searchResult.id, suggestion.queryInfo.start, suggestion.queryInfo.end);
    clearSuggestions();
    updateDisplay();
    inputElement.focus();

    // Force caret position on next selectionchange event
    forcedCaretPositionAfterNextSelectionChanges = editor.getSelectionRange().end;
  }

  function updateDebugInfo() {
    var selectionRange = editor.getSelectionRange();
    var debugInfo = [
      'selection: [' + selectionRange.start + ',' + selectionRange.end + ']'
    ].join('; ');
    config.hooks.updateDebugInfo(debugInfo);
  }

  return instance;
};
