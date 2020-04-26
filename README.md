# Atmention

[![Build Status](https://travis-ci.org/jorritdenbroeder/atmention.svg?branch=master)](https://travis-ci.org/jorritdenbroeder/atmention)
[![Coverage Status](https://coveralls.io/repos/github/jorritdenbroeder/atmention/badge.svg?branch=master)](https://coveralls.io/github/jorritdenbroeder/atmention?branch=master)
[![npm version](https://badge.fury.io/js/atmention.svg)](https://badge.fury.io/js/atmention)

## Getting started (AngularJS)

### Install
```bash
npm install --save atmention-angularjs
```

### Import CSS
```scss
@import 'node_modules/atmention-angularjs/dist/atmention-angularjs.css'
```

### Add the module to your app
```javascript
require('angular');
require('atmention-angularjs');

angular.module('app', [
  'atmentionModule'
]);
```

### Component usage
```html
<atmention-textarea
  ng-model="$ctrl.markup"
  placeholder="Use @ to mention someone">
</atmention-textarea>

<button ng-click="$ctrl.save()">Save</button>
```

```javascript
function Controller(atmention) {
  $ctrl.markup = 'Nice groove, [Elvin](elvin@example.com)...'

  $ctrl.save = function () {
    var instance = atmention.parse($ctrl.markup);
    instance.getDisplay(); // 'Nice groove, Elvin...'
    instance.getMarkup(); // 'Nice groove, [Elvin](elvin@example.com)...'
    instance.getMentions(); // [{ label: 'Elvin', value: 'elvin@example.com' }]
  };
}
```
