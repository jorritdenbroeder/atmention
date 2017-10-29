'use strict';

angular.module('atmentionModule')
  .component('atmentionHighlighter', {
    template: require('./highlighter.component.html'),
    controller: HighlighterController,
    bindings: {
      segments: '<'
    }
  });

function HighlighterController($element) {
  var ctrl = this;

  ctrl.$onChanges = function (changesObj) {
    $element.empty();

    if (changesObj.segments) {
      generateDOM(changesObj.segments.currentValue);
    }
  };

  function generateDOM(segments) {
    var MARKUP_CLASS = 'markup';

    segments.forEach(function (segment) {
      // Create segment
      var segmentElement = angular.element('<span>').addClass(segment.data ? MARKUP_CLASS : null);
      segmentElement[0].innerHTML = segment.display.text;
      $element.append(segmentElement);
    });

    // Ensure new line at the end to fix highlighter scrolling issue
    $element.append('<br/><br/>');
  }

}
