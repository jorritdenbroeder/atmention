'use strict';

angular.module('atmentionModule')
  .component('atmentionSuggestions', {
    template: require('./suggestions.component.html'),
    controller: SuggestionsController,
    bindings: {
      suggestions: '<',
      onSelect: '<'
    }
  });

function SuggestionsController() {
}
