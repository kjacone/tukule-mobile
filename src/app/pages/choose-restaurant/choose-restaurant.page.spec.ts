import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseRestaurantPage } from './choose-restaurant.page';

describe('ChooseRestaurantPage', () => {
  let component: ChooseRestaurantPage;
  let fixture: ComponentFixture<ChooseRestaurantPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseRestaurantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
