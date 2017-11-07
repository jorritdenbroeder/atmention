'use strict';

angular.module('atmentionModule')

  .directive('atmentionNoSuggestionsTemplate', function () {
    return {
      restrict: 'E',
      controller: function ($scope) {
        $scope.$item = $scope.$parent.$item;
      }
    };
  })

  .directive('atmentionSuggestionTemplate', function () {
    return {
      restrict: 'E',
      controller: function ($scope) {
        $scope.$item = $scope.$parent.$item;
      }
    };
  });
