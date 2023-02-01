import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooditemAddonComponent } from './fooditem-addon.component';

describe('FooditemAddonComponent', () => {
  let component: FooditemAddonComponent;
  let fixture: ComponentFixture<FooditemAddonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooditemAddonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooditemAddonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
