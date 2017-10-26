'use strict';

var util = require('./util');

editorFactory.defaultOptions = {
  pattern: '@[__DISPLAY__](__ID__)'
};

function editorFactory(options) {
  var editor = {};
  var config = {};
  var markupRegex;

  var displayValue = '';
  var markupValue = '';
  var segments = [];
  var selectionStart = null;
  var selectionEnd = null;

  editor.parseMarkup = parseMarkup;
  editor.getSegments = getSegments;
  editor.getDisplay = getDisplay;
  editor.getMarkup = getMarkup;
  editor.getSelectionRange = getSelectionRange;
  editor.setSelectionRange = setSelectionRange;
  editor.applyDisplayValue = applyDisplayValue;
  editor.detectSearchQuery = detectSearchQuery;
  editor.insertMarkup = insertMarkup;

  init();

  function init() {
    // Configure with options
    config.pattern = options && options.pattern || editorFactory.defaultOptions.pattern;

    markupRegex = util.regexFromTemplate(config.pattern);
  }

  /**
   * Splits a marked up text into segments, at mention bounds
   */
  function parseMarkup(value) {
    var markup = value || '';
    var match;
    var matchedMarkup;
    var matchedDisplay;
    var matchedId;

    var currMarkupPos = 0;
    var currDisplayPos = 0;
    var lengthBefore;
    var lengthAfter;

    segments = [];

    while ((match = markupRegex.exec(markup))) {
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
   * Applies changes in the (user-entered) display value to the (internal) markup + updates displayValue if any mentions
   * were deleted.
   *
   * @param {string} value displayValue after the change
   * @param {int} start start of selection after the change
   * @param {int} end end of selection after the change
   */
  function applyDisplayValue(value, start, end) {
    var delta = value.length - displayValue.length;
    var xStart, xEnd, xValue; // indexes and value of the deleted part
    var iStart, iEnd, iValue; // indexes and value of the inserted part
    var oldDisplayValue = displayValue;
    var newMarkupValue;
    var nextSelectionStart = start;
    var nextSelectionEnd = end;

    // console.log('[*] APPLY', 'prevSelection:', selectionStart, selectionEnd, 'currSelection:', start, end, 'delta', delta, 'from: "' + displayValue + '"', 'to: "' + value + '"');

    if (start < end) {
      // console.log('CURR=RANGE');

      iStart = start;
      iEnd = end;

      if (selectionStart < selectionEnd) {
        // console.log('PREV=RANGE');
        xStart = -1;
        xEnd = -1;
      } else {
        // console.log('PREV=CARET');
        xEnd = selectionEnd;
        xStart = xEnd - (iEnd - iStart - delta);
      }
    }
    else {
      // console.log('CURR=CARET');

      if (selectionStart < selectionEnd) {
        // console.log('PREV=RANGE');

        // Deleted part
        xStart = selectionStart;
        xEnd = selectionEnd;

        // Inserted part
        iEnd = end;
        iStart = iEnd - ((xEnd - xStart) + delta); // length of deleted part
      }
      else {
        // console.log('PREV=CARET');

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

    // console.log('Deleted "' + xValue + '"', xStart < xEnd ? xStart + ',' + xEnd : '');
    // console.log('Inserted "' + iValue + '"', iStart < iEnd ? iStart + ',' + iEnd : '');

    // Update markup
    // When nothing was deleted, start from the insert position
    var displayRange = {
      start: xValue ? xStart : iStart,
      end: xValue ? xEnd : iStart
    };
    var mappedRange = mapRangeToMarkup(displayRange);
    newMarkupValue = util.spliceString(markupValue, mappedRange.start, mappedRange.end, iValue);

    // Update display value, in case mentions were deleted
    parseMarkup(newMarkupValue);

    // Update selection range when a mention was deleted
    if (displayValue.length !== value.length) {
      var newDisplayRange = mapRangeToDisplay({ start: mappedRange.start, end: mappedRange.start });
      nextSelectionStart = newDisplayRange.start + (iValue ? iValue.length : 0);
      nextSelectionEnd = newDisplayRange.start + (iValue ? iValue.length : 0);
    }

    // Update selection range
    selectionStart = nextSelectionStart;
    selectionEnd = nextSelectionEnd;
  }

  /**
   * Determines if the suggestions should be triggered.
   * Searches for a sequence, returns only if the caret is right behind it.
   *
   * @param {string} value Text to search
   * @param {int} newSelectionStart
   * @param {int} newSelectionStart
   *
   * @returns {QueryInfo} Info for inserting a mention later
   */
  function detectSearchQuery(value, newSelectionStart, newSelectionEnd) {
    var mentionRegex = new RegExp('@([A-Za-z0-9_]+)', 'g'); // e.g. matches @user_name
    var match;
    var matchedText;
    var query;
    var queryInfo;

    while (!queryInfo && (match = mentionRegex.exec(value))) {
      matchedText = match[0]; // including @ prefix
      query = match[1]; // capture group
      if (newSelectionStart > match.index && newSelectionStart <= match.index + matchedText.length) {
        queryInfo = {
          matchedText: matchedText,
          query: query,
          start: match.index,
          end: match.index + matchedText.length
        };
      }
    }

    return queryInfo;
  }

  /**
   * Adds a mention at the current cursor position
   *
   * @param data.id
   * @param data.display
   */
  function insertMarkup(display, id, start, end) {
    var markup = util.createMarkup(config.pattern, display, id);
    var markupRange = mapRangeToMarkup({ start: start, end: end });
    var insertedRange;
    var newMarkupValue;

    // Insert into markup
    newMarkupValue = util.spliceString(markupValue, markupRange.start, markupRange.end, markup);

    // Update display value
    parseMarkup(newMarkupValue);

    // Map back to diplay text to get the inserted part
    insertedRange = mapRangeToDisplay(markupRange);

    // Update selection range
    selectionStart = insertedRange.end;
    selectionEnd = insertedRange.end;
  }

  function mapRangeToMarkup(displayRange) {
    return mapRange(displayRange, 'display', 'markup');
  }

  function mapRangeToDisplay(markupRange) {
    return mapRange(markupRange, 'markup', 'display');
  }

  /**
   * Maps a selection range from display value (`display`) to markup (`markup`) or vice versa. Snaps to segment bounds
   * if it overlaps a mention.
   */
  function mapRange(range, mapFrom, mapTo) {
    var rangeLength = range.start - range.end;
    var start;
    var end;
    var delta;

    segments.forEach(function (segment) {
      if (range.start >= segment[mapFrom].start && range.start < segment[mapFrom].end) {
        delta = segment.data ? 0 : range.start - segment[mapFrom].start;
        start = segment[mapTo].start + delta;
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
      end: end
    };
  }

  return editor;
}

module.exports = editorFactory;
