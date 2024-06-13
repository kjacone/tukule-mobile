import { FieldValue } from '@angular/fire/firestore';

interface Base {
  createdAt: FieldValue;
  updatedAt: FieldValue;
  uid?: string;
}

export interface AppUser extends Base {
  email: string;
  uid: string;
  fullName: string;
  coverImage: string;
  fcmToken: string;
  phone: string;
  idNumber: string;
  status: string;
  type: string;
  restaurantCode: string;
}
export interface CityItem extends Base {
  status: string;
  name: string;
  id: string;
  lat: string;
  lng: string;
}

export interface Restaurant extends Base {
  restaurantCode: string;
  name: string;
  email: string;
  description: string;
  address: string;
  rating: number;
  totalRating: number;
  lat: number;
  lng: number;
  cover: string;
  dishPrice: number;
  time: string;
  cusine: any[];
  owner: any;
  openTime: string;
  closeTime: string;
  isClose: boolean;
  phone: string;
  veg: boolean;
  status: string;
  city: string;
  images: string[];
}


export interface ExtraItem {
  id: number;
  name: string;
  price: number;
  // ... other properties
}


export interface FoodItem extends Base {
  name: string;
  uom: string;
  category: string;
  menuName: string;
  foodImage: string;
  description: string;
  quantity: number;
  instock: number;
  orderedQuantity: number;
  veg: boolean;
  cost: number;
  discount: number;
  reorder: number;
  tags: string[];
  supplysUsed: any[]; // Replace `any` with the actual type of `this.formData`
  accompaniments: string[];
  extras: any[];
  createdBy: {
    name: string;
    uid: string;
  };
  restaurant: {
    name: string;
    uid: string;
  };
}
export interface SelectedFoodItem extends Base {
  name: string;
  category: string;
  menuName: string;
  foodImage: string;
  description: string;
  orderedQuantity: number;
  cost: number;
  discount: number;
  tags: string[];
  accompaniment: string;
  instructions: string;
  extras: ExtraItem[];
  totalCost: number;
}


  export interface OrderItem extends Base {
    orders: any[];
    totalCost: number;
    status: string;
    orderNo: string;
    paymentOption: string;
    mpesaNumber?: string;
  discount: number;
    restaurant: {
      name: string;
      uid: string;
    };
    createdBy: {
      name: string;
      uid: string;
    };
    approvedBy: {
      name: string;
      uid: string;
    };
    paidTo: {
      name: string;
      uid: string;
    };
  }

