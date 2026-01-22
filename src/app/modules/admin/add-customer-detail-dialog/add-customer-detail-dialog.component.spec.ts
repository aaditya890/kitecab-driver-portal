import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomerDetailDialogComponent } from './add-customer-detail-dialog.component';

describe('AddCustomerDetailDialogComponent', () => {
  let component: AddCustomerDetailDialogComponent;
  let fixture: ComponentFixture<AddCustomerDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCustomerDetailDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCustomerDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
