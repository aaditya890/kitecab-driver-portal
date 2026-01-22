import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerDetailDialogComponent } from './view-customer-detail-dialog.component';

describe('ViewCustomerDetailDialogComponent', () => {
  let component: ViewCustomerDetailDialogComponent;
  let fixture: ComponentFixture<ViewCustomerDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCustomerDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCustomerDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
