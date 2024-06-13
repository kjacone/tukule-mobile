import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';

import { Observable, switchMap, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Auth, user } from '@angular/fire/auth';
import { ApisService } from '../api/apis.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  auth: Auth = inject(Auth);

  constructor(private router: Router, private api: ApisService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return user(this.auth).pipe(
      take(1),
      switchMap((user) => {
        console.log('user', user);
        const isAuthenticated = !!user;
        if (!isAuthenticated) {
          console.log('not authenticated');
          this.router.navigate(['home']);
          return of(false);
        }

        // const userDoc: DocumentReference<DocumentData> = doc(this.firestore, 'users', user.uid);
        // return docData(userDoc).pipe(
        //   take(1),
        //   map((userData: any) => {
        //     console.log(' authenticated',userData);
        //     const isAdmin = userData.type === 'admin';
        //     if (isAdmin) {

        //     }else{

        //     }
        //     return !!user;
        //   })
        // );

        // this.api.getSingleFirebaseDocument('users', 'uid', user.uid)
        //   .then((data: any) => {
        //     console.log('data', data);
        //     // const isAdmin = data.type === 'admin';
        //     //     if (isAdmin) {}else{}
        //     return !!data;
        //   });

        return of(true);
      })
    );
  }
}
