import { Component, OnInit } from '@angular/core';
import { start } from 'repl';
import { environment } from 'src/environments/environment';

import { Calendar, CalendarService, Event } from '../services/data.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  eventList: Event[] = [];
  tmpEventList: Event[] = [];
  eventsLoaded = false;
  envCalList: any[] = [];
  dateList: string[] = [];
  selectedCalendars: string[] = [];

  currentPage = 0;
  eventsPerPage = 15;

  constructor(private calService: CalendarService) {

  };

  ngOnInit() {
    this.envCalList = environment.calendarIds;
    for (let i = 0; i < this.envCalList.length; i++) {
      if (localStorage.getItem(this.envCalList[i].name) === "checked") {
        this.selectedCalendars.push(this.envCalList[i].name);
        this.calService.addCalendar(new Calendar(this.envCalList[i].name, true));
      } else {
        this.calService.addCalendar(new Calendar(this.envCalList[i].name, false));
      }
    }
  }

  async handleRefresh(event: any) {
    await this.calService.updateAllCalendars();
    await this.loadEvents();
    event.target.complete();
  }

  async ionViewDidEnter() {
    if (!this.eventsLoaded) {
      await this.calService.updateAllCalendars();
      await this.loadEvents();
      console.log("sorted: ", this.eventList);
      this.eventsLoaded = true;
    }
  }

  async loadEvents() {
    const combinedEventList = (await this.calService.getCalendarList()).reduce((acc, cal) => acc.concat(cal.eventList), [] as Event[]);
    console.log("combinedEventList: ", combinedEventList);
    this.eventList = await this.sortEvents(combinedEventList);
    this.dateList = Array.from(new Set(this.getPage(this.currentPage).map(event => event.dateObject.toDateString())));
  }

  async sortEvents(events: Event[]) {
    return new Promise<Event[]>((resolve) => {
      const sortedEventList = events.slice().sort((a: Event, b: Event) => {
        return a.dateObject.getTime() - b.dateObject.getTime();
      });
      resolve(sortedEventList);
    });
  }

  getPage(pageNumber: number): Event[] {
    console.log("Current page: ", this.currentPage);
    const startIndex = pageNumber * this.currentPage;
    const endIndex = startIndex + this.eventsPerPage;
    return this.eventList.slice(startIndex, endIndex);
  }

  loadNextPage() {
    this.currentPage++;
  }

  async onCheckboxChange(event: any, cal: any) {
    const isChecked = event.detail.checked;
    if (isChecked) {
      localStorage.setItem(cal.name, "checked");
    } else {
      localStorage.setItem(cal.name, "unchecked");
    }
    this.calService.changeCheckedStatus(cal.name);

    await this.loadEvents();

  }
}
