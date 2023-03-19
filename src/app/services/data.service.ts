import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

export interface Event {
  summary: string;
  calendarName: string;
  calendarId: string;
  primaryColor: string;
  secondaryColor: string;
  dateString: string;
  dateObject: Date;
  location: string;
  id: number;
  description: string;
}

export class Calendar {
  calendarId: string = '';
  calendarName: string = '';
  loaded: boolean = false;;
  primaryColor: string = '';
  secondaryColor: string = '';
  eventList: Event[] = [];

  constructor(calendarName: string) {
    var cal = undefined;
    for (let i = 0; i < environment.calendarIds.length; i++) {
      if (environment.calendarIds[i].name === calendarName) {
        cal = environment.calendarIds[i];
      }
    }
    if (cal) {
      this.calendarId = cal.calendarId;
      this.calendarName = cal.name;
      this.primaryColor = cal.primaryColor;
      this.secondaryColor = cal.secondaryColor;
      this.loaded = false;
      this.eventList = [];
    } else {
      throw new Error("Invalid Calendar Name");
    }
  }

  async populateEventList() {
    return new Promise<void>(async (resolve, reject) => {
      this.eventList = [];
      var url = `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`;
      const params = {
        key: environment.calendarApiKey,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: "startTime"
      }

      await axios.get(url, { params: params })

        .then(response => {
          //console.log(response.data);
          const data = JSON.parse(JSON.stringify(response.data));
          const events = data.items;
          var id = 0;
          for (const event of events) {
            var tmpEvent = this.emptyEvent();
            tmpEvent.summary = event.summary;
            tmpEvent.calendarName = data.summary;
            if (event.start.dateTime === undefined) {
              const d = new Date(event.start.date);
              tmpEvent.dateObject = d;
              const dateString = d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
              tmpEvent.dateString = dateString;
            } else {
              const d = new Date(event.start.dateTime);
              tmpEvent.dateObject = d;
              const timeString = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
              const dateString = d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
              tmpEvent.dateString = dateString + ", " + timeString;
            }
            tmpEvent.location = event.location;
            tmpEvent.description = event.description;
            tmpEvent.id = id++;
            tmpEvent.calendarId = this.calendarId;
            tmpEvent.primaryColor = this.primaryColor;
            tmpEvent.secondaryColor = this.secondaryColor;
            this.eventList.push(tmpEvent);
          }
          //console.log(this.eventList);
          resolve();
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  private emptyEvent(): Event {
    return {
      summary: '',
      calendarName: '',
      calendarId: '',
      primaryColor: '',
      secondaryColor: '',
      dateString: '',
      dateObject: new Date(),
      location: '',
      id: 0,
      description: ''
    }
  }
}


@Injectable({
  providedIn: 'root'
})

export class CalendarService {
  constructor() { }

  private calendars: Calendar[] = [];

  public getCalendarList() {
    return this.calendars;
  }

  addCalendar(cal: Calendar) {
    this.calendars.push(cal);
  }

  getEventById(calId: any, eventId: any) {
    return new Promise<Event>((resolve, reject) => {
      for (let i = 0; i < this.calendars.length; i++) {
        if (this.calendars[i].calendarId === calId) {
          if (this.calendars[i].eventList[eventId] === undefined) {
            reject("Invalid Event");
          } else {
            resolve(this.calendars[i].eventList[eventId]);
          }
        }
      }
      reject("Invalid Calendar");
    });

  }
}