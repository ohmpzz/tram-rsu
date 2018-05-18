import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import mapboxgl from 'mapbox-gl';

import { Tram, Sort, TramStop } from '../../models/tram';

import { TramProvider } from '../../providers/tram/tram';
import { 
  filter,
  map, 
  tap,
  take 
} from 'rxjs/operators';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: any
  geoJson = []
  marker: any

  trams: Tram[]

  sortBy: Sort = 'all'
  tramStop = []

  demoJson = []


  constructor(public navCtrl: NavController, private tramService: TramProvider, private geolocation: Geolocation) {
    let a = 'tramStop10'
    let b = a.indexOf('p')
    let c = a.substring(a.indexOf('p') + 1, a.length)
    console.log(c)
  }

  async ionViewDidEnter() {
    await this.initGeoJson()

    mapboxgl.accessToken = 'pk.eyJ1Ijoib2htcHp6IiwiYSI6ImNqZ3M2M3R3bzBmOGoyem1vNHdsYmlyaHgifQ.M5Fs1sHobCWFehNliIqbrw'
    this.map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v9' , // stylesheet location 'mapbox://styles/mapbox/dark-v9'
        center: [100.587, 13.9654, 19.95], // starting position [lng, lat]
        zoom: 16.50, // starting zoom,
        /* maxZoom: 17,
        minZoom: 14 */
      });
    

    this.map.on('click', (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat]
      console.log('[coordinate]: ', coordinates)
      this.demoJson.push(coordinates)
      console.log(this.demoJson)
      console.log(JSON.stringify(this.demoJson))
    })


    this.map.on('load', () => {
      this.geoJson.map(marker => {
        let el = document.createElement('div');
        el.className = 'marker';

        el.addEventListener('click', () => {
          console.log('marker', marker)
          this.onPopup(marker)
        });

        this.marker = new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .setPopup(new mapboxgl.Popup({
              offset: 25
            }) // add popups
            .setHTML(`
              <h2 style="font-size: 1.5rem">${marker}</h2>
            `)
          )
          .addTo(this.map);
      })
      
      this.initData()
    })
  

  }

  /* initCar() {
    this.map.addLayer({
      "id": "train",
      "type": "symbol",
      "source": "train",
      "layout": {
        "icon-image": "rail-15"
      }
    })


    // เพิ่ม train จาก db ให้ realtime ทุกอัน
    this.tramService.getTrams().subscribe((trams: Tram[]) => {
      if(!!trams) {
        trams.map(tram => {

          this.map.addSource('train', {
            type: 'geojson',
            data: {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [125.6, 10.1]
              },
              "properties": {
                "name": "Dinagat Islands"
              }
            }
          })

        })
      }
    })
  } */



  initData() {
    this.map.addSource('drone', {
      type: 'geojson',
      data: {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [125.6, 10.1]
        },
        "properties": {
          "name": "Dinagat Islands"
        }
      }
    });

    this.map.addLayer({
      "id": "drone",
      "type": "symbol",
      "source": "drone",
      "layout": {
        "icon-image": "rocket-15"
      }
    })


    this.geolocation.watchPosition({enableHighAccuracy: true})
      .pipe(
        filter((p) => (p.coords != undefined))
      )
      .subscribe((position)=> {
        console.log('[position]: ', position)
        this.map.getSource('drone').setData({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [position.coords.longitude, position.coords.latitude]
          },
          "properties": {
            "name": "my location"
          }
        })
      },
      (err) => console.log('[watch position err]: ', err))

      this.tramOne()
      this.initTram()
  }

  tramOne() {
    this.map.addSource('tramOne', {
      type: 'geojson',
      data: {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [125.6, 10.1]
        },
        "properties": {
          "name": "Dinagat Islands"
        }
      }
    });

    this.map.addLayer({
      "id": "tramOne",
      "type": "symbol",
      "source": "tramOne",
      "layout": {
        "icon-image": "rail-15"
      }
    })


    this.geolocation.watchPosition({enableHighAccuracy: true})
      .pipe(
        filter((p) => (p.coords != undefined))
      )
      .subscribe((position)=> {
        console.log('[position]: ', position)
        this.map.getSource('tramOne').setData({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [100.59114703919772, 13.965403996900392]
          },
          "properties": {
            "name": "my location"
          }
        })
      },
      (err) => console.log('[watch position err]: ', err))
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
      console.log(trams)
      this.trams = trams
      this.observeTram()
    })
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
      console.log(trams)
      this.trams = trams
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

  onPopup(currentStop) {
    // get trams --- map สถานี next เพื่อ get direction (distance กับเวลา)
    // loop get ค่า (distance กับเวลา) += ----- จนถึงสถานี current แล้วแสดงค่า

    this.tramService.getTrams()
    .subscribe(trams => {
      trams.map((tram: any) => {
        
        let coords_start = tram.geolocation.geometry.coordinates
        this.tramService.getDirection(
          [coords_start[0], coords_start[1]], 
          [100.58704290201325, 13.963950968221127]
        )
        .pipe(take(1))
        .subscribe((geo: any) => {
          console.log(geo)
          let tramInfo = {...tram, distance_nextStop: geo.routes[0].distance, duration_nextStop: geo.routes[0].duration}
          console.log('[trams]: ', tramInfo)
        })
      })
    })

    this.testRoute(currentStop)
  }

  testRoute(currentStop: TramStop) {
    this.tramService.getTrams().subscribe(trams => {
      trams.forEach(async tram => {
        let nextStop = tram.next
        let distance = 0
        let duration = 0
          
        /* this.tramService.getTramStopById(nextStop).subscribe((tramStop: TramStop) => {
          this.tramService.getDirection(tram.geolocation.geometry.coordinates, tramStop.geometry.coordinates)
            .subscribe((geo: any) => {
              distance += +geo.routes[0].distance
              duration += +geo.routes[0].duration
            })
        }) */

        let currentNext = currentStop.id
        // จาก nextStop จนถึง currentStop
        let nextSeq = tram.next.substring(tram.next.indexOf('p') + 1, tram.next.length)
        let currentSeq = currentNext.substring(currentNext.indexOf('p') + 1, currentNext.length)
        console.log('[nextSeq]: ', nextSeq)
        console.log('[currentSeq]: ', currentSeq)


        let du = 0
        let duN = 0
        let duN2 = 0
        if(nextSeq < currentSeq) {
          for(let i = +nextSeq -1; i < +currentSeq -1; i++) {
            du += +this.tramStop[i].nearestStop.next.duration
            duration += +this.tramStop[i].nearestStop.next.duration
            distance += +this.tramStop[i].nearestStop.next.distance
            console.log('du ', du)
          }
        } 


        if(+nextSeq > +currentSeq) {
          console.log('else')
          // nextStop to end
          
          for(let i = +nextSeq -1; i < this.tramStop.length; i++) {
            duN += +this.tramStop[i].nearestStop.next.duration
            duration += +this.tramStop[i].nearestStop.next.duration
            distance += +this.tramStop[i].nearestStop.next.distance
            console.log('duN ',duN)
          }

          // start to currentStop
          for(let i = 0; i < +currentSeq -1; i++) {
            duN2 += +this.tramStop[i].nearestStop.next.duration
            duration += +this.tramStop[i].nearestStop.next.duration
            distance += +this.tramStop[i].nearestStop.next.distance
            console.log('duN2', duN2)
          }

          console.log(duN + duN2)
        }


        /* this.tramStop.map((stop: TramStop) => {
          if(currentStop.id != stop.nearestStop.next.id) {
            distance += +stop.nearestStop.next.distance
            duration += +stop.nearestStop.next.duration
          }
        }) */

        let nextInfo: any = await this.getNextStopDistanceAndDuration(tram.next, tram)
        duration += +nextInfo.duration
        distance += +nextInfo.distance
        console.log(nextInfo)
        console.log(`duration: ${duration} : distance: ${distance}`)

      })
    })
  }

  getNextStopDistanceAndDuration(nextStop, tram) {
    return new Promise(resolve => {
      console.log(nextStop)
      this.tramService.getTramStopById(nextStop).subscribe((tramStop: TramStop) => {
        this.tramService.getDirection(tram.geolocation.geometry.coordinates, tramStop.geometry.coordinates)
          .subscribe((geo: any) => {
            /* distance += +geo.routes[0].distance
            duration += +geo.routes[0].duration */
            resolve({duration: +geo.routes[0].duration, distance: +geo.routes[0].distance})
          })
      })
    })
  }





}


/* this.geoJson.features.map(marker => {
  var el = document.createElement('div');
      el.className = 'marker';

  this.marker = new mapboxgl.Marker(el)
    .setLngLat(marker.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
    .addTo(this.map);
})
 */


   /*  window.setInterval(() => {
      this.tramService.test().subscribe(data => {
        console.log('[data]: ', data)
        url = data
        this.map.getSource('drone').setData(data);
      }) 
    }, 2000); */