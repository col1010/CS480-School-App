import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CalendarService } from '../app.module';

import { Calendar, Event } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  eventList: Event[] = [];
  envCalList: any[] = [];
  dateList: string[] = [];
  selectedCalendars: string[] = [];

  endIndex: number;

  subscription: Subscription = new Subscription();

  moreEventsButtonDisabled: boolean;
  moreEventsButtonShown: boolean;

  dateOptions: any;

  constructor(public calService: CalendarService, private platform: Platform) {
    this.endIndex = 15;
    this.moreEventsButtonDisabled = false;
    this.moreEventsButtonShown = false;
    this.envCalList = environment.calendars;
    this.dateOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
  };

  async ngOnInit() {
    await this.platform.ready();
    this.subscription = this.calService.selectedCalendarsChanged.subscribe(() => {
      console.log("Changed (home component)!");
      this.endIndex = 15;
      this.moreEventsButtonDisabled = false;
      this.refreshEvents();
    });
    this.refreshEvents();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleRefresh(event: any) {
    this.calService.updateAllCalendars()
      .then(() => event.target.complete());
  }

  refreshEvents() {
    const calendars = this.calService.getCalendarList();
    const eventArrs = calendars.reduce((acc, cal) => acc.concat(cal.eventLists), [] as Event[][]);
    const combinedEventList = ([] as Event[]).concat(...eventArrs);
    this.eventList = this.sortEvents(combinedEventList);
    /* Change detection triggered  */
    this.dateList = Array.from(new Set(this.getEvents().map(event => event.startDateString)));
  }

  sortEvents(events: Event[]) {
    return events.slice().sort((a: Event, b: Event) => {
      return a.startDateObject.getTime() - b.startDateObject.getTime();
    });
  }

  getEvents(): Event[] {
    if (!this.eventList.length) {
      this.moreEventsButtonShown = false;
      return [];
    } else {
      if (this.endIndex > this.eventList.length) {
        this.endIndex = this.eventList.length;
        this.moreEventsButtonDisabled = true;
      }
      this.moreEventsButtonShown = true;
      return this.eventList.slice(0, this.endIndex);
    }
  }

  loadMoreEvents() {
    this.endIndex += 15;
    this.refreshEvents();
  }
}
