import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as firebase from '@angular/fire';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

import {
  Auth,
  authState,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  getAuth,
  User,
} from '@angular/fire/auth';
import {
  map,
  switchMap,
  firstValueFrom,
  filter,
  BehaviorSubject,
  Observable,
  Subscription,
} from 'rxjs';
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  collectionData,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  FieldValue,
  where,
  FieldPath,
  getDocs,
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Router, NavigationExtras } from '@angular/router';
import { AppUser, OrderItem } from 'src/app/models/models';
import { v4 as uuid } from 'uuid';
export class AuthInfo {
  constructor(public $uid: string) {}

  isLoggedIn() {
    return !!this.$uid;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ApisService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging);
  router: Router = inject(Router);
  private provider = new GoogleAuthProvider();

  // observable that is updated when the auth state changes
  user$ = user(this.auth);
  currentUser: User | null = this.auth.currentUser;
  userSubscription: Subscription;

  static UNKNOWN_USER = new AuthInfo(null);
  db = firebase;
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(
    ApisService.UNKNOWN_USER
  );
  constructor(
    private fireAuth: AngularFireAuth,
    private adb: AngularFirestore,
    private http: HttpClient
  ) {}

  getFirebaseData = (
    collectionName: string,
    limitNo: number,
    row: string,
    rowValue: string
  ) => {
    let dataQuery = query(
      collection(this.firestore, collectionName),
      // orderBy('uid', 'desc'),
      // where(row, '==', rowValue),
      limit(limitNo)
    );

    return collectionData(dataQuery);
  };

  getSingleFirebaseDocument = (
    collectionName: string,
    fieldName: string,
    fieldValue: string
  ) => {
    let dataQuery = query(
      collection(this.firestore, collectionName),
      where(fieldName, '==', fieldValue)
    );

    return getDocs(dataQuery).then((querySnapshot) => {
      if (querySnapshot.empty) {
        console.log('No matching documents found.');
        return null;
      } else {
        return querySnapshot.docs[0].data();
      }
    });
  };

  getAllData = (collectionName: string, limitNo: number) => {
    let dataQuery = query(
      collection(this.firestore, collectionName),
      // orderBy('timestamp', 'desc'),
      limit(limitNo)
    );

    return collectionData(dataQuery);
  };

  checkIfItemExists = async (
    collectionName: string,
    fieldName: string,
    fieldValue: any
  ) => {
    const itemRef = doc(collection(this.firestore, collectionName), fieldValue);
    return await getDoc(itemRef);
  
  };

  createCollection = async (
    collectionName,
    collectionData
  )  => {
    try {
      collectionData.uid = uuid();
      const newDataRef = await addDoc(
        collection(this.firestore, collectionName),
        collectionData
      );
      return newDataRef;
    } catch (error) {
      console.error('Error writing new message to Firebase Database', error);
      throw error;
    }
  };

  updateDocument = async (
    collectionName: string,
    documentId: string,
    documentData: DocumentData
  ): Promise<void> => {
    try {
      const docRef = doc(this.firestore, collectionName, documentId);
      await updateDoc(docRef, documentData);
    } catch (error) {
      console.error('Error updating document', error);
      throw error;
    }
  };

  deleteDocument = async (
    collectionName: string,
    documentId: string
  ): Promise<void> => {
    try {
      const docRef = doc(this.firestore, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document', error);
      throw error;
    }
  };

  getDocumentByUID = async (collectionName: string, uid: string) => {
    try {
      const docRef = doc(this.firestore, collectionName, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data: any = docSnap.data();
        data.id = docSnap.id;
        return data;
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.log('Error getting document:', error);
      return null;
    }
  };

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
          const selectedCity = localStorage.getItem('selectedCity') || '';
          localStorage.clear();
          localStorage.setItem('language', lng);
          localStorage.setItem('selectedCity', selectedCity);
          resolve(false);
        }
      });
    });
  }

  // Signs-in Friendly Chat.
  loginWithGoogle(restaurantId, selected: any) {
    signInWithPopup(this.auth, this.provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);

      this.getProfile(result.user.email).then((data: any) => {
       
          localStorage.setItem('user_uid', data.uid);
          localStorage.setItem('rest_id', selected.restaurantCode);
          const navData = {
            queryParams: {
              id: selected.restaurantCode,
              type: data.type,
            },
          };
          this.router.navigate(['category'], navData);
        
      },
      (error) => {
        console.log('error::',error);
        if (restaurantId === 'customer') {
          const navData: NavigationExtras = {
            queryParams: {
              id: selected.restaurantCode,
              name: selected.name,
              type: restaurantId,
            },
          };
          this.router.navigate(['category'], navData);
        } else {
          const navData: NavigationExtras = {
            queryParams: {
              id: selected.restaurantCode,
              name: selected.name,
              type: restaurantId,
            },
          };
          console.log('navData: ', navData);
          this.router.navigate(['register'], navData);
        }
      }
    
    );

      return credential;
    });
  }

  public getCities(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('cities')
        .get()
        .subscribe(
          (venue: any) => {
            let data = venue.docs.map((element: any) => {
              let item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

public  register= async(cUser: AppUser)=> {
      // User doesn't exist, create a new user
      const createdUser = await this.createCollection('users', cUser);
      return createdUser; // Return the created user data
}

public  createOrder= async(order: OrderItem)=> {
      const createdOrder = await this.createCollection('orders', order);
      return createdOrder; 
}

// if(this.checkIfItemExists('users', 'email', cUser.email)){
//   return this.getProfile(cUser.email);
// }else{
//   return this.createCollection('users', cUser);
// }

 

  public resetPassword(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth
        .sendPasswordResetEmail(email)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(`reset failed ${err}`);
        });
    });
  }

  public logout(): Promise<void> {
    this.authInfo$.next(ApisService.UNKNOWN_USER);
    // this.db.collection('users').doc(localStorage.getItem('uid')).update({ "fcm_token": firebase.firestore.FieldValue.delete() })
    return this.fireAuth.signOut();
  }

public getProfile(email: string): Promise<AppUser> {
    return new Promise<any>((resolve, reject) => {
        const userQuery = query(
            collection(this.firestore, 'users'),
            where('email', '==', email)
        );

        getDocs(userQuery)
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    reject('User not found');
                } else {
                    const userData = querySnapshot.docs[0].data();
                    // userData.id = querySnapshot.docs[0].id;
                    resolve(userData);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

  public getVenues(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('venue')
        .get()
        .subscribe(
          (venue) => {
            let data = venue.docs.map((element) => {
              let item = element.data() as any;
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getVenueDetails = (id) => {
    return this.getSingleFirebaseDocument('venue', 'restaurantCode', id);
  };

  public getMyProfile(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users')
        .doc(id)
        .get()
        .subscribe(
          (users: any) => {
            resolve(users.data());
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getVenueUser(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users')
        .doc(id)
        .get()
        .subscribe(
          (venue: any) => {
            resolve(venue.data());
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getVenueCategories(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('categories', (ref) => ref.where('uid', '==', id))
        .get()
        .subscribe(
          (venue) => {
            var data = venue.docs.map((element) => {
              var item = element.data() as any;
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getFoods = (id: string) => {
    return this.getFirebaseData('foods', 10, 'restaurantId', id);
  };

  public getCommons = () => {
    return this.getDocumentByUID('commons', 'app');
  };

  public getMessages(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('messages')
        .doc(id)
        .collection('chats')
        .get()
        .subscribe(
          (messages: any) => {
            console.log(messages);
            let data = messages.docs.map((element) => {
              let item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getOffers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('offers')
        .get()
        .subscribe(
          (venue: any) => {
            // resolve(venue.data());
            let data = venue.docs.map((element) => {
              let item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public addNewAddress(uid: string, id: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('address')
        .doc(uid)
        .collection('all')
        .doc(id)
        .set(param)
        .then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((error) => {
          reject(error);
        });
    });
  }

  public updateAddress(uid: string, id: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('address')
        .doc(uid)
        .collection('all')
        .doc(id)
        .update(param)
        .then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((error) => {
          reject(error);
        });
    });
  }

  public deleteAddress(uid: string, id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('address')
        .doc(uid)
        .collection('all')
        .doc(id)
        .delete()
        .then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((error) => {
          reject(error);
        });
    });
  }

  public getMyAddress(uid: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('address')
        .doc(uid)
        .collection('all')
        .get()
        .subscribe(
          (data) => {
            var users = data.docs.map((doc) => {
              var item = doc.data() as any;
              item.id = doc.id;
              return item;
            });
            resolve(users);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }



  sendNotification(msg: string, title: string, id: string) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { task: msg },
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`),
    };
    return this.http.post(
      'https://onesignal.com/api/v1/notifications',
      body,
      header
    );
  }

  public getMyOrders(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('orders', (ref) => ref.where('userId', '==', id))
        .get()
        .subscribe(
          async (venue) => {
            let data = venue.docs.map((element) => {
              let item = element.data() as any;
              item.vid.get().then(function (doc) {
                item.vid = doc.data();
                item.vid.id = doc.id;
              });
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getOrderById(id: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb
        .collection('orders')
        .doc(id)
        .get()
        .subscribe(
          async (order: any) => {
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
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  getDriverInfo(id: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb
        .collection('users')
        .doc(id)
        .snapshotChanges()
        .subscribe(
          (data) => {
            console.log(data);
            resolve(data.payload.data());
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public updateOrderStatus(id: string, value: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb
        .collection('orders')
        .doc(id)
        .update({ status: value })
        .then(async (order: any) => {
          resolve(order);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public getDrivers(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users', (ref) => ref.where('type', '==', 'delivery'))
        .get()
        .subscribe(
          async (venue) => {
            let data = venue.docs.map((element) => {
              let item = element.data() as any;
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public sendOrderToDriver(id: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('driverOrders')
        .doc(id)
        .set(param)
        .then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((error) => {
          reject(error);
        });
    });
  }

  public addReview(param: any): Promise<any> {
    param.vid = this.adb.collection('venue').doc(param.vid);
    param.uid = this.adb.collection('users').doc(param.uid);
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('reviews')
        .doc(Math.random().toString())
        .set(param)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public addDriverReview(param: any): Promise<any> {
    param.uid = this.adb.collection('users').doc(param.uid);
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('driverreviews')
        .doc(Math.random().toString())
        .set(param)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public updateVenue(informations: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('venue')
        .doc(informations.uid)
        .update(informations)
        .then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        )
        .catch((error) => {
          reject(error);
        });
    });
  }

  public updateProfile(uid: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('users')
        .doc(uid)
        .update(param)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public getMyReviews(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('reviews', (ref) => ref.where('id', '==', id))
        .get()
        .subscribe(
          async (review) => {
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
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public getBanners(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb
        .collection('banners')
        .get()
        .subscribe(
          (venue: any) => {
            // resolve(venue.data());
            let data = venue.docs.map((element: any) => {
              let item = element.data();
              item.id = element.id;
              return item;
            });
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  httpPost(url: string, body: any) {
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${environment.stripe.sk}`),
    };
    const order = this.JSON_to_URLEncoded(body);
    console.log(order);
    return this.http.post(url, order, header);
  }

  httpGet(url: string) {
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${environment.stripe.sk}`),
    };

    return this.http.get(url, header);
  }

  JSON_to_URLEncoded(element: any, key?: string, list?: any[]) {
    let new_list = list || [];
    if (typeof element == 'object') {
      for (let idx in element) {
        this.JSON_to_URLEncoded(
          element[idx],
          key ? key + '[' + idx + ']' : idx,
          new_list
        );
      }
    } else {
      new_list.push(key + '=' + encodeURIComponent(element));
    }
    return new_list.join('&');
  }
}
