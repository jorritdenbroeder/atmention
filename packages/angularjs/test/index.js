'use strict';

require('angular');
require('angular-mocks');
require('..')

// Require all tests
var tests = require.context('.', true, /.*\.spec\.js$/);
tests.keys().forEach(tests);

// Ensure untested source code is also included in coverage
var source = require.context('../src', true, /.*\.js$/);
source.keys().forEach(source);
