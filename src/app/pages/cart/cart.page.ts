import { Component, OnInit, inject } from '@angular/core';
import { ApisService, UtilService } from 'src/app/services';
import { SHARED } from 'src/app/shared';
import {
  IonGrid,
  NavController,
  IonRadioGroup,
  IonRadio,
  IonAvatar,
  IonListHeader,
  IonItemDivider,
  IonTextarea,
} from '@ionic/angular/standalone';
import { Auth, user } from '@angular/fire/auth';
import { NavigationExtras, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  add,
  trash,
  remove,
  starOutline,
  star,
  arrowBackOutline,
  ellipseSharp,
} from 'ionicons/icons';
import { OrderItem } from 'src/app/models/models';
import { serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonTextarea,
    IonItemDivider,
    IonListHeader,
    IonAvatar,
    IonRadio,
    IonRadioGroup,
    IonGrid,
    SHARED,
  ],
})
export class CartPage implements OnInit {
  totalItem: any;
  grandTotal: any;
  cart: any[] = [];
  restaurant: any;
  totalRatting: any;

  auth: Auth = inject(Auth);
  user$ = user(this.auth);
  currentUser: any = { email: '', type: '', uid: '' };
  type: any;
  confirm: any;

  checkOut: OrderItem;
  totalCost: number = 0;
  mpesaNumber: string = '';
  paymentOption: string = 'Cash';
  discount: number = 0;
  isCreated: any;
  constructor(
    private api: ApisService,
    public util: UtilService,
    private router: Router,
    private navCtrl: NavController
  ) {
    addIcons({
      add,
      trash,
      remove,
      starOutline,
      star,
      arrowBackOutline,
      ellipseSharp,
    });
  }

  ngOnInit() {
    this.user$.subscribe((userData: any) => {
      // Do something with the user data
      this.currentUser.email = userData.displayName;
      this.currentUser.uid = userData.uid;
    });
    this.getCart();
    this.getVenueDetails();
  }
  handleChange(ev) {
    console.log('Current value:', ev);
    console.log('Current value:', this.paymentOption);
  }

  getTotalCost(): number {
    let totalCost = 0;
    for (let i = 0; i < this.cart.length; i++) {
      totalCost += this.cart[i].cost * this.cart[i].orderedQuantity;
      for (let j = 0; j < this.cart[i].extras.length; j++) {
        totalCost += this.cart[i].extras[j].cost * this.cart[i].extras[j].qty;
      }
    }
    return totalCost;
  }
  getDiscount(): number {
    let totalDiscount = 0;
    for (let i = 0; i < this.cart.length; i++) {
      totalDiscount += this.cart[i].discount;
    }
    return totalDiscount;
  }

  removeQ = (i, j) => {
    if (this.cart[j].extras[i].qty > 1) {
      this.cart[j].extras[i].qty--;
    }
  };
  addQ = (i, j) => {
    if (this.cart[j].extras[i].qty >= 1) {
      this.cart[j].extras[i].qty++;
    }
  };

  addFQ(j) {
    if (this.cart[j].orderedQuantity >= 1) {
      this.cart[j].orderedQuantity++;
    }
  }
  removeFQ(j) {
    if (this.cart[j].orderedQuantity > 1) {
      this.cart[j].orderedQuantity--;
    }
  }

  remove(i, j) {
    this.cart[j].extras.splice(i, 1);
  }

  getCusine = (cusine) => {
    return cusine.join('-');
  };

  openDetails = () => {
    const navData: NavigationExtras = {
      queryParams: {
        id: '1',
      },
    };
    this.router.navigate(['rest-details'], navData);
  };

  getCart = () => {
    const cart = localStorage.getItem('userCart');
    try {
      if (
        cart &&
        cart !== 'null' &&
        cart !== undefined &&
        cart !== 'undefined'
      ) {
        this.cart = JSON.parse(localStorage.getItem('userCart'));
      } else {
        this.cart = [];
      }
    } catch (error) {
      console.log(error);
      this.cart = [];
    }
  };

  getVenueDetails = () => {
    const restaurant = localStorage.getItem('rest');
    try {
      if (
        restaurant &&
        restaurant !== 'null' &&
        restaurant !== undefined &&
        restaurant !== 'undefined'
      ) {
        this.restaurant = JSON.parse(localStorage.getItem('rest'));
      } else {
        this.restaurant = [];
      }
    } catch (error) {
      console.log(error);
      this.restaurant = [];
    }
  };

  back = () => {
    this.navCtrl.back();
  };

  
  checkout = async () => {
    this.isCreated = true;
    this.totalCost = this.getTotalCost();
    this.discount = this.getDiscount();

    this.checkOut = {
      uid: this.util.getUUID(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      orderNo: this.util.generateOrderNumber(),
      orders: this.cart,
      totalCost: this.totalCost,
      discount: this.discount,
      paymentOption: this.paymentOption,
      mpesaNumber: this.mpesaNumber,
      status: 'pending',
      restaurant: {
        name: this.restaurant.name,
        uid: this.restaurant.uid,
      },
      createdBy: {
        name: this.currentUser.email,
        uid: this.currentUser.uid,
      },
      approvedBy: {
        name: '',
        uid: '',
      },
      paidTo: {
        name: '',
        uid: '',
      },
    };

    await this.api.createOrder(this.checkOut).then((res: any) => {
      console.log(res);
      this.confirm = res;
      localStorage.setItem('pendingOrder', JSON.stringify(this.checkOut));

      // this.navCtrl.navigateForward('/order-confirmation');
    });

    this.clearData();
  };

  clearData = async () => {
    await localStorage.removeItem('foods');
    await localStorage.removeItem('categories');
    await localStorage.removeItem('dummyItem');
    await localStorage.removeItem('vid');
    await localStorage.removeItem('totalItem');
    await localStorage.removeItem('totalPrice');
    await localStorage.removeItem('userCart');
  };
}
