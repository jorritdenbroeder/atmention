'use strict';

angular.module('appModule')
  .component('appRoot', {
    template: require('./root.component.html'),
    controller: RootController
  });

function RootController($timeout) {
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

  ctrl.markup = 'Hi [Wim](WimKeizer)!';

  ctrl.search = function (query) {
    return $timeout(function () {
      return data.filter(function (item) {
        return query === 'all' || item.name.toLowerCase().startsWith(query);
      })
        .map(function (item) {
          return {
            suggestion: '<b>' + item.name + '</b>',
            label: item.name,
            value: item.id
          };
        });
    }, 250);
  };

}
