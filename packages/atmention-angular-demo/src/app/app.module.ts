import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AtmentionModule } from 'atmention-angular';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    AtmentionModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
