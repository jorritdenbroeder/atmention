import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AtmentionViewerComponent } from './components/atmention-viewer/atmention-viewer.component';
import { AtmentionEditorComponent } from './components/atmention-editor/atmention-editor.component';
import {AtmentionParse} from './pipes/atmention.pipe';

@NgModule({
  declarations: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtmentionParse,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [
    AtmentionViewerComponent,
    AtmentionEditorComponent,
    AtmentionParse,
  ]
})
export class AtmentionModule { }
