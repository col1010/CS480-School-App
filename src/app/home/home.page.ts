import { Component } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';

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

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }


  async ionViewDidEnter() {
    if (!this.loaded) {
      this.eventList = await this.data.getEventList();
      this.loaded = true;
    }
  }

}
