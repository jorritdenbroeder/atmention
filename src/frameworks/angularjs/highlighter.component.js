'use strict';

angular.module('atmentionModule')
  .component('atmentionHighlighter', {
    template: require('./highlighter.component.html'),
    controller: HighlighterController,
    bindings: {
      segments: '<'
    }
  });

function HighlighterController() {
}
