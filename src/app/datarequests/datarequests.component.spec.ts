import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatarequestsComponent } from './datarequests.component';

describe('DatarequestsComponent', () => {
  let component: DatarequestsComponent;
  let fixture: ComponentFixture<DatarequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatarequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatarequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
