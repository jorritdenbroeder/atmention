'use strict';

var constants = require('./constants');
var util = require('./util');
var format = require('./format');
var log = require('./log');

function parse(rawMarkup) {
  var instance = {};
  var markup = '';
  var display = '';
  var mentions = [];
  var segments = [];
  var selectionStart = 0;
  var selectionEnd = 0;

  parseMarkup(rawMarkup);

  instance.parseMarkup = parseMarkup;
  instance.handleInputEvent = handleInputEvent;
  instance.detectSearchQuery = detectSearchQuery;
  instance.mapRangeToMarkup = mapRangeToMarkup;
  instance.mapRangeToDisplay = mapRangeToDisplay;
  instance.insertMention = insertMention;
  instance.getMentions = getMentions;
  instance.getMarkup = getMarkup;
  instance.getDisplay = getDisplay;
  instance.getSelectionRange = getSelectionRange;
  instance.setSelectionRange = setSelectionRange;
  instance.toHTML = toHTML;
  instance.splitAtMentions = splitAtMentions;

  function parseMarkup(value) {
    markup = '';
    display = '';
    mentions = [];
    segments = [];

    if (!value) {
      return instance;
    }

    markup = value;
    mentions = extractMentions();
    segments = format.splitMarkup(markup, mentions);
    display = segments.map(function (segment) {
      return segment.text;
    }).join('');

    return instance;
  }

  function extractMentions() {
    var result = [];
    var mentionRegex = new RegExp(constants.MENTION_REGEX, 'g');
    var match;
    var matchedMarkup;
    var matchedLabel;
    var matchedValue;

    while ((match = mentionRegex.exec(markup))) {
      matchedMarkup = match[0];
      matchedLabel = match[1];
      matchedValue = match[2];

      result.push({
        start: match.index,
        end: match.index + matchedMarkup.length,
        markup: matchedMarkup,
        label: matchedLabel,
        value: matchedValue,
      });
    }

    return result;
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
    var oldMarkup = getMarkup();
    var oldDisplay = getDisplay();

    var delta = value.length - oldDisplay.length;
    var deletedText, deleteStart, deleteEnd;
    var insertedText, insertStart, insertEnd;
    var rangeInDisplay, rangeInMarkup;
    var rangeInDisplayAfterMentionsDeleted;
    var newMarkupValue;
    var newCaretPosition;

    log.debug('[*] Applying', 'prevSelection:', selectionStart, selectionEnd, 'currSelection:', start, end, 'delta', delta, 'from: "' + oldDisplay + '"', 'to: "' + value + '"');

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

    deletedText = (deleteStart < deleteEnd) ? oldDisplay.slice(deleteStart, deleteEnd) : '';
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
    newMarkupValue = util.spliceString(oldMarkup, rangeInMarkup.start, rangeInMarkup.end, insertedText);

    // Update display value, in case mentions were deleted
    parseMarkup(newMarkupValue);

    // Update caret position in case mentions were deleted (places caret at end of inserted part)
    if (oldDisplay.length !== value.length) {
      rangeInDisplayAfterMentionsDeleted = mapRangeToDisplay({ start: rangeInMarkup.start, end: rangeInMarkup.end });
      newCaretPosition = rangeInDisplayAfterMentionsDeleted.start + insertedText.length;
      selectionStart = newCaretPosition;
      selectionEnd = newCaretPosition;
    } else {
      selectionStart = start;
      selectionEnd = end;
    }

    log.debug('Done applying, internal selection is now', selectionStart, selectionEnd);

    return instance;
  }

  /**
   * Determines if the suggestions should be triggered. Searches for a sequence, returns only if the caret is right
   * behind it.
   *
   * @param {string} value Current textarea value
   * @returns {QueryInfo} Info for inserting a mention later
   */
  function detectSearchQuery(value) {
    var mentionRegex = new RegExp(constants.SEARCH_QUERY_REGEX, 'g');
    var caretPosition = selectionEnd;
    var match;
    var matchedText;
    var query;
    var queryInfo;

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

  function mapRangeToMarkup(source) {
    var start, end, offsetInSegment;

    if (!segments.length) {
      start = 0;
      end = 0;
    } else {
      segments.forEach(function (segment) {
        if (source.start >= segment.displayStart && source.start < segment.displayEnd) {
          offsetInSegment = segment.mention ? 0 : (source.start - segment.displayStart);
          start = segment.markupStart + offsetInSegment;
        }
        if (source.end > segment.displayStart && source.end <= segment.displayEnd) {
          offsetInSegment = segment.mention ? 0 : source.end - segment.displayEnd;
          end = segment.markupEnd + offsetInSegment;
        }
      });
    }

    // No segments matched
    if (start === undefined) { start = segments[segments.length - 1].markupEnd; }
    if (end === undefined) { end = start; }

    return { start: start, end: end };
  }

  function mapRangeToDisplay(source) {
    var start, end, offsetInSegment;

    if (!segments.length) {
      start = 0;
      end = 0;
    } else {
      segments.forEach(function (segment) {
        if (source.start >= segment.markupStart && source.start < segment.markupEnd) {
          offsetInSegment = segment.mention ? 0 : source.start - segment.markupStart;
          start = segment.displayStart + offsetInSegment;
        }
        if (source.end > segment.markupStart && source.end <= segment.markupEnd) {
          offsetInSegment = segment.mention ? 0 : source.end - segment.markupEnd;
          end = segment.displayEnd + offsetInSegment;
        }
      });
    }

    // No segments matched
    if (start === undefined) { start = segments[segments.length - 1].displayEnd; }
    if (end === undefined) { end = start; }

    return { start: start, end: end };
  }

  /**
   * Inserts new mention between display start/end + updates selection range
   */
  function insertMention(label, value, start, end) {
    var markupRange = mapRangeToMarkup({ start: start, end: end });
    var newMarkup;
    var displayRange;

    var mention = {
      markup: constants.MENTION_FORMATTING_TEMPLATE
        .replace('LABEL', label)
        .replace('VALUE', value),
      label: label,
      value: value,
      start: markupRange.start,
      end: markupRange.end
    };

    // Insert markup
    newMarkup = util.spliceString(markup, mention.start, mention.end, mention.markup);

    // Process changed markup
    parseMarkup(newMarkup);

    // Reverse-map inserted range to display
    displayRange = mapRangeToDisplay({ start: mention.start, end: mention.end });

    // Update selection range
    selectionStart = displayRange.end;
    selectionEnd = displayRange.end;

    return mention;
  }

  function getMentions() {
    return mentions;
  }

  function getDisplay() {
    return display;
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
    return instance;
  }

  function getMarkup() {
    return markup;
  }

  function toHTML(options) {
    return format.html(instance, options);
  }

  function splitAtMentions() {
    return format.splitMarkup(markup, mentions);
  }

  return instance;
}

module.exports = parse;
