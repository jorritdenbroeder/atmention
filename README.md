# atmention

[![Build Status](https://travis-ci.org/jorritdenbroeder/atmention.svg?branch=master)](https://travis-ci.org/jorritdenbroeder/atmention)
[![Coverage Status](https://coveralls.io/repos/github/jorritdenbroeder/atmention/badge.svg?branch=master)](https://coveralls.io/github/jorritdenbroeder/atmention?branch=master)
[![npm version](https://badge.fury.io/js/atmention.svg)](https://badge.fury.io/js/atmention)

Textarea with @mention autocomplete for AngularJS

## Installation (AngularJS)

Using npm
```
$ npm install --save atmention-angularjs
```

Import the stylesheet:
```
import 'node_modules/atmention-angularjs/dist/atmention-angularjs.css'
```

Register the module to your app (using webpack)
```
require('angular');
require('atmention-angularjs');

angular.module('app', [
  'atmentionModule'
]);
```

## Example usage (AngularJS)

Template
```
<atmention-textarea
  ng-model="$ctrl.markup"
  placeholder="Use @ to mention someone">
</atmention-textarea>

<button ng-click="$ctrl.save()">Save</button>
```

Controller
```
function Controller(atmention) {
  $ctrl.markup = 'Nice groove, [Elvin](elvin@example.com)...'

  $ctrl.save = function () {
    var instance = atmention.parse($ctrl.markup);
    // instance.getDisplay(); // 'Nice groove, Elvin...'
    // instance.getMarkup(); // 'Nice groove, [Elvin](elvin@example.com)...'
    // instance.getMentions(); // [{ label: 'Elvin', value: 'elvin@example.com' }]
  };
}
```

## Development

Clone this repo, then:
* `npm install` - Installs dependencies + links workspaces
* `npm start` - Runs development server
* Go to http://localhost:8081

To link npm packages locally:
* `cd <atmention>/packages/angularjs`
* `npm link`
* `cd <app>`
* `npm link atmention-angularjs` - Creates a symlink in &lt;app&gt;/node_modules
