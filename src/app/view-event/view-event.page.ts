import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Calendar, CalendarService, Event } from '../services/data.service';
import { Calendar as NativeCalendar } from '@awesome-cordova-plugins/calendar/ngx';

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.page.html',
  styleUrls: ['./view-event.page.scss'],
})
export class ViewEventPage implements OnInit {
  public event!: Event;

  baseGoogleMapsURL = "https://google.com/maps/search/";

  constructor(
    private calService: CalendarService,
    private activatedRoute: ActivatedRoute,
    private calendar: NativeCalendar
  ) { }

  async ngOnInit() {
    const eventId = this.activatedRoute.snapshot.paramMap.get('eventId') as string;
    const calId = this.activatedRoute.snapshot.paramMap.get('calendarId') as string;
    this.event = await this.calService.getEventById(calId, parseInt(eventId, 10));
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Calendar' : '';
  }

  replaceSpaces(str: string) {
    return str.replace(/\s/g, '+');
  }

  async addEventToNativeCalendar(event: Event) {

    const calendarId = await this.getCalendarID(event);

    console.log("Calendar Id: ", calendarId);

    const eventOptions = {
      calendarId: parseInt(calendarId)
    };

    this.calendar.createEventInteractivelyWithOptions(event.summary, event.location, event.description, event.startDateObject, event.endDateObject, eventOptions).then(() => {
      console.log("Event added successfully");
    }, (err) => {
      console.log("Error creating event");
    });
    
  }

  async getCalendarID(event: Event): Promise<string> {
    const calendars = await this.calendar.listCalendars();
    const cal = await calendars.find((calendar: any) => calendar.name === event.calendarName);
    console.log("Calendars: ", calendars);
    var calID;
    if (!cal) {
      calID = await this.createCalendar(event);
    } else {
      calID = cal.id;
    }
    return calID;
  }

  async createCalendar(event: Event): Promise<string | undefined> {
    let calOptions = {
      calendarName: event.calendarName,
      calendarColor: event.primaryColor
    }
    var calID: string | undefined;
    this.calendar.createCalendar(calOptions).then((result) => {
      calID = result;
    }).catch((err) => {
      calID = undefined;
    })
    return calID;
  }

  getCalendarURL(event: Event): string {
    return `https://calendar.google.com/calendar/ical/${event.calendarId}/public/basic.ics`;
  }
}
