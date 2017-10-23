'use strict';

angular.module('mentionModule')
  .component('mentionInput', {
    template: require('./mention-input.component.html'),
    controller: MentionInputController
  });

function MentionInputController($element, $scope, $timeout, mention) {
  var ctrl = this;
  var editor;
  var displayElm;
  var markupElm;

  ctrl.markup = '';
  ctrl.$onInit = $onInit;
  ctrl.$onDestroy = $onDestroy;

  function $onInit() {
    // Init editor
    editor = mention.editor().parseMarkup('It\'s amazing, @[Mike](mailto:mike@example.com)!');
    // 😀

    // Find DOM elements
    var elm = $element.find('textarea');
    displayElm = elm[0];
    markupElm = elm[1];

    // Set initial values
    displayElm.value = editor.getDisplay();
    displayElm.focus();
    displayElm.addEventListener('input', handleInputChange);

    syncSelectionRange();
    updateDebugInfo();

    /**
     * NOTES
     * For touch-long-press-to-select, Firefox triggers 'select'. Chrome doesn't, and triggers 'selectionchange' instead
     * See:
     * - Event reference https://developer.mozilla.org/en-US/docs/Web/Events/selectionchange
     * - Cases for selection change https://github.com/2is10/selectionchange-polyfill
     */
    document.addEventListener('selectionchange', syncSelectionRange);

    // Needed for Firefox to keep selection range in sync
    displayElm.addEventListener('select', syncSelectionRange);

    // Reset on blur, to prevent range from being deleted on drop-from-outside (Firefox)
    displayElm.addEventListener('blur', function (e) {
      editor.setSelectionRange(0, 0);
      updateDebugInfo();
    });
  }

  function $onDestroy() {
    // TODO remove event listeners
  }

  function syncSelectionRange(e) {
    editor.setSelectionRange(displayElm.selectionStart, displayElm.selectionEnd);
    updateDebugInfo();
  }

  function handleInputChange(evt) {
    var text = displayElm.value;
    var start = evt.target.selectionStart;
    var end = evt.target.selectionEnd;

    editor.applyDisplayValue(text, start, end);

    displayElm.value = editor.getDisplay();
    displayElm.selectionStart = editor.getSelectionRange().start;
    displayElm.selectionEnd = editor.getSelectionRange().end;

    updateDebugInfo();
  }

  function updateDebugInfo() {
    $scope.$evalAsync(function () {
      ctrl.markup = editor.getMarkup();
      ctrl.selectionStart = '' + editor.getSelectionRange().start;
      ctrl.selectionEnd = '' + editor.getSelectionRange().end;
    });
  }

}
