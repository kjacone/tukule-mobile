import { Component, OnInit } from '@angular/core';
import { SHARED } from 'src/app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { login } from 'src/app/shared/interfaces/login';
import { ApisService,UtilService } from 'src/app/services';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from "@ionic/angular";
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ TranslateModule,SHARED]
})
export class LoginPage implements OnInit {
  login: login = { email: '', password: '' };
  submitted = false;
  isLogin: boolean = false;
  constructor(private router: Router,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController) { }

  ngOnInit() {
  }

  onLogin(form: NgForm):any {
    console.log('form', form);
    this.submitted = true;
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }
      console.log('login');
      this.isLogin = true;
      this.api.login(this.login.email, this.login.password).then((userData) => {
        console.log(userData);
        this.api.getProfile(userData.uid).then((info) => {
          console.log(info);
          if (info && info.status === 'active') {
            localStorage.setItem('uid', userData.uid);
            localStorage.setItem('help', userData.uid);
            this.isLogin = false;
            this.util.publishLoggedIn('LoggedIn');
            // this.navCtrl.back();
            this.router.navigate(['/']);
          } else {
            Swal.fire({
              title: this.util.translate('Error'),
              text: this.util.translate('Your are blocked please contact administrator'),
              icon: 'error',
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: this.util.translate('Need Help?'),
              backdrop: false,
              background: 'white'
            }).then(data => {
              if (data && data.value) {
                localStorage.setItem('help', userData.uid);
                this.router.navigate(['inbox']);
              }
            });
          }
        }).catch(err => {
          console.log(err);
          this.util.showToast(`${err}`, 'danger', 'bottom');
        });
      }).catch(err => {
        if (err) {
          console.log(err);
          this.util.showToast(`${err}`, 'danger', 'bottom');
        }
      }).then(el => this.isLogin = false);
    }
  }

  resetPass() {
    this.router.navigate(['/forgot']);
  }

  register() {
    this.router.navigate(['register']);
  }
  back() {
    this.router.navigate(['home']);
  }
}
