import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';

import { FcmProvider } from '../providers/fcm/fcm';

import { Subject } from 'rxjs/Subject';
import { tap, take } from 'rxjs/operators';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
/* 'TramMapPage';  */
  rootPage: any

  pages: Array<{title: string, component: any}>;

  userInfo: any

  constructor(
    public platform: Platform,
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    private authService: AuthProvider,
    private fcm: FcmProvider, 
    private toastCtrl: ToastController
  ) {
    this.initializeApp();
    this.authService.authState$.pipe(take(1)).subscribe(auth => {
      if(auth) {
        this.authService.getUserById(auth.uid).subscribe(user => {
          // this.userInfo = user
        })
        this.nav.setRoot('TramMapPage')
          .then(res => console.log('[setRoot]: success: ', res))
          .catch(err => console.log('[setRoot]: err ', err))
      } else {
        this.nav.setRoot('LoginPage')
          .then(res => console.log('[setRoot]: success: ', res))
          .catch(err => console.log('[setRoot]: err ', err))
      }
    })

    this.authService.authState$.subscribe(auth => {
      if(auth) {
        this.authService.getUserById(auth.uid).subscribe(user => {
          this.userInfo = user
        })
      } 
    })

    

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // Get a FCM token
      /* this.fcm.getToken() */

      // Listen to incoming messages
      // this.fcm.listenToNotifications().pipe(
      //   tap(msg => {
      //     // show a toast
      //     const toast = this.toastCtrl.create({
      //       message: msg.body,
      //       duration: 3000
      //     });
      //     toast.present();
      //   })
      // )
      // .subscribe()
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  signOut() {
    this.authService.signOut()
      .then(() => {
        this.nav.setRoot('LoginPage')
          .then(() => console.log('setRoot: success'))
          .catch((err) => console.log('MyApp navCtrl err: ', err))
      })
      .catch((err) => console.log('My App fn signOut error: ', err))
  }
}
