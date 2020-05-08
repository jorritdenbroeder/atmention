import {
  Component,
  EventEmitter,
  TemplateRef
} from '@angular/core';

type Suggestion = any;

export interface NoSuggestionsTemplateLocals {
  $implicit: {
    query: string;
  }
};

export interface SuggestionTemplateLocals {
  $implicit: {
    index: number,
    active: boolean,
    label: string,
    value: string,
    query: string,
    data: any,
  }
};

@Component({
  templateUrl: './atmention-suggestions-overlay.component.html',
  styleUrls: ['./atmention-suggestions-overlay.component.css'],
})
export class AtmentionSuggestionsOverlayComponent {

  onSuggestionApplied = new EventEmitter<Suggestion>();

  noSuggestionsTemplate: TemplateRef<NoSuggestionsTemplateLocals>;

  suggestionTemplate: TemplateRef<NoSuggestionsTemplateLocals>;

  isVisible = false;

  query = '';

  suggestions: Suggestion[] = [];

  activeSuggestionIndex = -1;

  updateSuggestions(suggestions: Suggestion[]) {
    this.suggestions = suggestions;
  }

  updateActiveSuggestionIndex(index: number) {
    this.activeSuggestionIndex = index;
  }

  applySuggestion(suggestion: Suggestion) {
    this.onSuggestionApplied.next(suggestion);
  }

  createNoSuggestionsTemplateLocals(): NoSuggestionsTemplateLocals {
    return {
      $implicit: {
        query: this.query
      }
    };
  }

  createSuggestionTemplateLocals(index: number, suggestion: Suggestion): SuggestionTemplateLocals {
    return {
      $implicit: {
        query: this.query,
        index: index,
        active: index === this.activeSuggestionIndex,
        label: suggestion.searchResult.label,
        value: suggestion.searchResult.value,
        data: suggestion.searchResult.data
      }
    };
  }

}
