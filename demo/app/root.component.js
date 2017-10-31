'use strict';

angular.module('appModule')
  .component('appRoot', {
    template: require('./root.component.html'),
    controller: RootController
  });

function RootController($timeout, atmention) {
  var ctrl = this;

  var data = [
    {
      name: 'Wim',
      id: 'wim@example.com'
    },
    {
      name: 'Menno',
      id: 'menno@example.com'
    },
    {
      name: 'Gert',
      id: 'gert@example.com'
    },
    {
      name: 'Alex',
      id: 'alex@example.com'
    }
  ];

  ctrl.markup = '';

  ctrl.search = function (query) {
    return $timeout(function () {
      return data.filter(function (item) {
        return query === 'all' || item.name.toLowerCase().startsWith(query);
      })
        .map(function (item) {
          return {
            label: item.name,
            display: item.name,
            id: item.id
          };
        });
    }, 250);
  };

  ctrl.save = function () {
    var mentions = atmention.extractMentions(ctrl.markup);
    console.log(mentions);
  };

}
