'use strict';

/**
 * Transforms markup into HTML
 *
 * @param markupSegments
 * @param caretPosition
 * @param markupClass
 * @param caretClass
 */
module.exports = function markupToHtml(segments, caretPosition, markupClass, caretClass) {
  var html = '';
  var wrapper = document.createElement('div');
  var caretFound = false;

  segments.forEach(function (segment) {
    var span = document.createElement('span');
    var classList = [];
    var caretOffset = 0;

    // Add markup class
    if (segment.data) {
      classList.push(markupClass);
    }

    // When caret is inside segment
    if (caretPosition >= segment.display.start && caretPosition < segment.display.end) {
      caretOffset = caretPosition - segment.display.start;
      caretFound = true;

      // Add caret class + insert
      span.innerText = segment.display.text.substring(0, caretOffset);
      span.setAttribute('class', classList.concat(caretClass).join(' '));
      wrapper.appendChild(span);

      span = document.createElement('span');
    }

    // Set props + insert
    span.innerText = segment.display.text.substring(caretOffset);
    if (classList.length) {
      span.setAttribute('class', classList.join(' '));
    }

    wrapper.appendChild(span);
  });

  html = wrapper.innerHTML;

  if (!caretFound) {
    html += '<span class="' + caretClass + '"></span>';
  }

  // Add final line break, so it wraps in the same way as a textarea.
  html += '<br/>';

  // Feature: add extra line to make textea look larger (TODO, make configurable)
  html += '<br/>';

  return html;
};
