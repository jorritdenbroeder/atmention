export interface AtmentionModel {
  parseMarkup();
  handleInputEvent();
  detectSearchQuery();
  mapRangeToMarkup();
  mapRangeToDisplay();
  insertMention();
  getMentions();
  getMarkup();
  getDisplay();
  getSelectionRange();
  setSelectionRange();
  toHTML();
  splitAtMentions();
}
