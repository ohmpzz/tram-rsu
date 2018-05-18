import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TramMapPage } from './tram-map';

@NgModule({
  declarations: [
    TramMapPage,
  ],
  imports: [
    IonicPageModule.forChild(TramMapPage),
  ],
})
export class TramMapPageModule {}
