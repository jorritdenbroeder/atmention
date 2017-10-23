'use strict';

angular.module('appModule')
  .component('appRoot', {
    template: require('./root.component.html'),
    controller: RootController
  });

function RootController($timeout) {
  var ctrl = this;

  ctrl.search = function (query) {
    return $timeout(function () {
      return [{
        label1: query,
        label2: query + '@example.com',
        display: query,
        id: query + '@example.com'
      }];
    });
  };
}
