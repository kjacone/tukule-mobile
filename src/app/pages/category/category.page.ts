import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  NavController,
  SegmentChangeEventDetail,
} from '@ionic/angular/standalone';
import { ApisService } from 'src/app/services/api/apis.service';
import { UtilService } from 'src/app/services/util/util.service';
import { VariationsPage } from './../variations/variations.page';
// import { MenuComponent } from 'src/app/components/menu/menu.component';
import { IonSegmentCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';
import { arrowForwardOutline,arrowBackOutline, ellipseSharp, star, starOutline } from 'ionicons/icons';
import { SHARED } from 'src/app/shared';
import { AddItemsComponent } from '../../shared/components/add-items/add-items.component';
import { Restaurant } from 'src/app/models/models';
import { Auth, user } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [SHARED,FormsModule],
})
export class CategoryPage implements OnInit {
  filteredFoods: any;
  allFoods: any;
  @ViewChild('content', { static: false }) private content: any;
  id: any = '';
  name: any = '';
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
  restaurant: Restaurant = { cover: '' ,cusine:[] } as Restaurant;








  auth: Auth = inject(Auth);
  user$  = user(this.auth);
  currentUser: any ={ email:'',type:'',uid:''};
  type: any;
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
      arrowBackOutline,
      star,
      starOutline,
      ellipseSharp,
      arrowForwardOutline
    });
  }

  



  ngOnInit() {
    this.user$.subscribe((userData: any) => {
      // Do something with the user data
      this.currentUser.email = userData.displayName;
      this.currentUser.uid = userData.uid;

      
    });

    this.route.queryParams.subscribe((data: any) => {
      console.log('data=>', data.id);
      if (data.hasOwnProperty('id')) {
        this.id = data.id;
        this.currentUser.type = data.type
      }else{
        this.id = localStorage.getItem('rest_id');
      }
      this.getVenueDetails();
    });
  }

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
      console.log( 'Confirm: ', data);
      this.calculate(data);
    }else{
      console.log( 'Dismiss: ', data);
    }
  }

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
  getAddress() {
    return this.address;
  }

  getVenueDetails = () => {
    // Venue Details
    this.api
      .getVenueDetails(this.id)
      .then((data: any): any => {
          console.log(data);
          if (data) {
            this.restaurant = data
            localStorage.removeItem('rest');
            localStorage.setItem('rest', JSON.stringify(this.restaurant));
            const vid = localStorage.setItem('vid',data.restaurantCode);
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
      .subscribe(
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
      );
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
      this.cart = [...cart];
      console.log('carrt', cart);
     
    }
  }
  back() {
    this.navCtrl.back();
  }

  getCusine(cusine) {
    return cusine.join('-');
  }


  statusChange() {
    console.log('status', this.veg);
    this.changeStatus();
  }
  calculate = (item:any) => {
    console.log('item=====>>', item);
    this.totalPrice = 0;
    this.totalItem = 0;
    this.cart = [];
    console.log('cart emplth', this.cart, item);
    this.cart.push(item);

    localStorage.removeItem('userCart');
    localStorage.setItem('userCart', JSON.stringify(this.cart));
    this.totalPrice = item.totalCost;
    this.totalItem = item.orderedQuantity;
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
      await localStorage.setItem('categories', JSON.stringify(this.categories));
      await localStorage.setItem('dummyItem', JSON.stringify(this.dummyFoods));
      await localStorage.setItem('totalItem', this.totalItem);
      await localStorage.setItem('totalPrice', this.totalPrice);
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
    this.navCtrl.navigateForward(['cart']);
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


