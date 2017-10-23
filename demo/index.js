'use strict';

require('angular');
require('../src/frameworks/angularjs');
require('./app/app.module');
require('./app/root.component');

angular.bootstrap(document, ['appModule']);
