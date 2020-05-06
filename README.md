# Atmention

![CI](https://github.com/jorritdenbroeder/atmention/workflows/CI/badge.svg?branch=master)
[![npm version](https://badge.fury.io/js/atmention-angular.svg)](https://badge.fury.io/js/atmention-angular-core)

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
