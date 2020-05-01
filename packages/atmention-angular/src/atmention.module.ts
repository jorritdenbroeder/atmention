import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AtmentionViewerComponent } from './components/atmention-viewer/atmention-viewer.component';
import { AtmentionEditorComponent } from './components/atmention-editor/atmention-editor.component';
import { AtementionSuggestionsOverlayComponent } from './components/atemention-suggestions-overlay/atemention-suggestions-overlay.component';
import { AtmentionParse } from './pipes/atmention.pipe';

@NgModule({
  declarations: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtementionSuggestionsOverlayComponent,
    AtmentionParse,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtementionSuggestionsOverlayComponent,
    AtmentionParse,
  ]
})
export class AtmentionModule { }
