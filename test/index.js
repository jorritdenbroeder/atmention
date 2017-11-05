'use strict';

require('angular');
require('angular-mocks');
require('../src/angularjs')

// Core tests
require('./core/log.spec');
require('./core/util.spec');
require('./core/parse.spec');
require('./core/format.spec');
require('./core/controller.spec');

// AngularJS tests
require('./angularjs/atmention.filter.spec');

// Require all tests
// var tests = require.context('.', true, /.*\.spec\.js$/);
// tests.keys().forEach(tests);

// Ensure untested source code is also included in coverage
var source = require.context('../src', true, /.*\.js$/);
source.keys().forEach(source);
