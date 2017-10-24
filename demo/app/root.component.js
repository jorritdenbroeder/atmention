'use strict';

angular.module('appModule')
  .component('appRoot', {
    template: require('./root.component.html'),
    controller: RootController
  });

function RootController($timeout) {
  var ctrl = this;

  ctrl.markup = 'It\'s amazing, @[Mike](mailto:mike@example.com)! @w';

  ctrl.search = function (query) {
    return $timeout(function () {
      return [{
        label: query,
        display: query,
        id: query + '@example.com'
      }];
    });
  };
}
