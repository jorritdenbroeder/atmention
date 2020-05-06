import './log.spec';
import './util.spec';
import './parse.spec';
import './format.spec';
import './controller.spec';

// Ensure untested source code is also included in coverage
var source = (require as any).context('../src', true, /.*\.(js|ts)$/);
source.keys().forEach(source);
