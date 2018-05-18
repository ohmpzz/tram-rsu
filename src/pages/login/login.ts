import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private authService: AuthProvider
  ) {
    
  }

  ionViewDidLoad() {
  }

  facebookLogIn() {
    this.authService.facebookLogIn()
      .then(result => {
        let userInfo = result.additionalUserInfo.profile
        let creationTime = {creationTime: result.user.metadata.creationTime, lastSignInTime: result.user.metadata.lastSignInTime}
        let uid = result.user.uid
        this.authService.addUser(userInfo, creationTime, uid)
          .then(() => {
            this.navCtrl.setRoot('TramMapPage')
              .then(res => console.log('[setRoot]: success: ', res))
              .catch(err => console.log('[setRoot]: err ', err))
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log('[facebookLogIn]: err ', err))
  }

  guestLogIn() {
    this.navCtrl.setRoot('TramMapPage')
      .then(res => console.log('[setRoot]: success: ', res))
      .catch(err => console.log('[setRoot]: err ', err))
  }

}
