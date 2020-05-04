import util from './util';

var format = {
  /**
   * Converts a message to HTML
   */
  html: function (message, options) {
    var opts = util.extend({}, options);
    var selectionRange = opts.selectionRange ? message.mapRangeToMarkup(opts.selectionRange) : null;
    var html = '';

    format.splitMarkup(message.getMarkup(), message.getMentions(), selectionRange).forEach(function (segment) {
      var classNames = [];

      // Add classes
      if (segment.mention) { classNames.push(opts.mentionClass); }
      if (segment.isSelection) { classNames.push(opts.selectionClass); }
      if (segment.isSelectionStart) { classNames.push(opts.selectionStartClass); }
      if (segment.isSelectionEnd) { classNames.push(opts.selectionEndClass); }

      // Create span
      const classAttribute = classNames.length
        ? ` class="${classNames.join(' ')}"`
        : '';

      html += `<span${classAttribute}>${segment.text}</span>`;
    });

    return html;
  },

  /**
   * Splits markup at mention bounds. When a selection range is passed, additional splits are made
   *
   * @param selectionRange Range in markup (!)
   */
  splitMarkup: function (markup, mentions, selectionRange?) {
    var segments = [];
    var isSelectionCollapsed = selectionRange ? selectionRange.start === selectionRange.end : false;
    var panic = 0;

    // Loop vars
    var segment;
    var pos = 0; // position in markup
    var nextPos = markup.length; // position in markup
    var displayPos = 0; // position in display
    var nextMentionIndex = 0;
    var nextMention = mentions[nextMentionIndex];
    var caretHandled = false;

    for (; ;) {
      segment = {};

      // ##################################
      // TODO: safety net for untested code
      // ##################################
      if (panic++ > 999) {
        break;
      }

      // (don't break if caret needs to be rendered at the end)
      if (pos >= markup.length && !(isSelectionCollapsed && !caretHandled && pos === markup.length)) {
        break;
      }

      // Split on mention bounds, whichever comes first
      if (nextMention) {
        nextPos = nextMention.start > pos && nextMention.start < nextPos ? nextMention.start : nextPos;
        nextPos = nextMention.end > pos && nextMention.end < nextPos ? nextMention.end : nextPos;
      }

      // Split on selection bounds, whichever comes first
      if (selectionRange) {
        nextPos = selectionRange.start > pos && selectionRange.start < nextPos ? selectionRange.start : nextPos;
        nextPos = selectionRange.end > pos && selectionRange.end < nextPos ? selectionRange.end : nextPos;
      }

      // Check mention intersects
      if (nextMention && intersects(nextMention.start, nextMention.end, pos, nextPos)) {
        segment.mention = nextMention;
        segment.text = nextMention.label;
      } else {
        segment.mention = null;
        segment.text = markup.slice(pos, nextPos);
      }

      // Check selection intersects
      if (selectionRange) {
        if (isSelectionCollapsed && !caretHandled && pos === selectionRange.start) {
          // Special case: insert extra segment for caret
          segment.mention = null;
          segment.text = '';
          segment.isSelection = true;
          segment.isSelectionStart = true;
          segment.isSelectionEnd = true;

          caretHandled = true;
          nextPos = pos; // next iteration will have same position
        }
        else if (intersects(selectionRange.start, selectionRange.end, pos, nextPos)) {
          segment.isSelection = true;
          segment.isSelectionStart = selectionRange.start === pos;
          segment.isSelectionEnd = selectionRange.end === nextPos;
        }
      }

      // Set positions
      segment.markupStart = pos;
      segment.markupEnd = nextPos;
      segment.displayStart = displayPos;
      segment.displayEnd = displayPos + segment.text.length;


      segments.push(segment);


      // Move next mention
      if (nextMention && nextPos === nextMention.end) {
        nextMentionIndex += 1;
        nextMention = mentions[nextMentionIndex];
      }

      // Move next segment
      pos = nextPos;
      nextPos = markup.length;
      displayPos = segment.displayEnd;
    }

    return segments;
  }

};

// Returns true if two ranges intersect
function intersects(startA, endA, startB, endB) {
  return !((endB <= startA) || (startB >= endA));
}

export default format;
