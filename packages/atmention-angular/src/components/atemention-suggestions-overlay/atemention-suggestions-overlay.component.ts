import {Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';

@Component({
  selector: 'atemention-suggestions-overlay',
  templateUrl: './atemention-suggestions-overlay.component.html',
  styleUrls: ['./atemention-suggestions-overlay.component.css']
})
export class AtementionSuggestionsOverlayComponent implements OnInit {
  @ContentChild(TemplateRef) noResultsTemplate: TemplateRef<string>;
  @ContentChild(TemplateRef) suggestionResultTemplate: TemplateRef<any>; //TODO: set type

  @Input() suggestions: any[]; //TODO add type
  @Output() onSelected = new EventEmitter<any>(); // TODO: add type

  public suggestionsVisible = false;
  public query: string;
  public activeSuggestionIndex = -1;

  constructor() { }

  ngOnInit(): void {
  }

  onClick(suggestion) {
    this.onSelected.emit(suggestion);
  }

}
