'use strict';

require('./log.spec');
require('./util.spec');
require('./parse.spec');
require('./format.spec');
require('./controller.spec');

// Ensure untested source code is also included in coverage
var source = require.context('../src', true, /.*\.js$/);
source.keys().forEach(source);
