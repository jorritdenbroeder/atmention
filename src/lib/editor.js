'use strict';

var util = require('./util');

editorFactory.defaultOptions = {
  pattern: '@[__DISPLAY__](__ID__)'
};

function editorFactory(options) {
  var editor = {};
  var config = {};

  var displayValue = '';
  var markupValue = '';
  var segments = [];
  var selectionStart = null;
  var selectionEnd = null;

  editor.debug = debug;
  editor.parseMarkup = parseMarkup;
  editor.getSegments = getSegments;
  editor.getDisplay = getDisplay;
  editor.getMarkup = getMarkup;
  editor.getSelectionRange = getSelectionRange;
  editor.setSelectionRange = setSelectionRange;
  editor.applyDisplayValue = applyDisplayValue;

  init();

  function init() {
    config.regex = util.regexFromTemplate(options && options.pattern || editorFactory.defaultOptions.pattern);
  }

  function debug() {
    segments.forEach(function (s, i) {
      console.log('#' + i, s.markup.start, s.markup.end, s.markup.text, s.data);
    });
    segments.forEach(function (s, i) {
      console.log('#' + i, s.display.start, s.display.end, s.display.text, s.data);
    });
    return editor;
  }

  function parseMarkup(markup) {
    var match;
    var matchedMarkup;
    var matchedDisplay;
    var matchedId;

    var currMarkupPos = 0;
    var currDisplayPos = 0;
    var lengthBefore;
    var lengthAfter;

    segments = [];

    while ((match = config.regex.exec(markup))) {
      matchedMarkup = match[0];
      matchedDisplay = match[1];
      matchedId = match[2];

      lengthBefore = match.index - currMarkupPos;

      // Add segment before
      if (lengthBefore > 0) {
        segments.push({
          data: null,
          markup: {
            text: markup.slice(currMarkupPos, currMarkupPos + lengthBefore),
            start: currMarkupPos,
            end: currMarkupPos + lengthBefore
          },
          display: {
            text: markup.slice(currMarkupPos, currMarkupPos + lengthBefore),
            start: currDisplayPos,
            end: currDisplayPos + lengthBefore
          }
        });

        currMarkupPos += lengthBefore;
        currDisplayPos += lengthBefore;
      }

      // Add segment for match
      segments.push({
        data: {
          display: matchedDisplay,
          id: matchedId
        },
        markup: {
          text: matchedMarkup,
          start: match.index,
          end: match.index + matchedMarkup.length,
        },
        display: {
          text: matchedDisplay,
          start: currDisplayPos,
          end: currDisplayPos + matchedDisplay.length
        }
      });

      currMarkupPos += matchedMarkup.length;
      currDisplayPos += matchedDisplay.length;
    }

    // Add last segment
    lengthAfter = markup.length - currMarkupPos;

    if (lengthAfter > 0) {
      segments.push({
        data: null,
        markup: {
          text: markup.slice(currMarkupPos, currMarkupPos + lengthAfter),
          start: currMarkupPos,
          end: currMarkupPos + lengthAfter,
        },
        display: {
          text: markup.slice(currMarkupPos, currMarkupPos + lengthAfter),
          start: currDisplayPos,
          end: currDisplayPos + lengthAfter
        }
      });
    }

    displayValue = segments.map(function (s) { return s.display.text; }).join('');
    markupValue = segments.map(function (s) { return s.markup.text; }).join('');

    return editor;
  }

  function getSegments() {
    return segments;
  }

  function getDisplay() {
    return displayValue;
  }

  function getMarkup() {
    return markupValue;
  }

  function getSelectionRange() {
    return {
      start: selectionStart,
      end: selectionEnd
    };
  }

  function setSelectionRange(start, end) {
    selectionStart = start;
    selectionEnd = end;
  }

  /**
   * NOTES
   * - Chrome: drag is a 2-step operation (delete first, then insert). After release, the insert is still selected.
   * - Firefox: drag is a single operation. After drop, selection is cleared, so may be hard to determine deleted part.
   */
  function applyDisplayValue(value, start, end) {
    var delta = value.length - displayValue.length;
    var xStart, xEnd, xValue; // x = deleted
    var iStart, iEnd, iValue; // i = inserted

    console.log('[*] APPLY', 'prevSelection:', selectionStart, selectionEnd, 'currSelection:', start, end, 'delta', delta, 'from: "' + displayValue + '"', 'to: "' + value + '"');

    if (start < end) {
      console.log('CURR=RANGE');

      iStart = start;
      iEnd = end;

      if (selectionStart < selectionEnd) {
        console.log('PREV=RANGE');
        xStart = -1;
        xEnd = -1;
      } else {
        console.log('PREV=CARET');
        xEnd = selectionEnd;
        xStart = xEnd - (iEnd - iStart - delta);
      }
    }
    else {
      console.log('CURR=CARET');

      if (selectionStart < selectionEnd) {
        console.log('PREV=RANGE');

        // Deleted part
        // FIXME: deleted part may be wrong in Firefox when you select a range, then drag something in from outside.
        // Currently fixed by clearing selection on blur
        xStart = selectionStart;
        xEnd = selectionEnd;

        // Inserted part
        iEnd = end;
        iStart = iEnd - ((xEnd - xStart) + delta); // length of deleted part
      }
      else {
        console.log('PREV=CARET');

        if (delta < 0) {
          // Deleted part. Use min/max to handle forward/backward deletion (DEL vs. BACKSPACE)
          xStart = Math.min(selectionStart, end);
          xEnd = Math.max(selectionEnd, xStart - delta);
        } else {
          // Inserted part
          iEnd = end;
          iStart = iEnd - delta;
        }
      }
    }

    if (xStart < xEnd) {
      xValue = displayValue.slice(xStart, xEnd);
    }

    if (iStart < iEnd) {
      iValue = value.slice(iStart, iEnd);
    }

    console.log('Deleted "' + xValue + '"', xStart < xEnd ? xStart + ',' + xEnd : '');
    console.log('Inserted "' + iValue + '"', iStart < iEnd ? iStart + ',' + iEnd : '');

    // Apply changes to markup
    var displayRange = {
      start: xValue ? xStart : iStart,
      end: xValue ? xEnd : iStart
    };
    var deletedRange = mapRange(displayRange, 'display', 'markup');
    markupValue = util.spliceString(markupValue, deletedRange.start, deletedRange.end, iValue);

    // Update display value
    parseMarkup(markupValue);

    // Update selection range
    selectionStart = start;
    selectionEnd = end;
  }

  function mapRange(range, mapFrom, mapTo) {
    var rangeLength = range.start - range.end;
    var start;
    var end;
    var delta;

    var startsInMention;

    segments.forEach(function (segment) {
      if (range.start >= segment[mapFrom].start && range.start < segment[mapFrom].end) {
        delta = segment.data ? 0 : range.start - segment[mapFrom].start;
        start = segment[mapTo].start + delta;

        if (segment.data && range.start > segment[mapFrom].start) {
          startsInMention = segment;
        }
      }
      if (range.end > segment[mapFrom].start && range.end <= segment[mapFrom].end) {
        delta = segment.data ? 0 : range.end - segment[mapFrom].end;
        end = segment[mapTo].end + delta;
      }
    });

    // No segments matched
    if (start === undefined) {
      start = !segments.length ? 0 : segments[segments.length - 1][mapTo].end;
      end = start + (range.end - range.start);
    }

    return {
      start: start,
      end: end,
      startsInMention: startsInMention
    };

  }

  return editor;
}

module.exports = editorFactory;
