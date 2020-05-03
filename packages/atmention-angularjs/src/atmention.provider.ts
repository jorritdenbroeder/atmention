import * as angular from 'angular';
import * as atmention from 'atmention-core';

angular.module('atmentionModule')
  .provider('atmention', ({
    $get: () => atmention
  }));

export { };
