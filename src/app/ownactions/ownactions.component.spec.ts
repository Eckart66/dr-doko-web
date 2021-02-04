import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnactionsComponent } from './ownactions.component';

describe('OwnactionsComponent', () => {
  let component: OwnactionsComponent;
  let fixture: ComponentFixture<OwnactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnactionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
