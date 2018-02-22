'use strict';

angular.module('atmentionModule')
  .component('atmentionRender', {
    template: require('./render.component.html'),
    controller: FormatterController,
    bindings: {
      model: '<'
    },
    transclude: {
      mentionTemplate: '?atmentionMentionTemplate'
    }
  });

function FormatterController() {
  var ctrl = this;

  ctrl.$onChanges = $onChanges;
  ctrl.segments = [];

  function $onChanges(changesObj) {
    // TODO warn if model is not an atmention instance
    var model = changesObj.model.currentValue;

    if (!model) {
      ctrl.segments = [];
      return;
    }

    // Split at mention boundaries
    ctrl.segments = model.splitAtMentions();

    // Replace line breaks with <br/>, so we don't have to use css white-space wrapping
    ctrl.segments.forEach(function (segment) {
      segment.text = segment.text.replace(/\n/g, '<br/>');
    });
  }
}
