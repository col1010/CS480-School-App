import { Component } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import {Calendar, CalendarService, Event} from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  eventList: Event[] = [];
  tmpEventList: Event[] = [];
  eventsLoaded = false;
  envCalList;

  constructor(private calService: CalendarService) {
    var cal = new Calendar("Lewiston High School Athletic Calendar");
    this.calService.addCalendar(cal);
    var cal = new Calendar("Jenifer Middle School Food Menu");
    this.calService.addCalendar(cal);
    this.envCalList = environment.calendarIds;
  };

  async handleRefresh(event: any) {
      await this.loadEvents();
      this.eventList = this.tmpEventList;
      event.target.complete();
  }

  async ionViewDidEnter() {
    if (!this.eventsLoaded) {
      await this.loadEvents();
      console.log("sorted: ", this.tmpEventList);
      this.eventsLoaded = true;
      this.eventList = this.tmpEventList;
    }
  }

  async loadEvents() {
    this.tmpEventList = [];
    const promises = this.calService.getCalendarList().map(cal => cal.populateEventList());
    const results = await Promise.all(promises);
    this.tmpEventList = this.calService.getCalendarList().reduce((acc, cal) => acc.concat(cal.eventList), [] as Event[]);
    await this.sortEvents();
  }

  async sortEvents() {
    return new Promise<void>((resolve, reject) => {
      const sortedEventList = this.tmpEventList.slice().sort((a: Event, b: Event) => {
        return a.dateObject.getTime() - b.dateObject.getTime();
      });
      this.tmpEventList = sortedEventList;
      resolve();
    });
  }
}
