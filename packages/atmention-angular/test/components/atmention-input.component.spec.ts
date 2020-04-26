import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AtmentionInput } from '../../src/components/atmention-input.component';

describe('AtmentionInput', () => {

  let component: AtmentionInput;

  let fixture: ComponentFixture<AtmentionInput>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(
      {
        declarations: [
          AtmentionInput
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmentionInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

});
