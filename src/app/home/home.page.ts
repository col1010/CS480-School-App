import { Component } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import * as $ from 'jquery';

import { DataService, Event } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  eventList: any;
  loaded = false;

  constructor(private data: DataService) { }

  // refresh(ev: any) {
  //   setTimeout( async () => {
      
  //     (ev as RefresherCustomEvent).detail.complete();
  //   }, 3000);
  // }

  handleRefresh(event: any) {
    setTimeout(async () => {
      this.eventList = await this.data.getEventList();
      window.location.reload();
      event.target.complete();
    }, 2000);
  }


  async ionViewDidEnter() {
    if (!this.loaded) {
      this.eventList = await this.data.getEventList();
      this.loaded = true;
    }
  }

}
