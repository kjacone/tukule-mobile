import { Component, OnInit } from '@angular/core';
import { SHARED } from 'src/app/shared';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [SHARED]
})
export class CartPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
