'use strict';

require('angular');

var tests = require.context('.', true, /.*\.spec\.js$/);
tests.keys().forEach(tests);

var source = require.context('.', true, /.*\.js$/);
source.keys().forEach(source);
