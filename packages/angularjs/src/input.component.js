'use strict';

var suggestionsOverlayTemplate = require('./suggestions-overlay.html');

angular.module('atmentionModule')
  .component('atmentionTextarea', {
    require: {
      ngModel: '?ngModel'
    },
    template: require('./input.component.html'),
    controller: InputController,
    bindings: {
      placeholder: '@',
      mentionTemplate: '@',
      searchHook: '<search'
    },
    transclude: {
      noSuggestionsTemplate: '?atmentionNoSuggestionsTemplate',
      suggestionTemplate: '?atmentionSuggestionTemplate'
    }
  });

function InputController($element, $scope, $timeout, $compile, $transclude, atmention) {
  var ctrl = this;
  var suggestionsElement;
  var atmentionController;

  ctrl.debugInfo = '';
  ctrl.suggestions = [];
  ctrl.suggestionsVisible = false;
  ctrl.activeSuggestionIndex = -1;

  ctrl.$onInit = $onInit;
  ctrl.$onDestroy = $onDestroy;
  ctrl.applySuggestion = applySuggestion;
  ctrl.initLocalsForNoSuggestionsTemplate = initLocalsForNoSuggestionsTemplate;
  ctrl.initLocalsForSuggestionsTemplate = initLocalsForSuggestionsTemplate;

  function $onInit() {
    suggestionsElement = compileSuggestionsOverlay();

    atmentionController = atmention.controller({
      inputElement: $element.find('textarea')[0],
      highlighterElement: $element.find('atmention-highlighter')[0],
      suggestionsElement: suggestionsElement[0],
      options: {
        mentionTemplate: ctrl.mentionTemplate
      },
      hooks: {
        angularAsync: evalAsync,
        search: search,
        toggleSuggestions: toggleSuggestions,
        updateMarkup: updateMarkup,
        updateSuggestions: updateSuggestions,
        updateActiveSuggestionIndex: updateActiveSuggestionIndex,
        updateDebugInfo: updateDebugInfo
      }
    });

    // Reload markup whenever the ngModel value changes
    if (ctrl.ngModel) {
      ctrl.ngModel.$formatters.push(function (value) {
        atmentionController.setMarkup(value);
      });
    }
  }

  function $onDestroy() {
    suggestionsElement.remove();
    atmentionController.destroy();
  }

  function evalAsync(func) {
    $scope.$evalAsync(func);
  }

  /**
   * Compile suggestions overlay
   * - Appended to document.body
   * - Operates in the same scope as this controller
   */
  function compileSuggestionsOverlay() {
    var linkFunc = $compile(suggestionsOverlayTemplate);

    var linkOptions = {
      parentBoundTranscludeFn: $transclude
    };

    var overlayScope = $scope;

    var overlayElement = linkFunc(overlayScope, function (clone) {
      angular.element(document.body).append(clone);
    }, linkOptions);

    return overlayElement;
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
    atmentionController.applySuggestion(suggestion);
  }

  function initLocalsForNoSuggestionsTemplate(ngIfScope) {
    ngIfScope.$item = {
      query: ctrl.query
    };
  }

  function initLocalsForSuggestionsTemplate(ngRepeatScope) {
    ngRepeatScope.$item = {
      index: ngRepeatScope.$index,
      active: ngRepeatScope.$index === ctrl.activeSuggestionIndex,
      label: ngRepeatScope.suggestion.searchResult.label,
      value: ngRepeatScope.suggestion.searchResult.value,
      query: ctrl.query,
      data: ngRepeatScope.suggestion.searchResult.data
    };

    var unwatch = $scope.$watch('$ctrl.activeSuggestionIndex', function (index) {
      ngRepeatScope.$item.active = ngRepeatScope.$index === index;
    });

    ngRepeatScope.$on('$destroy', unwatch);
  }

}
