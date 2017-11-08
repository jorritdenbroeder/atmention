'use strict';

var parse = require('./parse');
var constants = require('./constants');
var log = require('./log');

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
 * @param config.options
 * @param config.hooks callbacks fired when the view needs to be updeted
 */
function controller(config) {
  var instance = {};
  var message;

  var inputElement = config.inputElement;
  var highlighterElement = config.highlighterElement;
  var suggestionsElement = config.suggestionsElement;
  var destroyQueue = [];
  var lastQuery;
  var suggestions = [];
  var suggestionsVisible = false;
  var activeSuggestionIndex = -1;

  var forcedCaretPositionAfterNextSelectionChanges = null;
  var numUnappliedSelectionChanges = 0;

  instance.destroy = destroy;
  instance.setMarkup = setMarkup;
  instance.applySuggestion = applySuggestion;

  init();

  function init() {
    message = parse('', config.options);

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

    if (config.options.focus) {
      async(function () {
        inputElement.focus();
      });
    }
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

  function setMarkup(markup) {
    message.parseMarkup(markup);
    updateDisplay();
    updateHighlights();
  }

  function onSelectionChanged(/* evt */) {
    message.setSelectionRange(inputElement.selectionStart, inputElement.selectionEnd);

    // Debounce selectionchange events (e.g. after an IME composition input event, Chrome fires multiple selectionchange
    // events)
    numUnappliedSelectionChanges += 1;

    setTimeout(function () {
      numUnappliedSelectionChanges -= 1;

      if (!numUnappliedSelectionChanges && forcedCaretPositionAfterNextSelectionChanges !== null) {
        inputElement.selectionStart = forcedCaretPositionAfterNextSelectionChanges;
        inputElement.selectionEnd = forcedCaretPositionAfterNextSelectionChanges;
        forcedCaretPositionAfterNextSelectionChanges = null;
      }

      updateHighlights();
      setSuggestionsCoords();
      detectSearchQuery();
      updateDebugInfo();
    }, 0);
  }

  function onInput() {
    var text = inputElement.value;
    var start = inputElement.selectionStart;
    var end = inputElement.selectionEnd;

    message.handleInputEvent(text, start, end);

    // Force caret position on next selectionchange event
    // TODO only needed if a mention was inserted/deleted
    forcedCaretPositionAfterNextSelectionChanges = message.getSelectionRange().end;

    updateDisplay();
    updateHighlights();
    detectSearchQuery();
    updateDebugInfo();
  }

  function onInputElementScrolled(/* evt */) {
    // Sync highlighter scroll position
    highlighterElement.scrollTop = inputElement.scrollTop;
    highlighterElement.scrollLeft = inputElement.scrollLeft;
  }

  function onKeyDown(evt) {
    // Do nothing when there are no suggestions
    if (!suggestionsVisible || !suggestions || !suggestions.length) {
      return;
    }

    switch (evt.keyCode) {
      case KEY.UP: {
        evt.preventDefault();
        moveActiveSuggestionIndex(-1);
        return;
      }
      case KEY.DOWN: {
        evt.preventDefault();
        moveActiveSuggestionIndex(+1);
        return;
      }
      case KEY.ENTER: {
        evt.preventDefault();
        applySuggestion(suggestions[activeSuggestionIndex]);
        return;
      }
      case KEY.ESCAPE: {
        evt.preventDefault();
        setSuggestionsVisibility(false);
        return;
      }
    }
  }

  function setSuggestionsVisibility(bool) {
    if (suggestionsVisible === bool) {
      return;
    }
    suggestionsVisible = bool;

    async(function () {
      config.hooks.toggleSuggestions(suggestionsVisible);
    });
  }

  function setSuggestionsCoords() {
    var caretSelector = '.' + constants.HIGHLIGHT_SELECTION_CLASS + '.' + constants.HIGHLIGHT_SELECTION_END_CLASS;
    var caret = highlighterElement.querySelector(caretSelector);
    var caretCoords = caret.getBoundingClientRect();
    var inputElmCoords = inputElement.getBoundingClientRect();

    suggestionsElement.style.top = caretCoords.bottom + 'px';
    suggestionsElement.style.left = inputElmCoords.left + 'px';
    suggestionsElement.style.width = inputElmCoords.width + 'px';
  }

  function clearSuggestions() {
    suggestions = [];
    activeSuggestionIndex = -1;

    async(function () {
      config.hooks.updateSuggestions(suggestions);
      config.hooks.updateActiveSuggestionIndex(activeSuggestionIndex);
    });
  }

  function onBlur() {
    // Using timeout to prevent active suggestion from being removed before we could apply it.
    // FIXME: solve without using a timeout
    setTimeout(function () {
      setSuggestionsVisibility(false);
    }, 250);
  }

  // Scans for new @mention search query right before caret
  function detectSearchQuery() {
    var queryInfo = message.detectSearchQuery(inputElement.value, inputElement.selectionStart, inputElement.selectionEnd);
    var query = queryInfo ? queryInfo.query : null;

    if (query !== lastQuery) {
      lastQuery = query;
      handleQueryChanged(queryInfo || {});
    }
  }

  function handleQueryChanged(queryInfo) {
    setSuggestionsVisibility(false);

    if (!config.hooks.search) {
      return;
    }

    if (!queryInfo.query) {
      return;
    }

    config.hooks.search(queryInfo.query).then(function (searchResults) {
      if (!searchResults) {
        log.error('[atmention] Search callback must return an array');
        return;
      }

      // Do nothing if query has changed in the mean time
      if (queryInfo.query !== lastQuery) {
        return;
      }

      handleSearchResults(searchResults, queryInfo);
    });
  }

  function handleSearchResults(searchResults, queryInfo) {
    if (!searchResults.length) {
      clearSuggestions();
      setSuggestionsVisibility(true);
      return;
    }

    suggestions = searchResults.map(function (searchResult) {
      return {
        queryInfo: queryInfo,
        searchResult: searchResult
      };
    });

    activeSuggestionIndex = 0;
    setSuggestionsVisibility(true);

    async(function () {
      config.hooks.updateSuggestions(suggestions);
      config.hooks.updateActiveSuggestionIndex(activeSuggestionIndex);
    });
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

    async(function () {
      config.hooks.updateActiveSuggestionIndex(activeSuggestionIndex);
    });
  }

  function updateDisplay() {
    inputElement.value = message.getDisplay();
    async(function () {
      config.hooks.updateMarkup(message.getMarkup());
    });
  }

  function updateHighlights() {
    var html = message.toHTML({
      selectionRange: message.getSelectionRange(),
      mentionClass: constants.HIGHLIGHT_MENTION_CLASS,
      selectionClass: constants.HIGHLIGHT_SELECTION_CLASS,
      selectionStartClass: constants.HIGHLIGHT_SELECTION_START_CLASS,
      selectionEndClass: constants.HIGHLIGHT_SELECTION_END_CLASS
    });

    // Add extra line to match textarea padding
    html += '\n';

    highlighterElement.innerHTML = html;
  }

  /**
   * Inserts a new mention from a suggestion
   *
   * @param suggestion.queryInfo.start
   * @param suggestion.queryInfo.end
   * @param suggestion.searchResult.label
   * @param suggestion.searchResult.value
   */
  function applySuggestion(suggestion) {
    var searchResult = suggestion.searchResult;
    var queryInfo = suggestion.queryInfo;

    if (!searchResult || !searchResult.label || !searchResult.value || !('start' in queryInfo) || !('end' in queryInfo)) {
      log.error('Invalid suggestion');
      return;
    }

    message.insertMention(searchResult.label, searchResult.value, queryInfo.start, queryInfo.end);

    setSuggestionsVisibility(false);
    updateDisplay();
    updateHighlights();
    inputElement.focus();

    // Force caret position on next selectionchange event
    forcedCaretPositionAfterNextSelectionChanges = message.getSelectionRange().end;
  }

  function updateDebugInfo() {
    if (!config.hooks.updateDebugInfo) {
      return;
    }

    var selectionRange = message.getSelectionRange();
    var debugInfo = [
      'selection: [' + selectionRange.start + ',' + selectionRange.end + ']'
    ].join('; ');

    async(function () {
      config.hooks.updateDebugInfo(debugInfo);
    });
  }

  return instance;
}

module.exports = controller;
