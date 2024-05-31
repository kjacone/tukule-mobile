import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariationsPage } from './variations.page';

describe('VariationsPage', () => {
  let component: VariationsPage;
  let fixture: ComponentFixture<VariationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VariationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
