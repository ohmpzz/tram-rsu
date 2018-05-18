import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { Tram, TramStop } from '../../models/tram';

import { take, map } from 'rxjs/operators';


@Injectable()
export class TramProvider {
  private readonly _tramRef = this.afs.doc('trams/tramInfo').collection<Tram>('tram')
  private readonly _mapboxDirectionEndpoint = 'https://api.mapbox.com/directions/v5'
  private readonly _access_token = 'pk.eyJ1Ijoib2htcHp6IiwiYSI6ImNqZ3M2M3R3bzBmOGoyem1vNHdsYmlyaHgifQ.M5Fs1sHobCWFehNliIqbrw'

  constructor(private http: HttpClient, private afs: AngularFirestore) {
  }

  getTrams() {
    const itemRef: AngularFirestoreCollection<any> = this._tramRef
    return itemRef.snapshotChanges().pipe(
      map(actions => (
        actions.map(a => ({ id: a.payload.doc.id, ...a.payload.doc.data() as Tram }))
      ))
    )
  }

  getTramStopp() {
    return this.http.get('/../../assets/data/tram-stop.json').pipe(take(1))
  }

  getTramStop() {
    const itemRef = this.afs.doc('trams/tramStopInfo').collection('tramStop')
    return itemRef.snapshotChanges().pipe(
      map(actions => (
        actions.map(a => ({ id: a.payload.doc.id, ...a.payload.doc.data() as TramStop }))
      ))
    )
  }

  test() {
    return this.http.get('https://wanderdrone.appspot.com/')
  }

  getDirection(coords_start: Array<number>, coords_destination: Array<number>) {
    const routingProfile = 'mapbox/driving'
    const start = `${coords_start[0]},${coords_start[1]}`
    const destination = `${coords_destination[0]},${coords_destination[1]}`
    const typeAndKey = `geometries=geojson&access_token=${this._access_token}`
    const itemRef = `${this._mapboxDirectionEndpoint}/${routingProfile}/${start};${destination}?${typeAndKey}`
    
    return this.http.get(itemRef)
  }

  addTramStop(tramStop: TramStop) {
    const itemRef = this.afs.doc('trams/tramStopInfo').collection('tramStop').doc(tramStop.id)
    return itemRef.set({
      type: tramStop.type,
      properties: tramStop.properties,
      geometry: tramStop.geometry,
      nearestStop: tramStop.nearestStop
    })
  }

  getTramStopById(tramStopId: string) {
    const itemRef = this.afs.doc('trams/tramStopInfo').collection('tramStop').doc(tramStopId)
    return itemRef.valueChanges()
  }

}