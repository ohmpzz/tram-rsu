import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TramProvider } from '../../providers/tram/tram';
import { TramStop } from '../../models/tram';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private tramService: TramProvider) {

  }

  add() {
    const tramStop: TramStop = {
      "id": "tramStop12",
        "type": "Feature",
        "properties": {
          "title": "Tram Stop",
          "description": "สะพานระหว่างตึก2 กับ ตึก3"
        },
        "geometry": {
          "type": "stop",
          "coordinates": [100.58745749706407, 13.964124703952862]
        },
        "nearestStop": {
          "next": {
            "id": "tramStop1",
            "distance": "48",
            "duration": "13.9"
          },
          "prev": "tramStop11"
        }
    }
    this.tramService.addTramStop(tramStop).then(() => {
      console.log('[added]')
    })

  }

}
