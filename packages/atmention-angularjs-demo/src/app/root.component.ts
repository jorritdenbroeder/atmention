import * as angular from 'angular';

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
      name: 'Corné',
      id: 'corne@example.com'
    },
    {
      name: 'D\'Agostino',
      id: 'dagostino@example.com'
    },
  ];

  ctrl.markup = 'Hi, [Wim](person:123) and [Alex](person:456)!';

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

  ctrl.onMentionClicked = function (mention, $event) {
    console.log('Clicked', mention, $event);
  };

}
