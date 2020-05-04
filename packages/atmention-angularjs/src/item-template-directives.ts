import * as angular from 'angular';

angular.module('atmentionModule')
  .directive('atmentionNoSuggestionsTemplate', itemTemplateDirective)
  .directive('atmentionSuggestionTemplate', itemTemplateDirective)
  .directive('atmentionMentionTemplate', itemTemplateDirective);

/**
 * Exposes an $item to the $parent scope, so the calling context can use {{ $item }} instead of {{ $parent.$item }}
 */
function itemTemplateDirective() {
  return {
    restrict: 'E',
    controller: function ($scope) {
      $scope.$item = $scope.$parent.$item;
    }
  };
}

export { };
