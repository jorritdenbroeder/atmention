'use strict';

var textEditor = require('./editor');
var markupToHtml = require('./markup-to-html');

var KEY = {
  ENTER: 13,
  ESCAPE: 27,
  UP: 38,
  DOWN: 40
};

var DEFAULT_MARKUP_CLASS = 'atmentionMarkup';
var DEFAULT_CARET_CLASS = 'atmentionCaret';

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
  var suggestionsElement = config.suggestionsElement;
  var markupClass = config.markupClass || DEFAULT_MARKUP_CLASS;
  var caretClass = config.caretClass || DEFAULT_CARET_CLASS;
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

  function setMarkup(markup) {
    editor.parseMarkup(markup);
    updateDisplay();
    updateHighlights();
  }

  function onSelectionChanged(/* evt */) {
    editor.handleSelectionChangeEvent(inputElement.selectionStart, inputElement.selectionEnd);
    setSuggestionsCoords();

    // Wait until all selection changes have fired (for IME composition input events, browser fires multiple selection
    // changes
    numUnappliedSelectionChanges += 1;

    setTimeout(function () {
      numUnappliedSelectionChanges -= 1;

      if (!numUnappliedSelectionChanges && forcedCaretPositionAfterNextSelectionChanges !== null) {
        inputElement.selectionStart = forcedCaretPositionAfterNextSelectionChanges;
        inputElement.selectionEnd = forcedCaretPositionAfterNextSelectionChanges;
        forcedCaretPositionAfterNextSelectionChanges = null;
      }

      updateHighlights();
      detectSearchQuery();
      updateDebugInfo();
    }, 0);
  }

  function onInput(evt) {
    var text = inputElement.value;
    var start = evt.target.selectionStart;
    var end = evt.target.selectionEnd;

    editor.handleInputEvent(text, start, end);

    // Force caret position on next selectionchange event
    // TODO only needed if a mention was inserted/deleted
    forcedCaretPositionAfterNextSelectionChanges = editor.getSelectionRange().end;

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
    var caret = highlighterElement.querySelector('.' + caretClass);
    var coords = caret.getBoundingClientRect();
    var inputElmCoords = inputElement.getBoundingClientRect();
    var verticalOffset = 4;

    suggestionsElement.style.top = coords.bottom + verticalOffset + 'px';
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
    // Using timeout to prevent active suggestion from being reset before we had a chance to handle it.
    // FIXME: solve without using a timeout
    setTimeout(function () {
      setSuggestionsVisibility(false);
    }, 250);
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
    setSuggestionsVisibility(false);

    if (!config.hooks.search) {
      return;
    }

    if (!queryInfo.query) {
      return;
    }

    config.hooks.search(queryInfo.query).then(function (searchResults) {
      if (!searchResults) {
        // Explicitly log
        /* eslint no-console:0 */
        console.error('[atmention] Search callback must return an array');
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
    inputElement.value = editor.getDisplay();
    async(function () {
      config.hooks.updateMarkup(editor.getMarkup());
    });
  }

  function updateHighlights() {
    highlighterElement.innerHTML = markupToHtml(
      editor.getSegments(),
      editor.getSelectionRange().end,
      markupClass,
      caretClass
    );
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
    setSuggestionsVisibility(false);
    updateDisplay();
    updateHighlights();
    inputElement.focus();

    // Force caret position on next selectionchange event
    forcedCaretPositionAfterNextSelectionChanges = editor.getSelectionRange().end;
  }

  function updateDebugInfo() {
    var selectionRange = editor.getSelectionRange();
    var debugInfo = [
      'selection: [' + selectionRange.start + ',' + selectionRange.end + ']'
    ].join('; ');

    async(function () {
      config.hooks.updateDebugInfo(debugInfo);
    });
  }

  return instance;
};
