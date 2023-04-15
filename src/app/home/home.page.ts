import { Component, NgZone, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

import { Calendar, CalendarService, Event } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  eventList: Event[] = [];
  envCalList: any[] = [];
  dateList: string[] = [];
  selectedCalendars: string[] = [];

  endIndex: number;

  moreEventsButtonDisabled: boolean;
  moreEventsButtonShown: boolean;

  dateOptions: any;

  constructor(public calService: CalendarService, private alertController: AlertController, private platform: Platform) {
    this.endIndex = 15;
    this.moreEventsButtonDisabled = false;
    this.moreEventsButtonShown = false;

    this.dateOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
  };

  async ngOnInit() {
    await this.platform.ready();
    await this.initializeCalendars();
    this.refreshEvents();
  }

  initializeCalendars(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.envCalList = environment.calendars;

      if (!localStorage.getItem("firstOpen")) { // first time opening the app
        const defaultCalendarName = 'Independent School District #1';
        const defaultCalendar = this.envCalList.find((cal) => cal.names.includes(defaultCalendarName));
        if (defaultCalendar) {
          this.selectedCalendars.push(defaultCalendar);
          localStorage.setItem(defaultCalendarName, 'checked');
        }
        const alert = await this.alertController.create({
          header: 'Welcome to the Independent School District Calendar App!',
          message: 'You can select school calendars to view using the menu on the left. By default, only the district calendar has been selected.',
          buttons: ['Got it!']
        });
        await alert.present();
        localStorage.setItem("firstOpen", "false");
      }
      for (let i = 0; i < this.envCalList.length; i++) {
        if (localStorage.getItem(this.envCalList[i].names[0]) === "checked") {
          // console.log(this.envCalList[i].names[0], " is checked!");
          this.selectedCalendars.push(this.envCalList[i].names[0]);
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
    const combinedEventList = (await this.calService.getCalendarList()).reduce((acc, cal) => acc.concat(cal.eventLists), [] as Event[][]);
    this.eventList = await this.sortEvents(([] as Event[]).concat(...combinedEventList));
    this.dateList = Array.from(new Set(this.getEvents().map(event => CalendarService.formatDate(event.startDateObject))));
    // console.log("combinedEventList: ", combinedEventList);
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

  async onCheckboxChange(event: any, cal: any) {
    const isChecked = event.detail.checked;
    this.moreEventsButtonDisabled = false;
    this.endIndex = 15;
    if (isChecked) {
      localStorage.setItem(cal.names[0], "checked");
    } else {
      localStorage.setItem(cal.names[0], "unchecked");
    }
    this.calService.changeCheckedStatus(cal.names[0], isChecked);
    //console.log("Changing events...");
    this.refreshEvents();
    //console.log("Done");
  }
}
