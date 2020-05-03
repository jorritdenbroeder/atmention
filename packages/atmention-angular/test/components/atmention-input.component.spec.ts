import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AtmentionEditorComponent } from '../../src/components/atmention-editor/atmention-editor.component';

describe('AtmentionEditorComponent', () => {

  let component: AtmentionEditorComponent;

  let fixture: ComponentFixture<AtmentionEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(
      {
        declarations: [
          AtmentionEditorComponent
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmentionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

});
