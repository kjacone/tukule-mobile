import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  NavController,
  SegmentChangeEventDetail
} from '@ionic/angular/standalone';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { VariationsPage } from './../variations/variations.page';
// import { MenuComponent } from 'src/app/components/menu/menu.component';
import { IonSegmentCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';
import { arrowBackOutline, star, starOutline } from 'ionicons/icons';
import { SHARED } from 'src/app/shared';
import { AddItemsComponent } from "../../shared/components/add-items/add-items.component";
@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [ SHARED]
})

export class CategoryPage implements OnInit {
  async addItem(item: any) {
    // console.log(item); //AddItemsPage
    const modal = await this.modalCtrl.create({
      component: AddItemsComponent,
      componentProps: {
        itemData: item,
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log(data);
    }
  }
  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router,
    // private popoverController: PopoverController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      arrowBackOutline,star,starOutline
    });
  }


  filteredFoods: any;
  allFoods: any;
  @ViewChild('content', { static: false }) private content: any;
  id: any='';
  name: any='';
  descritions: any;
  cover: any = '';
  address: any;
  ratting: any;
  time: any;
  totalRatting: any;
  dishPrice: any;
  cusine: any[] = [];
  foods: any[] = [];

  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(50);
  veg: boolean = false;
  totalItem: any = 0;
  totalPrice: any = 0;
  deliveryAddress: any = '';
  selectedSegment: any = '';
  foodIds: any[] = [];
  cart: any[] = [];

  segmentChanged($event: IonSegmentCustomEvent<SegmentChangeEventDetail>) {
    console.log('event', $event.detail.value);
    console.log('food**', this.allFoods);
    if ($event.detail.value === 'all') {
      this.filteredFoods = [...this.allFoods];
      return;
    } else {
      this.filteredFoods = this.allFoods.filter(
        (item) => item.category === $event.detail.value
      );
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe((data: any) => {
      console.log('data=>', data);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.getVenueDetails();
      }
    });
  }

  getAddress() {
    return this.address;
  }

  getVenueDetails() {
    // Venue Details
    this.api
      .getVenueDetails(this.id)
      .then(
        (data): any => {
          console.log(data);
          if (data) {
            this.name = data.name;
            this.descritions = data.descritions;
            this.cover = data.cover;
            this.address = data.address;
            this.ratting = data.rating ? data.rating : 0;
            this.totalRatting = data.rating ? data.rating : 2;
            this.dishPrice = data.dish_price;
            this.time = data.time;
            this.cusine = data.cusine;

            const vid = localStorage.getItem('vid');
            console.log('id', vid, this.id);
            if (this.id == undefined) {
              this.dummy = [];
              this.presentAlertConfirm();
              return false;
            }
            this.getCates();
            this.getFoods();
          }
        },
        (error) => {
          console.log(error);
          this.util.errorToast(this.util.translate('Something went wrong'));
        }
      )
      .catch((error) => {
        console.log(error);
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
  }

  getCates() {
    this.api
      .getCommons()
      .then(
        (cate) => {
          console.log(cate);

          if (cate) {
            this.categories = cate.categories;
          }
        },
        (error) => {
          console.log(error);
          this.dummy = [];
          this.util.errorToast(this.util.translate('Something went wrong'));
        }
      )
      .catch((error) => {
        console.log(error);
        this.dummy = [];
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
  }
  getFoods() {
    this.api
      .getFoods(this.id)
      .then(
        (data): any => {
          console.log('foods data', data);
          this.foods = [...data];
          this.dummyFoods = [...data];
          this.dummy = [];
          this.filteredFoods = [...this.foods];
          this.allFoods = [...this.foods];
          if (!this.foods.length || this.foods.length === 0) {
            this.util.errorToast(this.util.translate('No Foods found'));
            this.navCtrl.back();
            return false;
          }
          this.changeStatus();
          this.checkCart();
        },
        (error) => {
          console.log(error);
          this.dummy = [];
          this.util.errorToast(this.util.translate('Something went wrong'));
        }
      )
      .catch((error) => {
        console.log(error);
        this.dummy = [];
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
  }

  checkCart() {
    const userCart = localStorage.getItem('userCart');
    if (
      userCart &&
      userCart !== 'null' &&
      userCart !== undefined &&
      userCart !== 'undefined'
    ) {
      const cart = JSON.parse(userCart);
      console.log('carrt', cart);
      console.log(this.foodIds);
      cart.forEach((element) => {
        if (this.foodIds.includes(element.id)) {
          const index = this.foods.findIndex((x) => x.id === element.id);
          console.log('index---<', index);
          this.foods[index].quantiy = element.quantiy;
          this.foods[index].selectedItem = element.selectedItem;
        }
      });
      this.calculate();
    }
  }
  back() {
    this.navCtrl.navigateRoot(['home']);
  }

  getCusine(cusine) {
    return cusine.join('-');
  }
  add(index: any) {
    this.api
      .checkAuth()
      .then((user): any => {
        // if (user) {
        // const vid = localStorage.getItem('vid');
        // if (vid && vid !== this.id) {
        //   this.presentAlertConfirm();
        //   return false;
        // }
        if (
          this.foods[index].variations &&
          this.foods[index].variations.length
        ) {
          console.log('open modal');
          this.openVariations(index);
        } else {
          this.foods[index].ordered_quantity = 1;
          this.calculate();
        }
        // } else {
        //   this.router.navigate(['login']);
        // }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  statusChange() {
    console.log('status', this.veg);
    this.changeStatus();
  }
  calculate() {
    // this.dummy = [];
    // console.log('khaliiii', this.dummy);
    // console.log(this.foods);
    // let item = this.foods.filter(x => x.quantiy > 0);
    // console.log(item);
    // this.totalPrice = 0;
    // this.totalItem = 0;
    // item.forEach(element => {
    //   this.totalItem = this.totalItem + element.quantiy;
    //   this.totalPrice = this.totalPrice + (parseFloat(element.price) * parseInt(element.quantiy));
    // });
    // this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    // console.log('total item', this.totalItem);
    // if (this.totalItem === 0) {
    //   this.totalItem = 0;
    //   this.totalPrice = 0;
    // }
    this.dummy = [];
    console.log('khaliiii', this.dummy);
    console.log(this.foods);
    let item = this.foods.filter((x) => x.ordered_quantity > 0);
    this.foods.forEach((element) => {
      if (element.ordered_quantity === 0) {
        element.selectedItem = [];
      }
    });
    console.log('item=====>>', item);
    this.totalPrice = 0;
    this.totalItem = 0;
    this.cart = [];
    console.log('cart emplth', this.cart, item);
    item.forEach((element) => {
      this.totalItem = this.totalItem + element.ordered_quantity;
      console.log('itemsss----->>>', element);
      if (element && element.selectedItem && element.selectedItem.length > 0) {
        let subPrice = 0;
        element.selectedItem.forEach((subItems) => {
          subItems.item.forEach((realsItems) => {
            subPrice = subPrice + realsItems.value;
          });
          subPrice = subPrice * subItems.total;
        });
        this.totalPrice = this.totalPrice + subPrice;
        // this.totalPrice = this.totalPrice + (subPrice * parseInt(element.quantiy));
      } else {
        this.totalPrice =
          this.totalPrice +
          parseFloat(element.cost) * parseInt(element.ordered_quantity);
      }
      this.cart.push(element);
    });
    localStorage.removeItem('userCart');
    console.log('carrrrrrr---->>>', this.cart);
    localStorage.setItem('userCart', JSON.stringify(this.cart));
    this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    console.log('total item', this.totalItem);
    if (this.totalItem === 0) {
      this.totalItem = 0;
      this.totalPrice = 0;
    }
  }

  async setData() {
    const vid = localStorage.getItem('vid');
    console.log('leaving the planet', vid, this.id);
    console.log('total item', this.totalItem);

    if (this.totalPrice > 0) {
      localStorage.setItem('vid', this.id);
      await localStorage.setItem('foods', JSON.stringify(this.filteredFoods));
      localStorage.setItem('categories', JSON.stringify(this.categories));
      localStorage.setItem('dummyItem', JSON.stringify(this.dummyFoods));
      localStorage.setItem('totalItem', this.totalItem);
      localStorage.setItem('totalPrice', this.totalPrice);
    } else if (this.totalItem == 0) {
      this.totalItem = 0;
      this.totalPrice = 0;
    }
  }
  async ionViewWillLeave() {
    await this.setData();
  }
  changeStatus() {
    this.foods = this.dummyFoods.filter((x) => x.veg === this.veg);
  }
  // addQ(index) {
  //   this.foods[index].quantiy = this.foods[index].quantiy + 1;
  //   this.calculate();
  // }
  // removeQ(index) {
  //   if (this.foods[index].quantiy !== 0) {
  //     this.foods[index].quantiy = this.foods[index].quantiy - 1;
  //   } else {
  //     this.foods[index].quantiy = 0;
  //   }
  //   this.calculate();
  // }

  async openVariations(index) {
    const modal = await this.modalCtrl.create({
      component: VariationsPage,
      cssClass: 'custom_modal2',
      componentProps: {
        name: this.name,
        food: this.foods[index],
      },
    });
    modal.onDidDismiss().then((data) => {
      console.log('from variations', data.data);
      console.log('data.data', data.role);
      let isValid = false;
      if (data.role === 'new') {
        this.foods[index].quantiy = 1;
        const carts = {
          item: data.data,
          total: 1,
        };
        this.foods[index].selectedItem.push(carts);
        isValid = true;
      } else if (data.role === 'sameChoice') {
        this.foods[index].selectedItem = data.data;
        this.foods[index].quantiy = this.foods[index].selectedItem.length;
        isValid = true;
      } else if (data.role === 'newCustom') {
        const carts = {
          item: data.data,
          total: 1,
        };
        this.foods[index].selectedItem.push(carts);
        this.foods[index].quantiy = this.foods[index].quantiy + 1;
        isValid = true;
      } else if (data.role === 'remove') {
        console.log('number', data.data);
        this.foods[index].quantiy = 0;
        this.foods[index].selectedItem = [];
        isValid = true;
      } else {
        console.log('empy');
      }
      if (isValid) {
        console.log('isValid', isValid);
        this.calculate();
      }
    });
    return await modal.present();
  }
  addQ(index) {
    console.log('foooduieeeee===========>>', this.foods[index]);
    if (this.foods[index].variations && this.foods[index].variations.length) {
      this.openVariations(index);
    } else {
      this.foods[index].ordered_quantity =
        this.foods[index].ordered_quantity + 1;
      this.calculate();
    }
  }

  removeQ(index) {
    if (this.foods[index].ordered_quantity !== 0) {
      if (this.foods[index].ordered_quantity >= 1 && !this.foods[index].size) {
        this.foods[index].ordered_quantity =
          this.foods[index].ordered_quantity - 1;
      } else {
        this.openVariations(index);
      }
    } else {
      this.foods[index].quantiy = 0;
    }
    this.calculate();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.util.translate('Warning'),
      message: this.util.translate(
        `you already have item's in cart with different restaurant`
      ),
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: this.util.translate('Clear cart'),
          handler: () => {
            console.log('Confirm Okay');
            localStorage.removeItem('vid');
            this.dummy = Array(10);
            localStorage.removeItem('categories');
            localStorage.removeItem('dummyItem');
            localStorage.removeItem('foods');
            this.totalItem = 0;
            this.totalPrice = 0;
            this.getCates();
            this.getFoods();
          },
        },
      ],
    });

    await alert.present();
  }

  viewCart() {
    console.log('viewCart');
    this.setData();
    this.navCtrl.navigateRoot(['tabs/tab3']);
  }



  openDetails() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id,
      },
    };
    this.router.navigate(['rest-details'], navData);
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }
}
