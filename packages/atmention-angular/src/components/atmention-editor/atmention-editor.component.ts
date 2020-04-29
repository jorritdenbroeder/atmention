import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import * as atmention from 'atmention-core';

@Component({
  selector: 'atmention-editor[model]',
  templateUrl: './atmention-editor.component.html',
  styleUrls: ['./atmention-editor.component.css']
})
export class AtmentionEditorComponent implements OnInit, OnDestroy {
  @Input() model: string;
  @Input() placeholder: string;
  @Input() setFocus = false;

  @Output() onSearch = new EventEmitter<any>(); // TODO add correct types


  public query: string;
  public suggestionsVisible = false;
  public suggestions: any[]; // TODO: check type
  public activeSuggestionIndex = -1;


  public atmentionController: any; // TODO: set proper type
  // public suggestionsElement

  constructor(private element: ElementRef) { }

  ngOnInit(): void {
    // this.suggestionsElement = compileSuggestionsOverlay();

    this.atmentionController = atmention.controller({
      highlighterElement: this.element.nativeElement.children[0],
      inputElement: this.element.nativeElement.children[1],
      // suggestionsElement: this.suggestionsElement[0], // TODO
      options: {
        focus: this.setFocus
      },
      hooks: {
        search: null, //TODO: add eventListener in consumer
        toggleSuggestions: this.toggleSuggestions,
        updateMarkup: this.updateMarkup,
        updateSuggestions: this.updateSuggestions,
        updateActiveSuggestionIndex: this.updateActiveSuggestionIndex,
        updateDebugInfo: this.updateDebugInfo
      }
    });

  }

  ngOnDestroy(): void {
    // this.suggestionsElement.remove();
    this.atmentionController.destroy();
  }

  search(query) {
    this.query = query;
    //return ctrl.searchHook(query);
  }

  toggleSuggestions(bool) {
    this.suggestionsVisible = bool;
  }

  updateMarkup(markup) {
    // if (this.ngModel) {
    //   this.ngModel.$setViewValue(markup);
    // }
  }

  updateSuggestions(suggestions) {
    this.suggestions = suggestions;
  }

  updateActiveSuggestionIndex(index) {
    this.activeSuggestionIndex = index;
  }

  updateDebugInfo(text) {
    //ctrl.debugInfo = text;
  }

  applySuggestion(suggestion) {
    //atmentionController.applySuggestion(suggestion);
  }

  initLocalsForNoSuggestionsTemplate(ngIfScope) {
    // ngIfScope.$item = {
    //   query: ctrl.query
    // };
  }

  initLocalsForSuggestionsTemplate(ngRepeatScope) {
    // TODO:
  }

}
