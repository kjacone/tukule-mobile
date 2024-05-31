import { Component, OnInit } from '@angular/core';
import { SHARED } from 'src/app/shared';

@Component({
  selector: 'app-choose-restaurant',
  templateUrl: './choose-restaurant.page.html',
  styleUrls: ['./choose-restaurant.page.scss'],
  standalone: true,
  imports: [SHARED]
})
export class ChooseRestaurantPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
