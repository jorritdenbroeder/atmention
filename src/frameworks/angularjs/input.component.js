'use strict';

angular.module('atmentionModule')
  .component('atmentionTextarea', {
    require: {
      ngModel: '?ngModel'
    },
    template: require('./input.component.html'),
    controller: InputController,
    bindings: {
      searchHook: '<search'
    }
  });

function InputController($element, $scope, $timeout, atmention) {
  var ctrl = this;
  var editor;
  var inputElement;
  var lastQuery;

  ctrl.markup = '';
  ctrl.suggestions = [];
  ctrl.segments = []; // for highlighter
  ctrl.$onInit = $onInit;
  ctrl.$onDestroy = $onDestroy;
  ctrl.applySuggestion = applySuggestion;

  function $onInit() {
    editor = atmention.editor();

    inputElement = $element.find('textarea')[0];

    // Parse markup whenever the ngModel value changes
    if (ctrl.ngModel) {
      ctrl.ngModel.$formatters.push(function (value) {
        console.log('--------', value);
        editor.parseMarkup(value || '');
        updateDisplay();
        updateDebugInfo();
      });
    }

    /**
     * NOTES
     * For touch-long-press-to-select, Firefox triggers 'select'. Chrome doesn't, and triggers 'selectionchange' instead
     * See:
     * - Event reference https://developer.mozilla.org/en-US/docs/Web/Events/selectionchange
     * - Cases for selection change https://github.com/2is10/selectionchange-polyfill
     */
    document.addEventListener('selectionchange', onSelectionChanged);

    // Needed for Firefox to keep selection range in sync
    inputElement.addEventListener('select', onSelectionChanged);
    inputElement.addEventListener('keyup', onSelectionChanged);
    inputElement.addEventListener('mousedown', onSelectionChanged);

    inputElement.addEventListener('input', onInput);

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
    editor.setSelectionRange(inputElement.selectionStart, inputElement.selectionEnd);
    detectSearchQuery();
    updateDebugInfo();
  }

  function onInput(evt) {
    var text = inputElement.value;
    var start = evt.target.selectionStart;
    var end = evt.target.selectionEnd;

    editor.applyDisplayValue(text, start, end);
    updateDisplay();

    detectSearchQuery();

    updateDebugInfo();
  }

  // Scans for new @mention right before caret
  function detectSearchQuery() {
    var queryInfo = editor.detectSearchQuery(inputElement.value, inputElement.selectionStart, inputElement.selectionEnd);
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
    else if (ctrl.searchHook) {
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
    updateDisplay();
  }

  function updateDisplay() {
    inputElement.value = editor.getDisplay();
    inputElement.selectionStart = editor.getSelectionRange().start;
    inputElement.selectionEnd = editor.getSelectionRange().end;
    ctrl.segments = editor.getSegments();

    if (ctrl.ngModel) {
      ctrl.ngModel.$setViewValue(editor.getMarkup());
    }
  }

  function updateDebugInfo() {
    $scope.$evalAsync(function () {
      ctrl.markup = editor.getMarkup();
      ctrl.selectionStart = '' + editor.getSelectionRange().start;
      ctrl.selectionEnd = '' + editor.getSelectionRange().end;
    });
  }

}
