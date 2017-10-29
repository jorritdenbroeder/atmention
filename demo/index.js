'use strict';

require('./styles/index.scss');

require('angular');
require('angular-sanitize');
require('../src/angularjs');
require('./app/app.module');
require('./app/root.component');

angular.bootstrap(document, ['appModule']);
