import { Component, OnInit,Input  } from '@angular/core';
import { SHARED } from '../../../shared';
import { addIcons } from 'ionicons';
import { closeCircleOutline,addOutline,removeOutline } from 'ionicons/icons';
import { IonRadioGroup, IonRadio, IonTextarea, IonListHeader, IonCheckbox, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss'],
  standalone: true,
  imports: [IonContent, IonCheckbox, IonListHeader, IonTextarea, IonRadio, IonRadioGroup,  SHARED]
})
export class AddItemsComponent  implements OnInit {
cancel() {
throw new Error('Method not implemented.');
}
  @Input() itemData: any;
  constructor() {
    
    addIcons({
      closeCircleOutline,addOutline,removeOutline
    });
  }

  ngOnInit() {
    console.log(this.itemData);
  }

}
