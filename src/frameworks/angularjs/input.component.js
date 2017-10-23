'use strict';

angular.module('atmentionModule')
  .component('atmention', {
    template: require('./input.component.html'),
    controller: InputController,
    bindings: {
      searchHook: '<'
    }
  });

function InputController($element, $scope, $timeout, atmention) {
  var ctrl = this;
  var editor;
  var displayElm;
  var markupElm;
  var lastQuery;

  ctrl.markup = '';
  ctrl.suggestions = [];
  ctrl.$onInit = $onInit;
  ctrl.$onDestroy = $onDestroy;
  ctrl.applySuggestion = applySuggestion;

  function $onInit() {
    editor = atmention.editor();
    editor.parseMarkup('It\'s amazing, @[Mike](mailto:mike@example.com)! @w');

    // Find DOM elements
    var elm = $element.find('textarea');
    displayElm = elm[0];
    markupElm = elm[1];

    // Set initial values
    displayElm.value = editor.getDisplay();
    displayElm.focus();
    displayElm.addEventListener('input', onInput);

    onSelectionChanged();
    updateDebugInfo();

    /**
     * NOTES
     * For touch-long-press-to-select, Firefox triggers 'select'. Chrome doesn't, and triggers 'selectionchange' instead
     * See:
     * - Event reference https://developer.mozilla.org/en-US/docs/Web/Events/selectionchange
     * - Cases for selection change https://github.com/2is10/selectionchange-polyfill
     */
    document.addEventListener('selectionchange', onSelectionChanged);

    // Needed for Firefox to keep selection range in sync
    displayElm.addEventListener('select', onSelectionChanged);

    // Reset on blur, to prevent range from being deleted on drop-from-outside (Firefox)
    // displayElm.addEventListener('blur', function (e) {
    //   editor.setSelectionRange(0, 0);
    //   updateDebugInfo();
    // });
  }

  function $onDestroy() {
    // TODO remove event listeners
  }

  function onSelectionChanged(e) {
    editor.setSelectionRange(displayElm.selectionStart, displayElm.selectionEnd);
    detectSearchQuery();
    updateDebugInfo();
  }

  function onInput(evt) {
    var text = displayElm.value;
    var start = evt.target.selectionStart;
    var end = evt.target.selectionEnd;

    editor.applyDisplayValue(text, start, end);

    displayElm.value = editor.getDisplay();
    displayElm.selectionStart = editor.getSelectionRange().start;
    displayElm.selectionEnd = editor.getSelectionRange().end;

    detectSearchQuery();

    updateDebugInfo();
  }

  // Scans for new @mention right before caret
  function detectSearchQuery() {
    var queryInfo = editor.detectSearchQuery(displayElm.value, displayElm.selectionStart, displayElm.selectionEnd);
    var query = queryInfo ? queryInfo.query : null;
    if (query !== lastQuery) {
      lastQuery = query;
      handleQueryChanged(queryInfo || {});
    }
  }

  function handleQueryChanged(queryInfo) {
    if (!queryInfo.query) {
      ctrl.suggestions = [];
    }
    else {
      ctrl.searchHook(queryInfo.query).then(function (searchResults) {
        ctrl.suggestions = searchResults.map(function (searchResult) {
          var suggestion = {
            queryInfo: queryInfo,
            searchResult: searchResult
          };
          return suggestion;
        });
      });
    }
    $scope.$evalAsync();
  }

  /**
   * Inserts a new mention from a suggestion
   * @param suggestion.queryInfo
   * @param suggestion.searchResult
   * @param suggestion.searchResult.display
   * @param suggestion.searchResult.id
   */
  function applySuggestion(suggestion) {
    console.log('Applying', suggestion);
    editor.insertMarkup(suggestion.searchResult.display, suggestion.searchResult.id, suggestion.queryInfo.start, suggestion.queryInfo.end);
    displayElm.value = editor.getDisplay();
    displayElm.selectionStart = editor.getSelectionRange().start;
    displayElm.selectionEnd = editor.getSelectionRange().end;
  }

  function updateDebugInfo() {
    $scope.$evalAsync(function () {
      ctrl.markup = editor.getMarkup();
      ctrl.selectionStart = '' + editor.getSelectionRange().start;
      ctrl.selectionEnd = '' + editor.getSelectionRange().end;
    });
  }

}
