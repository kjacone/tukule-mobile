import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SHARED } from '../../../shared';
import { addIcons } from 'ionicons';
import { IonModal, ModalController } from '@ionic/angular';
import { closeCircleOutline, addOutline, removeOutline } from 'ionicons/icons';
import {
  IonRadioGroup,
  IonRadio,
  IonTextarea,
  IonListHeader,
  IonCheckbox,
  IonContent,
CheckboxChangeEventDetail,
} from '@ionic/angular/standalone';
import { SelectedFoodItem } from 'src/app/models/models';
import { serverTimestamp } from 'firebase/firestore';
import { IonCheckboxCustomEvent } from '@ionic/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCheckbox,
    IonListHeader,
    IonTextarea,
    IonRadio,
    IonRadioGroup,
    SHARED,FormsModule
  ],
})
export class AddItemsComponent implements OnInit {
removeQ() {
  if (this.myOrder.orderedQuantity > 1) {
    this.myOrder.orderedQuantity = this.myOrder.orderedQuantity - 1;
    this.myOrder.cost = Number(this.myOrder.orderedQuantity) *  Number(this.itemData.cost)
  }
}
addQ() {
 this.myOrder.orderedQuantity = this.myOrder.orderedQuantity + 1;
 this.myOrder.cost = Number(this.myOrder.orderedQuantity) * Number(this.itemData.cost)
}

  @ViewChild(IonModal) modal: IonModal;
  @Input() itemData: any;
  selectedItems: SelectedFoodItem;
  orderedQuantity: number;
  cost: number;
  myOrder: any = {
    orderedQuantity: 1,
    cost: 0,
    extras: [],
    accompaniment: '',
    instructions: '',
    totalCost: 0,
  };

  constructor(private modalCtrl: ModalController) {
    addIcons({
      closeCircleOutline,
      addOutline,
      removeOutline,
    });
  }
  ngOnInit() {
    console.log(this.itemData);
    this.myOrder.cost = this.itemData.cost;
    this.myOrder.orderedQuantity = 1;
  }

  populate = () => {

   this.myOrder.totalCost = 
       Number(this.myOrder.orderedQuantity * this.itemData.cost) +
       Number(this.myOrder.extras.reduce((a, b) => (a + b.cost), 0));

    let selectedData: SelectedFoodItem = {
      name: this.itemData.name,
      category: this.itemData.category,
      menuName: this.itemData.menu_name,
      foodImage: this.itemData.food_image,
      description: this.itemData.description,
      orderedQuantity: this.myOrder.orderedQuantity,
      cost: this.itemData.cost,
      discount: 0,
      tags: this.itemData.tags,
      accompaniment: this.myOrder.accompaniment,
      extras: this.myOrder.extras,
      totalCost: this.myOrder.totalCost,
      instructions: this.myOrder.instructions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };


    return selectedData;
  };

  onExtras(event,item) {
    if (event.target.checked) {
      this.myOrder.extras.push(item);
    } else {
      const index =  this.myOrder.extras.indexOf(item);
      if (index !== -1) {
        this.myOrder.extras.splice(index, 1);
      }
    }
    console.log('Extras: ',this.myOrder.extras);
    }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  confirm() {
    let data = this.populate();
    this.modalCtrl.dismiss(data, 'confirm');
  }
}
