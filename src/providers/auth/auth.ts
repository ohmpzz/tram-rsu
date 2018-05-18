import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';

import { User } from '../../models/user';

import { Observable } from 'rxjs/Observable';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthProvider {
  private _authState: any
  private _userInfo: any
  public userInfo$: Observable<any> = null

  constructor(public http: HttpClient, private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.authState.subscribe(auth => {
      this._authState = auth
      if(auth) {
        this.getUserInfo(auth.uid) 
      }
    })
  }

  //// Authentication
  set setAuthen(auth) {
    this._authState = auth
  }

  get isLoggedIn(): boolean {
    return !!this._authState
  }

  get currentUser(): any {
    return this.isLoggedIn ? this._authState : null
  }

  get authState$(): Observable<any> {
    return this.afAuth.authState
  }

  get currentUserId(): string {
    return this.isLoggedIn ? this._authState['uid'] : '' 
  }

  get userInfo(): User {
    return this._userInfo
  }


  public signOut() {
    return this.afAuth.auth.signOut()
  }

  private getUserInfo(uid: string) {
    this.afs.collection('users').doc(uid)
      .snapshotChanges().pipe(
        take(1),
        map(action => {
          return {uid: action.payload.id, ...action.payload.data() as User}
        })
      )
      .subscribe(user => {
        if(user) {
          this._userInfo = user
        } else {
          this._userInfo = null
        }
        
      })
  }


  //// Social Authentication

  facebookLogIn() {
    const provider = new firebase.auth.FacebookAuthProvider()
    return this.socialLogIn(provider)
  }

  private socialLogIn(provider): Promise<any> {
    return this.afAuth.auth.signInWithRedirect(provider).then(() => {
        return this.afAuth.auth.getRedirectResult()
    }).catch((error) => {
      console.log(error)
    });
  }


  //// User Profile

  addUser(credential, creationTime, uid) {
    const itemRef = this.afs.collection('users').doc(uid)
    return itemRef.set({
      ...credential,
      ...creationTime
    })
  }

  getUserById(id) {
    const userRef = this.afs.collection('users').doc(id)
    return userRef.snapshotChanges().pipe(
      map(action => {
        return {uid: action.payload.id, ...action.payload.data() as User}
      })
    )
  }

}
