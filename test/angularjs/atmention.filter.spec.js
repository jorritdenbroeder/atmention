'use strict';

describe('AngularJS', function () {

  var $filter;

  beforeEach(function () {
    angular.mock.module('atmentionModule');
    angular.mock.inject(function ($injector) {
      $filter = $injector.get('$filter');
    });
  });

  it('Filter', function () {
    var result = $filter('atmention')('Testing [123](some_id)');
    expect(result).toBe('Testing 123');
  });

});
