import * as atmention from 'atmention-core';

import {
  AfterContentInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ContentChild,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef, ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {
  NoSuggestionsTemplateLocals,
  SuggestionsOverlayComponent,
  SuggestionTemplateLocals
} from '../suggestions-overlay/suggestions-overlay.component';


@Component({
  selector: 'atmention-editor',
  templateUrl: './atmention-editor.component.html',
  styleUrls: ['./atmention-editor.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AtmentionEditorComponent,
      multi: true, // TODO
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class AtmentionEditorComponent implements OnInit, OnDestroy, AfterContentInit, ControlValueAccessor {

  @ContentChild('noSuggestions') noSuggestionsTemplate: TemplateRef<NoSuggestionsTemplateLocals>;
  @ContentChild('suggestion') suggestionTemplate: TemplateRef<SuggestionTemplateLocals>;

  @Input() placeholder: string;
  @Input() isDisabled: boolean;
  @Input() setFocus = false;
  @Input('search') searchHook: any;

  private atmentionController: any; // TODO: set proper type
  private suggestionsOverlay: ComponentRef<SuggestionsOverlayComponent>;
  private suggestionsOverlayElement: Element;
  private onChangeHandler?: (value: string) => any;

  constructor(
    private element: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector) { }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.initSuggestionsOverlay();

    this.atmentionController = atmention.controller({
      highlighterElement: this.element.nativeElement.firstChild.firstChild,
      inputElement: this.element.nativeElement.firstChild.lastChild,
      suggestionsElement: this.suggestionsOverlayElement,
      options: {
        focus: this.setFocus
      },
      hooks: {
        search: this.search.bind(this),
        toggleSuggestions: this.toggleSuggestions.bind(this),
        updateMarkup: this.updateMarkup.bind(this),
        updateSuggestions: this.updateSuggestions.bind(this),
        updateActiveSuggestionIndex: this.updateActiveSuggestionIndex.bind(this),
      }
    });
  }

  ngOnDestroy(): void {
    if (this.suggestionsOverlayElement) { 
      document.body.removeChild(this.suggestionsOverlayElement);
    }

    this.applicationRef.detachView(this.suggestionsOverlay.hostView);
    this.suggestionsOverlay.destroy();
    this.atmentionController.destroy();
  }

  /** @implements {ControlValueAccessor} */
  writeValue(obj: any): void {
    this.atmentionController.setMarkup(obj || '');
  }

  /** @implements {ControlValueAccessor} */
  registerOnChange(fn: any): void {
    this.onChangeHandler = fn;
  }

  /** @implements {ControlValueAccessor} */
  registerOnTouched(fn: any): void {
    // TODO
  }

  /** @implements {ControlValueAccessor} */
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  initSuggestionsOverlay() {
    if (this.suggestionsOverlayElement) { return; }

    const ref = this.componentFactoryResolver.resolveComponentFactory(SuggestionsOverlayComponent).create(this.injector);

    ref.instance.noSuggestionsTemplate = this.noSuggestionsTemplate;

    ref.instance.suggestionTemplate = this.suggestionTemplate;

    ref.instance.onSuggestionApplied.subscribe(suggestion => this.applySuggestion(suggestion));

    this.applicationRef.attachView(ref.hostView);

    this.suggestionsOverlay = ref;

    this.suggestionsOverlayElement = (ref.location.nativeElement as HTMLElement).children[0];

    document.body.appendChild(this.suggestionsOverlayElement);
  }

  search(query) {
    this.suggestionsOverlay.instance.query = query;
    return this.searchHook(query);
  }

  updateMarkup(markup) {
    this.onChangeHandler && this.onChangeHandler(markup);
  }

  toggleSuggestions(bool) {
    this.suggestionsOverlay.instance.isVisible = bool;
  }

  updateSuggestions(suggestions) {
    this.suggestionsOverlay.instance.updateSuggestions(suggestions);
  }

  updateActiveSuggestionIndex(index) {
    this.suggestionsOverlay.instance.updateActiveSuggestionIndex(index);
  }

  applySuggestion(suggestion) {
    this.atmentionController.applySuggestion(suggestion);
  }

}
