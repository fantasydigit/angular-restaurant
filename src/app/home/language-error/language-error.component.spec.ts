import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageErrorComponent } from './language-error.component';

describe('LanguageErrorComponent', () => {
  let component: LanguageErrorComponent;
  let fixture: ComponentFixture<LanguageErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguageErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
