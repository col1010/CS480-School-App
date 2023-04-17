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
    await this.initializeCalendars();
    this.refreshEvents();
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }

  initializeCalendars(): Promise<void> {
    return new Promise<void>(async (resolve) => {

      for (let i = 0; i < this.envCalList.length; i++) {
        if (localStorage.getItem(this.envCalList[i].names[0]) === "checked") {
          // console.log(this.envCalList[i].names[0], " is checked!");
          this.calService.addCalendar(new Calendar(this.envCalList[i].names[0], true));
        } else {
          this.calService.addCalendar(new Calendar(this.envCalList[i].names[0], false));
        }
      }
      await this.calService.updateAllCalendars();
      resolve();
    })
  }

  async handleRefresh(event: any) {
    await this.calService.updateAllCalendars();
    this.refreshEvents();
    event.target.complete();
  }

  async refreshEvents() {
    console.log("Refreshing events...");
    const combinedEventList = (await this.calService.getCalendarList()).reduce((acc, cal) => acc.concat(cal.eventLists), [] as Event[][]);
    this.eventList = await this.sortEvents(([] as Event[]).concat(...combinedEventList));
    this.dateList = Array.from(new Set(this.getEvents().map(event => CalendarService.formatDate(event.startDateObject))));
     console.log("combinedEventList: ", combinedEventList);
    // console.log("eventList: ", this.eventList);
    // console.log("dateList:", this.dateList);
  }

  async sortEvents(events: Event[]) {
    return new Promise<Event[]>((resolve) => {
      const sortedEventList = events.slice().sort((a: Event, b: Event) => {
        return a.startDateObject.getTime() - b.startDateObject.getTime();
      });
      resolve(sortedEventList);
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
      //console.log("sliced array: ", this.eventList.slice(0, this.endIndex));
      this.moreEventsButtonShown = true;
      return this.eventList.slice(0, this.endIndex);
    }
  }

  loadMoreEvents() {
    this.endIndex += 15;
    this.refreshEvents();
  }
}
