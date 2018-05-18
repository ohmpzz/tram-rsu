import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
/* import mapboxgl from 'mapbox-gl' */

import { AuthProvider } from '../../providers/auth/auth';
import { Firebase } from '@ionic-native/firebase';

import { Tram, Sort, TramStop } from '../../models/tram';
import { TramProvider } from '../../providers/tram/tram';

import { 
  map, 
  tap,
  take 
} from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import * as async from 'async';

declare var mapboxgl;

@IonicPage()
@Component({
  selector: 'page-tram-map',
  templateUrl: 'tram-map.html',
})
export class TramMapPage {
  map: any
  geoJson = []
  marker: any
  trams: Tram[]
  sortBy: Sort = 'all'
  tramStop = []

  data = []
  tramStopInfo: TramStop = null

  data$ = new Subject<any>()
  isOpen: boolean = false
  
  userInfo: any = null

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private tramService: TramProvider,
    private geolocation: Geolocation,
    private authService: AuthProvider,
    private firebaseNative: Firebase
  ) {
    mapboxgl.accessToken = 'pk.eyJ1Ijoib2htcHp6IiwiYSI6ImNqZ3M2M3R3bzBmOGoyem1vNHdsYmlyaHgifQ.M5Fs1sHobCWFehNliIqbrw'
    console.log(this.firebaseNative.getToken())
  }

  ionViewDidLoad() {
    this.init()
    this.authService.authState$.subscribe(auth => {
      if(auth) {
        console.log(auth.uid)
        this.authService.getUserById(auth.uid).subscribe(user => {
          this.userInfo = user
          console.log(this.userInfo)
        })
      }
    })
  }

  async init() {
    await this.initGeoJson()
    await this.initMap()

    this.map.on('load', () => {
      this.initTramStop()
      this.initTram()
    })
  }

  initMap() {
    return new Promise((resolve) => {
      this.map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [100.587, 13.9654, 19.95], // starting position [lng, lat]
        zoom: 16.50, // starting zoom,
        maxZoom: 17,
        minZoom: 14
      })
      console.log('[initMap]')
      resolve()
    })
  }

  initTramStop() {
    this.geoJson.map(marker => {
      let el = document.createElement('div');
      el.className = 'marker';

      if(this.authService.isLoggedIn) {
        el.addEventListener('click', () => {
          console.log('marker', marker)
          this.data = []
          this.tramStopInfo = marker
          this.isOpen = true
          this.onPopup(marker)
        });
      }

      

      this.marker = new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        // .setPopup(new mapboxgl.Popup({
        //     offset: 25
        //   }) // add popups
        //   .setHTML(`
        //     <h2 style="font-size: 1.5rem">${marker.properties.title}</h2>
        //   `)
        // )
        .addTo(this.map);
    })
    console.log('[InitTramStop]')
  }

  initGeoJson() {
    return new Promise(resolve => {
      this.tramService.getTramStop().subscribe((tramStop: any[]) => {
        this.geoJson = tramStop || []
        this.tramStop = tramStop || []
        resolve()
      })
    })    
  }

  initTram() {
    this.tramService.getTrams().pipe(
      take(1),
      map(trams => (
        trams.filter(tram => (this.allowedTram(tram)))
      )),
      tap(trams => (
        trams.map(tram => {
          this.initTramOnMap(tram)
        })
      ))
    ).subscribe(trams => {
      console.log('[InitTram]: ', trams)
      this.trams = trams
      this.observeTram()
    },
    (err) => console.log(err))
  }

  private initTramOnMap(tram: Tram) {
    this.map.addSource(tram.id, {
      type: 'geojson',
      data: {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": tram.geolocation.geometry.coordinates
        },
        "properties": {
          "name": tram.geolocation.properties.title
        }
      }
    });

    this.map.addLayer({
      "id": tram.id,
      "type": "symbol",
      "source": tram.id,
      "layout": {
        "icon-image": "rail-15"
      }
    })

    console.log('[prepareTramOnMap]')
  }

  observeTram() {
    this.tramService.getTrams().pipe(
      map(trams => (
        trams.filter(tram => (this.allowedTram(tram)))
      )),
      tap(trams => (
        trams.map(tram => {
          this.setLocationTram(tram)
        })
      ))
    ).subscribe(trams => {
      this.trams = trams
      console.log('[observeS]')
    })
  }

  private setLocationTram(tram: Tram) {
    this.map.getSource(tram.id).setData({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": tram.geolocation.geometry.coordinates
      },
      "properties": {
        "name": tram.geolocation.properties.title
      }
    })
    console.log('[setNewTramLocation]')
  }

  private allowedTram(tram: Tram): boolean {
    switch(this.sortBy as Sort) {
      case "all": {
        return true
      }
      case "onDuty": {
        return (tram.onDuty)
      }
      case "notOnDuty": {
        return (!tram.onDuty)
      }
      default: {
        return false
      }
    }
  }

  setSort(action: Sort) {
    this.sortBy = action
  }

  onPopup(currentStop: TramStop) {
    this.tramService.getTrams()
    .subscribe(trams => {
      async.map(trams,async (tram, next) => {
        let a = await this.findDistanceAndDuration(tram, currentStop)
        next(null, a)
      },
      (err, result) => {
        console.log('result', result)
        this.data$.next(result)
      })
    })
  }

  getNextStopDistanceAndDuration(nextStop, tram) {
    return new Promise(resolve => {
      this.tramService.getTramStopById(nextStop).subscribe((tramStop: TramStop) => {
        this.tramService.getDirection(tram.geolocation.geometry.coordinates, tramStop.geometry.coordinates)
          .subscribe((geo: any) => {
            resolve({duration: +geo.routes[0].duration, distance: +geo.routes[0].distance})
          })
      })
    })
  }

  async findDistanceAndDuration(tram, currentStop: TramStop) {
      let distance = 0
      let duration = 0

      let currentNext = currentStop.id
      // จาก nextStop จนถึง currentStop
      let nextSeq = tram.next.substring(tram.next.indexOf('p') + 1, tram.next.length)
      let currentSeq = currentNext.substring(currentNext.indexOf('p') + 1, currentNext.length)
      /* console.log('[nextSeq]: ', nextSeq)
      console.log('[currentSeq]: ', currentSeq) */


      let du = 0
      let duN = 0
      let duN2 = 0
      if (nextSeq < currentSeq) {
        for (let i = +nextSeq - 1; i < +currentSeq - 1; i++) {
          du += +this.tramStop[i].nearestStop.next.duration
          duration += +this.tramStop[i].nearestStop.next.duration
          distance += +this.tramStop[i].nearestStop.next.distance
          /* console.log('du ', du) */
        }
      }


      if (+nextSeq > +currentSeq) {
        // nextStop to end
        for (let i = +nextSeq - 1; i < this.tramStop.length; i++) {
          duN += +this.tramStop[i].nearestStop.next.duration
          duration += +this.tramStop[i].nearestStop.next.duration
          distance += +this.tramStop[i].nearestStop.next.distance
          /* console.log('duN ', duN) */
        }

        // start to currentStop
        for (let i = 0; i < +currentSeq - 1; i++) {
          duN2 += +this.tramStop[i].nearestStop.next.duration
          duration += +this.tramStop[i].nearestStop.next.duration
          distance += +this.tramStop[i].nearestStop.next.distance
          /* console.log('duN2', duN2) */
        }
      }

      let nextInfo: any = await this.getNextStopDistanceAndDuration(tram.next, tram)
      duration += +nextInfo.duration
      distance += +nextInfo.distance
      // console.log(nextInfo)
      // console.log(`duration: ${duration} : distance: ${distance}`)
      
      return {
        distance: distance,
        duration: duration,
        name: tram.name
      }
  }

  onClosePopup() {
    this.isOpen = !this.isOpen
  }

  
}
