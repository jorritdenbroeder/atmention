import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtmentionEditorComponent } from './components/atmention-editor/atmention-editor.component';
import { AtmentionViewerComponent } from './components/atmention-viewer/atmention-viewer.component';
import { SuggestionsOverlayComponent } from './components/suggestions-overlay/suggestions-overlay.component';
import { AtmentionParse } from './pipes/atmention.pipe';

@NgModule({
  declarations: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    SuggestionsOverlayComponent,
    AtmentionParse,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  entryComponents: [
    SuggestionsOverlayComponent,
  ],
  exports: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtmentionParse,
  ]
})
export class AtmentionModule { }
