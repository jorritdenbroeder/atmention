'use strict';

angular.module('atmentionModule')
  .component('atmentionSuggestions', {
    template: require('./suggestions.component.html'),
    controller: SuggestionsController,
    bindings: {
      query: '<',
      suggestions: '<',
      activeSuggestionIndex: '<',
      onSelect: '<'
    }
  });

function SuggestionsController() {
}
