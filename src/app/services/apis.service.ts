import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';
import * as firebase from '@angular/fire';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
export class AuthInfo {
  constructor(public $uid: string) { }

  isLoggedIn() {
    return !!this.$uid;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApisService {
  static UNKNOWN_USER = new AuthInfo(null);
  db = firebase;
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(ApisService.UNKNOWN_USER);
  constructor(
    private fireAuth: AngularFireAuth,
    private adb: AngularFirestore,
    private http: HttpClient
  ) { }

  public checkAuth() {
    return new Promise((resolve, reject) => {
      this.fireAuth.onAuthStateChanged((user: any) => {
        console.log(user);
        if (user) {
          localStorage.setItem('uid', user.uid);
          resolve(user);
        } else {
          this.logout();
          const lng = localStorage.getItem('language') || 'en';
          const selectedCity = localStorage.getItem('selectedCity')||'';
          localStorage.clear();
          localStorage.setItem('language', lng);
          localStorage.setItem('selectedCity', selectedCity);
          resolve(false);
        }
      });
    });
  }

  public login(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.adb.collection('users').doc(res.user.uid).update({
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : ''
            });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {

          this.authInfo$.next(ApisService.UNKNOWN_USER);
          reject(`login failed ${err}`);
        });
    });
  }

  public getCities(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('cities').get().subscribe((venue: any) => {
        let data = venue.docs.map((element:any) => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public register(email: string, password: string, fullname: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.adb.collection('users').doc(res.user.uid).set({
              uid: res.user.uid,
              email: email,
              fullname: fullname,
              type: 'user',
              status: 'active',
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : ''
            });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {

          this.authInfo$.next(ApisService.UNKNOWN_USER);
          reject(`login failed ${err}`)
        });
    });
  }

  public resetPassword(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.sendPasswordResetEmail(email)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(`reset failed ${err}`);
        });
    });
  }

  public logout(): Promise<void> {
    this.authInfo$.next(ApisService.UNKNOWN_USER);
    // this.db.collection('users').doc(localStorage.getItem('uid')).update({ "fcm_token": firebase.firestore.FieldValue.delete() })
    return this.fireAuth.signOut();
  }

  public getProfile(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('users').doc(id).get().subscribe((profile: any) => {
        resolve(profile.data());
      }, error => {
        reject(error);
      });
    });
  }

  public getVenues(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('venue').get().subscribe((venue) => {
        let data = venue.docs.map(element => {
          let item = element.data() as any;
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }
 

  public getVenueDetails(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('venue').doc(id).get().subscribe((venue: any) => {
        
        resolve(venue.data());
      }, error => {
        reject(error);
      });
    });
  }
  public getMyProfile(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('users').doc(id).get().subscribe((users: any) => {
        resolve(users.data());
      }, error => {
        reject(error);
      });
    });
  }

  public getVenueUser(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('users').doc(id).get().subscribe((venue: any) => {
        resolve(venue.data());
      }, error => {
        reject(error);
      });
    });
  }

  public getVenueCategories(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('categories', ref => ref.where('uid', '==', id)).get().subscribe((venue) => {
        var data = venue.docs.map(element => {
          var item = element.data() as any;
          item.id = element.id;
          return item;
        })
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getFoods(uid: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('foods', ref => ref.where('restaurant.uid', '==', uid)).get().subscribe((data) => {
        var food: any[] = data.docs.map(doc => {
          var item = doc.data() as any;
          item.id = doc.id;
          return item;
        });
        resolve(food);
      }, error => {
        reject(error);
      });
    });
  }
  public getCommons(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('commons').doc('app').get().subscribe((data:any) => {
        console.log("commons: ",data.data());
       
        resolve(data.data());
      }, error => {
        reject(error);
      });
    });
  }

  public getMessages(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('messages').doc(id).collection('chats').get().subscribe((messages: any) => {
        console.log(messages);
        let data = messages.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getOffers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('offers').get().subscribe((venue: any) => {
        // resolve(venue.data());
        let data = venue.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  public addNewAddress(uid: string, id: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('address').doc(uid).collection('all').doc(id).set(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateAddress(uid: string, id: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('address').doc(uid).collection('all').doc(id).update(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public deleteAddress(uid: string, id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('address').doc(uid).collection('all').doc(id).delete().then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getMyAddress(uid: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('address').doc(uid).collection('all').get().subscribe((data) => {
        var users = data.docs.map(doc => {
          var item = doc.data() as any;
          item.id = doc.id;
          return item;
        });
        resolve(users);
      }, error => {
        reject(error);
      });
    });
  }

  public createOrder(id: string, param: any): Promise<any> {
    param.vid = this.adb.collection('venue').doc(param.vid);
    param.uid = this.adb.collection('users').doc(param.uid);
    // param.dId = this.db.collection('users').doc(param.dId);
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('orders').doc(id).set(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  sendNotification(msg: string, title: string, id: string) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { task: msg }
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`)
    };
    return this.http.post('https://onesignal.com/api/v1/notifications', body, header);
  }


  public getMyOrders(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('orders', ref => ref.where('userId', '==', id)).get().subscribe(async (venue) => {
        let data = venue.docs.map(element => {
          let item = element.data() as any;
          item.vid.get().then(function (doc) {
            item.vid = doc.data();
            item.vid.id = doc.id;
          });
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getOrderById(id: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb.collection('orders').doc(id).get().subscribe(async (order: any) => {
        let data = await order.data();
        await data.vid.get().then(function (doc: any) {
          data.vid = doc.data();
          data.vid.id = doc.id;
        });
        if (data && data.dId) {
          await data.dId.get().then(function (doc: any) {
            data.dId = doc.id;
            data.dId = doc.data();
          });
        }
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  getDriverInfo(id: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb.collection('users').doc(id).snapshotChanges().subscribe(data => {
        console.log(data);
        resolve(data.payload.data());
      }, error => {
        reject(error);
      });
    });
  }


  public updateOrderStatus(id: string, value: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb.collection('orders').doc(id).update({ status: value }).then(async (order: any) => {
        resolve(order);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getDrivers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('users', ref => ref.where('type', '==', 'delivery')).get().subscribe(async (venue) => {
        let data = venue.docs.map(element => {
          let item = element.data() as any;
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  public sendOrderToDriver(id: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('driverOrders').doc(id).set(param).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public addReview(param: any): Promise<any> {
    param.vid = this.adb.collection('venue').doc(param.vid);
    param.uid = this.adb.collection('users').doc(param.uid);
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('reviews').doc(Math.random().toString()).set(param).then((data) => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public addDriverReview(param: any): Promise<any> {
    param.uid = this.adb.collection('users').doc(param.uid);
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('driverreviews').doc(Math.random().toString()).set(param).then((data) => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateVenue(informations: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('venue').doc(informations.uid).update(informations).then((data) => {
        resolve(data);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public updateProfile(uid: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('users').doc(uid).update(param).then((data) => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getMyReviews(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('reviews', ref => ref.where('id', '==', id)).get().subscribe(async (review) => {
        let data = review.docs.map((element) => {
          let item = element.data() as any;
          item.id = element.id;
          if (item && item.vid) {
            item.vid.get().then(function (doc) {
              item.vid = doc.data();
            });
          }
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getBanners(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('banners').get().subscribe((venue: any) => {
        // resolve(venue.data());
        let data = venue.docs.map((element: any) => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  httpPost(url: string, body: any) {
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${environment.stripe.sk}`)
    };
    const order = this.JSON_to_URLEncoded(body);
    console.log(order)
    return this.http.post(url, order, header);
  }

  httpGet(url: string) {
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${environment.stripe.sk}`)
    };

    return this.http.get(url, header);
  }

  JSON_to_URLEncoded(element: any, key?: string, list?: any[]) {
    let new_list = list || [];
    if (typeof element == "object") {
      for (let idx in element) {
        this.JSON_to_URLEncoded(
          element[idx],
          key ? key + "[" + idx + "]" : idx,
          new_list
        );
      }
    } else {
      new_list.push(key + "=" + encodeURIComponent(element));
    }
    return new_list.join("&");
  }
}
