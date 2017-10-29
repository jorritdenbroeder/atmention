'use strict';

var KEY = {
  ENTER: 13,
  ESCAPE: 27,
  UP: 38,
  DOWN: 40
};

angular.module('atmentionModule')
  .component('atmentionTextarea', {
    require: {
      ngModel: '?ngModel'
    },
    template: require('./input.component.html'),
    controller: InputController,
    bindings: {
      placeholder: '@',
      searchHook: '<search'
    }
  });

function InputController($element, $scope, $timeout, atmention) {
  var ctrl = this;
  var destroyQueue = [];
  var editor;
  var inputElement;
  var highlighterElement;
  var lastQuery;
  var forcedCaretPositionAfterNextSelectionChanges = null;
  var numUnappliedSelectionChanges = 0;

  ctrl.debugInfo = '';
  ctrl.suggestions = [];
  ctrl.activeSuggestionIndex = -1;
  ctrl.segments = []; // for highlighter
  ctrl.$onInit = $onInit;
  ctrl.$onDestroy = $onDestroy;
  ctrl.applySuggestion = applySuggestion;

  function $onInit() {
    editor = atmention.editor();

    inputElement = $element.find('textarea')[0];
    highlighterElement = $element.find('atmention-highlighter')[0];

    // Reload markup whenever the ngModel value changes
    if (ctrl.ngModel) {
      ctrl.ngModel.$formatters.push(function (value) {
        editor.parseMarkup(value || '');
        updateDisplay();
        updateDebugInfo();
      });
    }

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

  function $onDestroy() {
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

  function onSelectionChanged(evt) {
    editor.handleSelectionChangeEvent(inputElement.selectionStart, inputElement.selectionEnd);

    // Wait until all selection changes have fired
    numUnappliedSelectionChanges += 1;

    $scope.$evalAsync(function () {
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

    $scope.$evalAsync(function () {
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
    if (!ctrl.suggestions || !ctrl.suggestions.length) {
      return;
    }

    switch (evt.keyCode) {
      case KEY.UP: {
        evt.preventDefault();
        $scope.$evalAsync(function () { moveActiveSuggestionIndex(-1); });
        return;
      }
      case KEY.DOWN: {
        evt.preventDefault();
        $scope.$evalAsync(function () { moveActiveSuggestionIndex(+1); });
        return;
      }
      case KEY.ENTER: {
        evt.preventDefault();
        $scope.$evalAsync(function () { applySuggestion(ctrl.activeSuggestion); });
        return;
      }
      case KEY.ESCAPE: {
        evt.preventDefault();
        $scope.$evalAsync(clearSuggestions);
        return;
      }
    }
  }

  function onBlur() {
    // Using timeout to prevent active suggestion from being reset before we had a chance to handle it.
    // FIXME: solve without using a timeout
    $timeout(clearSuggestions, 250);
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
    if (!ctrl.searchHook) {
      return;
    }

    if (!queryInfo.query) {
      clearSuggestions();
    }
    else {
      ctrl.searchHook(queryInfo.query).then(function (searchResults) {
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
          ctrl.suggestions = searchResults.map(function (searchResult) {
            var suggestion = {
              queryInfo: queryInfo,
              searchResult: searchResult
            };
            return suggestion;
          });
          ctrl.activeSuggestionIndex = 0;
          ctrl.activeSuggestion = ctrl.suggestions[0];
        }
      });
    }
  }

  function moveActiveSuggestionIndex(direction) {
    var index = ctrl.activeSuggestionIndex + direction;

    if (index < 0) {
      index = 0;
    }

    if (index > ctrl.suggestions.length - 1) {
      index = ctrl.suggestions.length - 1;
    }

    ctrl.activeSuggestionIndex = index;
    ctrl.activeSuggestion = ctrl.suggestions[index];
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

  function clearSuggestions() {
    ctrl.suggestions = [];
    ctrl.activeSuggestion = null;
    ctrl.activeSuggestionIndex = -1;
  }

  function updateDisplay() {
    inputElement.value = editor.getDisplay();

    // Update highlighter
    ctrl.segments = editor.getSegments();

    if (ctrl.ngModel) {
      ctrl.ngModel.$setViewValue(editor.getMarkup());
    }
  }

  function updateDebugInfo() {
    var selectionRange = editor.getSelectionRange();
    ctrl.debugInfo = [
      'selection: [' + selectionRange.start + ',' + selectionRange.end + ']'
    ].join('; ');
  }

}
