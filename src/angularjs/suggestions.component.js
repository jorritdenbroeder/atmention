'use strict';

angular.module('atmentionModule')
  .component('atmentionSuggestions', {
    template: require('./suggestions.component.html'),
    controller: SuggestionsController,
    bindings: {
      suggestions: '<',
      activeSuggestionIndex: '<',
      onSelect: '<'
    }
  });

function SuggestionsController() {
  var ctrl = this;
  var offset = 0;

  ctrl.visibleSuggestions = [];
  ctrl.visibleSuggestionIndex = 0;

  ctrl.$onChanges = $onChanges;

  function $onChanges(changesObj) {
    if (changesObj.suggestions) {
      offset = 0;
    }
    showSuggestions();
  }

  // Show 3 suggestions at most
  function showSuggestions() {
    var result = [];
    var maxResults = Math.min(3, ctrl.suggestions.length);

    ctrl.visibleSuggestionIndex = ctrl.activeSuggestionIndex - offset;

    if (ctrl.visibleSuggestionIndex < 0) {
      ctrl.visibleSuggestionIndex = 0;
      offset = ctrl.activeSuggestionIndex;
    }

    if (ctrl.visibleSuggestionIndex > offset + maxResults - 1) {
      ctrl.visibleSuggestionIndex = maxResults - 1;
      offset = ctrl.activeSuggestionIndex - maxResults + 1;
    }

    for (var index = 0; index < maxResults; index += 1) {
      result.push(ctrl.suggestions[offset + index]);
    }

    ctrl.visibleSuggestions = result;
  }

}
