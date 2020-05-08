import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtmentionEditorComponent } from './components/atmention-editor/atmention-editor.component';
import { AtmentionViewerComponent } from './components/atmention-viewer/atmention-viewer.component';
import { AtmentionSuggestionsOverlayComponent } from './components/suggestions-overlay/atmention-suggestions-overlay.component';
import { AtmentionParse } from './pipes/atmention.pipe';

@NgModule({
  declarations: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtmentionSuggestionsOverlayComponent,
    AtmentionParse,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtmentionSuggestionsOverlayComponent,
    AtmentionParse,
  ]
})
export class AtmentionModule { }
