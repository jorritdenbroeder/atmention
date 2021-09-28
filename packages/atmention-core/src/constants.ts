export default {

  // formats a mention instance as plain text by replacing LABEL and VALUE
  MENTION_FORMATTING_TEMPLATE: '[LABEL](VALUE)',

  // detects mentions in a given text
  // 1st capture group is the label, surrounded by []
  // 2nd capture group is the value, surrounded by ()
  // new line are not supported inside a mention
  MENTION_REGEX: '' +
    '\\[' +
    '([^)\n]+)' +
    '\\]' +
    '\\(' +
    '([^\\]\)\n]+)' +
    '\\)',

  // determines when to show the suggestions overlay
  // capture group is the search query.
  SEARCH_QUERY_REGEX: '@([^\\s]+)', // matches "@" followed by any number of non-whitespace characters

  HIGHLIGHT_MENTION_CLASS: 'mention',
  HIGHLIGHT_SELECTION_CLASS: 'selection',
  HIGHLIGHT_SELECTION_START_CLASS: 'start',
  HIGHLIGHT_SELECTION_END_CLASS: 'end',
};
