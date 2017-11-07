'use strict';

describe('Filter', function () {

  var $filter;

  beforeEach(function () {
    angular.mock.module('atmentionModule');
    angular.mock.inject(function ($injector) {
      $filter = $injector.get('$filter');
    });
  });

  it('Formats markup as plain text', function () {
    var result = $filter('atmention')('Testing [123](some_id)').getDisplay();
    expect(result).toBe('Testing 123');
  });

});
