import {
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef
} from '@angular/core';

import {AtmentionModel} from '../../atmention.model';


@Component({
  selector: 'atmention-viewer[model]',
  templateUrl: './atmention-viewer.component.html',
  styleUrls: ['./atmention-viewer.component.css']
})
export class AtmentionViewerComponent implements OnInit, OnChanges {
  @ContentChild(TemplateRef) template: TemplateRef<any>; //TODO: use proper type
  @Input() model: AtmentionModel;

  public segments: any[]; // TODO: add proper type

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    let model = changes.model && changes.model.currentValue;

    if (!model) {
      this.segments = [];
      return;
    }

    // Split at mention boundaries
    this.segments = model.splitAtMentions(); //TODO: how can we do this, causing script error!??

    // Replace line breaks with <br/>, so we don't have to use css white-space wrapping
    this.segments.forEach((segment) => {
      segment.text = segment.text.replace(/\n/g, '<br/>');
    });
  }
}
