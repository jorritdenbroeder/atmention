'use strict';

require('angular');
require('angular-sanitize');
require('atmention-angularjs');
require('./app/app.module');
require('./app/root.component');

angular.bootstrap(document, ['appModule']);
