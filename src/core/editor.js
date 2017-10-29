'use strict';

var util = require('./util');
var log = require('./log');

editorFactory.defaultOptions = {
  pattern: '[__DISPLAY__](__ID__)'
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
  editor.handleSelectionChangeEvent = handleSelectionChangeEvent;
  editor.handleInputEvent = handleInputEvent;
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

  function handleSelectionChangeEvent(start, end) {
    selectionStart = start;
    selectionEnd = end;
    return editor;
  }

  /**
   * Applies changes in the display value to the markup. When any mentions were deleted, the display value and selection
   * range will also be updated, so afterwards, those need to be re-applied to the textarea.
   *
   * @param {string} value displayValue after the event
   * @param {int} start start of selection after the event
   * @param {int} end end of selection after the event
   */
  function handleInputEvent(value, start, end) {
    var delta = value.length - displayValue.length;
    var deletedText, deleteStart, deleteEnd;
    var insertedText, insertStart, insertEnd;
    var rangeInDisplay, rangeInMarkup;
    var rangeInDisplayAfterMentionsDeleted;
    var newMarkupValue;
    var newCaretPosition;

    log.debug('[*] Applying', 'prevSelection:', selectionStart, selectionEnd, 'currSelection:', start, end, 'delta', delta, 'from: "' + displayValue + '"', 'to: "' + value + '"');

    /**
     * Determine what was deleted and/or inserted
     */
    if (selectionStart < selectionEnd) {
      if (start < end) {
        log.debug('RANGE --> RANGE');
        // RANGE --> RANGE
        // Happens when: ?
        insertStart = start;
        insertEnd = end;
        deleteStart = -1;
        deleteEnd = -1;
      }
      else {
        log.debug('RANGE --> CARET');
        // RANGE --> CARET
        // Happens when: delete/cut selection, overwrite selection by typing

        // Deleted part is the previous selection
        deleteStart = selectionStart;
        deleteEnd = selectionEnd;

        // Reverse-engineer inserted part
        insertStart = selectionStart;
        insertEnd = selectionEnd + delta;
      }
    } else {
      if (start < end) {
        log.debug('CARET --> RANGE');
        // CARET --> RANGE
        // Happens when: IME composition/word replacement

        // Inserted part is the current selection
        insertStart = start;
        insertEnd = end;

        // Reverse-engineer deleted part based on current selection
        deleteStart = start;
        deleteEnd = end - delta;
      }
      else {
        log.debug('CARET --> CARET');
        // CARET --> CARET
        // Happens when: type character, paste at caret, delete, backspace
        if (delta < 0) {
          // Delete. Use min/max to handle forward/backward deletion (DEL vs. BACKSPACE)
          insertStart = -1;
          insertEnd = -1;
          deleteStart = Math.min(selectionStart, end);
          deleteEnd = Math.max(selectionEnd, deleteStart - delta);
        } else {
          // Insert
          insertEnd = end;
          insertStart = insertEnd - delta;
          deleteStart = -1;
          deleteEnd = -1;
        }
      }
    }

    deletedText = (deleteStart < deleteEnd) ? displayValue.slice(deleteStart, deleteEnd) : '';
    insertedText = (insertStart < insertEnd) ? value.slice(insertStart, insertEnd) : '';

    log.debug('Deleted "' + deletedText + '"', deleteStart < deleteEnd ? deleteStart + ',' + deleteEnd : '');
    log.debug('Inserted "' + insertedText + '"', insertStart < insertEnd ? insertStart + ',' + insertEnd : '');

    // Update markup
    if (deletedText) {
      rangeInDisplay = { start: deleteStart, end: deleteEnd };
    } else {
      rangeInDisplay = { start: insertStart, end: insertStart };
    }

    rangeInMarkup = mapRangeToMarkup(rangeInDisplay);
    newMarkupValue = util.spliceString(markupValue, rangeInMarkup.start, rangeInMarkup.end, insertedText);

    // Update display value, in case mentions were deleted
    parseMarkup(newMarkupValue);

    // Update caret position in case mentions were deleted (places caret at end of inserted part)
    if (displayValue.length !== value.length) {
      rangeInDisplayAfterMentionsDeleted = mapRangeToDisplay({ start: rangeInMarkup.start, end: rangeInMarkup.end });
      newCaretPosition = rangeInDisplayAfterMentionsDeleted.start + insertedText.length;
      selectionStart = newCaretPosition;
      selectionEnd = newCaretPosition;
    } else {
      selectionStart = start;
      selectionEnd = end;
    }

    log.debug('Done applying, internal selection is now', selectionStart, selectionEnd);

    return editor;
  }

  /**
   * Determines if the suggestions should be triggered. Searches for a sequence, returns only if the caret is right
   * behind it.
   *
   * @param {string} value Current textarea value
   * @returns {QueryInfo} Info for inserting a mention later
   */
  function detectSearchQuery(value) {
    // TODO improve regex + make configurable
    var mentionRegex = new RegExp('@([A-Za-z0-9_]+)', 'g'); // e.g. matches @user_name
    var caretPosition;
    var match;
    var matchedText;
    var query;
    var queryInfo;

    caretPosition = selectionEnd;

    while (!queryInfo && (match = mentionRegex.exec(value))) {
      matchedText = match[0]; // including @ prefix
      query = match[1]; // capture group

      // Report back when caret is inside or right after the matched text
      if (caretPosition > match.index && caretPosition <= match.index + matchedText.length) {
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
   * Adds a mention between the given positions
   */
  function insertMarkup(display, id, start, end) {
    var markup = util.createMarkup(config.pattern, display, id);
    var markupRange;
    var insertedRange;
    var newMarkupValue;

    // Insert markup
    markupRange = mapRangeToMarkup({ start: start, end: end });
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
