import { Component } from '@angular/core';
import { SHARED } from '../../shared';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fastFoodOutline } from 'ionicons/icons';
import { Router, NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [SHARED],
})
export class HomePage {
  selectedAccountType: any;
  restaurantId: any = '';
  constructor(private navCtrl: NavController, private router: Router) {
    addIcons({
      fastFoodOutline,
    });
  }

  goNext(type: string) {
    this.selectedAccountType = type;
    if (type === 'staff') {
      localStorage.setItem('selectedAccountType', type);
      this.navCtrl.navigateRoot(['/login']);
    } else {
      localStorage.setItem('selectedAccountType', type);
      // this.router.navigate(['/tabs']);
      console.log('Restaurant Id: ', this.restaurantId);
      const navData: NavigationExtras = {
        queryParams: {
          id: this.restaurantId,
        },
      };
      this.router.navigate(['category'], navData);
    }
  }
}
