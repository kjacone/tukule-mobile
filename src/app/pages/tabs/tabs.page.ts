import { Component,EnvironmentInjector, inject } from '@angular/core';
import { SHARED } from 'src/app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';


import { fastFoodOutline,personOutline,cartOutline,documentOutline } from 'ionicons/icons';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [TranslateModule,SHARED]
})
export class TabsPage   {
  public environmentInjector = inject(EnvironmentInjector);
  constructor() { 

    addIcons({
      fastFoodOutline,personOutline,cartOutline,documentOutline
    });
  }

 

}
