import { Component } from '@angular/core';
import { SHARED } from '../../shared';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fastFoodOutline } from 'ionicons/icons';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [SHARED],
})
export class HomePage {

cancel() {
  
  this.results = [];
  this.searchQuery = '';
}
insert(selected: any) {
  this.selected = selected;
  this.results = [];
  // this.searchQuery = '';
  this.restaurantId = selected.name;

}
  searchQuery: string = '';
  results: any[] = [];
  selected: any;
  handleInput($event:any) {
   const query = $event.target.value.toLowerCase();
    this.api.getFirebaseData('venue',5,'name',this.searchQuery).subscribe((data: any) => {
      console.log(data);
      data.forEach((element: any) => this.results.push({
        name: data.map((item: any) => item.name),
        id: data.map((item: any) => item.restaurant_code),
      }))
     
     
      this.results = data.filter((d: any) => d.name.toLowerCase().includes(query));
 
    })
  }
  selectedAccountType: any;
  restaurantId: any = '';
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private api: ApisService
  ) {
    addIcons({
      fastFoodOutline,
    });
  }

  goNext(type: string) {
    this.selectedAccountType = type;
    console.log(this.selected.restaurantCode);
    this.api.loginWithGoogle(this.selectedAccountType,this.selected);
  }


  register() {
   
    }
}
