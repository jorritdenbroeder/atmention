'use strict';

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
  var atmentionTextarea;

  ctrl.debugInfo = '';
  ctrl.suggestions = [];
  ctrl.suggestionsVisible = false;
  ctrl.activeSuggestionIndex = -1;
  ctrl.segments = []; // for highlighter

  ctrl.$onInit = $onInit;
  ctrl.$onDestroy = $onDestroy;
  ctrl.applySuggestion = applySuggestion;

  function $onInit() {
    var atmentionConfig = {
      inputElement: $element.find('textarea')[0],
      highlighterElement: $element.find('atmention-highlighter')[0],
      hooks: {
        angularAsync: evalAsync,
        search: search,
        toggleSuggestions: toggleSuggestions,
        updateMarkup: updateMarkup,
        updateHighlighter: updateHighlighter,
        updateSuggestions: updateSuggestions,
        updateActiveSuggestionIndex: updateActiveSuggestionIndex,
        updateDebugInfo: updateDebugInfo
      }
    };

    atmentionTextarea = atmention.textarea(atmentionConfig);

    // Reload markup whenever the ngModel value changes
    if (ctrl.ngModel) {
      ctrl.ngModel.$formatters.push(function (value) {
        atmentionTextarea.setMarkup(value);
      });
    }
  }

  function $onDestroy() {
    atmentionTextarea.destroy();
  }

  function evalAsync(func) {
    $scope.$evalAsync(func);
  }

  function search(query) {
    ctrl.query = query;
    return ctrl.searchHook(query);
  }

  function toggleSuggestions(bool) {
    ctrl.suggestionsVisible = bool;
  }

  function updateMarkup(markup) {
    if (ctrl.ngModel) {
      ctrl.ngModel.$setViewValue(markup);
    }
  }

  function updateHighlighter(segments) {
    ctrl.segments = segments;
  }

  function updateSuggestions(suggestions) {
    ctrl.suggestions = suggestions;
  }

  function updateActiveSuggestionIndex(index) {
    ctrl.activeSuggestionIndex = index;
  }

  function updateDebugInfo(text) {
    ctrl.debugInfo = text;
  }

  function applySuggestion(suggestion) {
    atmentionTextarea.applySuggestion(suggestion);
  }

}
