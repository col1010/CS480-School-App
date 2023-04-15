import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface Event {
  summary: string;
  calendarName: string;
  calendarId: string;
  primaryColor: string;
  secondaryColor: string;
  startTimeString?: string;
  startDateString: string;
  startDateObject: Date;
  endDateObject?: Date,
  endTimeString?: string;
  location: string;
  id: number;
  description: string;
}

export class Calendar {
  calendarIds: string[] = [];
  calendarNames: string[] = [];
  checked: boolean = false;
  primaryColor: string = '';
  secondaryColor: string = '';
  eventLists: Event[][] = [];

  constructor(calendarName: string, checked: boolean) {
    var cal = undefined;
    for (let i = 0; i < environment.calendars.length; i++) {
      for (let j = 0; j < environment.calendars[i].names.length; j++) {
        if (environment.calendars[i].names[j] === calendarName) {
          cal = environment.calendars[i];
        }
      }

    }
    if (cal) {
      this.calendarIds = cal.calendarIds;
      this.calendarNames = cal.names;
      this.primaryColor = cal.primaryColor;
      this.secondaryColor = cal.secondaryColor;
      this.checked = checked;
      this.eventLists = [];
    } else {
      throw new Error("Invalid Calendar Name");
    }
  }

  async populateEventList() {
    this.eventLists = [];
    for (let i = 0; i < this.calendarIds.length; i++) {
      this.eventLists.push([] as Event[]);
    }
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    var oneYear = new Date();
    oneYear.setFullYear(now.getFullYear() + 1);
    const params = {
      key: environment.calendarApiKey,
      timeMin: now.toISOString(),
      timeMax: oneYear.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    }
    const promises = this.calendarIds.map((calendarId, index) => {
      var url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

      return axios.get(url, { params: params })

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
              tmpEvent.startDateObject = d;
              d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
              tmpEvent.startTimeString = undefined;
            } else {
              const d = new Date(event.start.dateTime);
              tmpEvent.startDateObject = d;
              tmpEvent.startTimeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }
            if (event.end.dateTime === undefined) {
              tmpEvent.endTimeString = undefined;
              tmpEvent.endDateObject = tmpEvent.startDateObject; // set the end date the same as the start date to correctly set up an all day event
            } else {
              const d = new Date(event.end.dateTime);
              tmpEvent.endDateObject = d;
              tmpEvent.endTimeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
            }
            tmpEvent.startDateString = CalendarService.formatDate(tmpEvent.startDateObject);
            //console.log(tmpEvent.startDateString);
            tmpEvent.location = event.location;
            tmpEvent.description = event.description;
            tmpEvent.id = id++;
            tmpEvent.calendarId = this.calendarIds[index];
            tmpEvent.primaryColor = this.primaryColor;
            tmpEvent.secondaryColor = this.secondaryColor;
            this.eventLists[index].push(tmpEvent);
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
    await Promise.all(promises);
  }

  private emptyEvent(): Event {
    return {
      summary: '',
      calendarName: '',
      calendarId: '',
      primaryColor: '',
      secondaryColor: '',
      startTimeString: '',
      startDateString: '',
      startDateObject: new Date(),
      endTimeString: '',
      endDateObject: new Date(),
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

  public getCalendarList(): Promise<Calendar[]> {
    return new Promise<Calendar[]>((resolve) => {
      var tmp: Calendar[] = [];
      for (let i = 0; i < this.calendars.length; i++) {
        if (this.calendars[i].checked) {
          tmp.push(this.calendars[i]);
          //console.log("Pushing ", this.calendars[i].calendarName);
        }
      }
      //console.log("tmp: ", tmp);
      resolve(tmp);
    });
  }

  public noCalendarsChecked(): boolean {
    for (let i = 0; i < this.calendars.length; i++) {
      if (this.calendars[i].checked) {
        return false;
      }
    }
    return true;
  }

  public updateAllCalendars(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const promises = this.calendars.map(cal => cal.populateEventList());
      await Promise.all(promises);
      resolve();
    });
  }

  addCalendar(cal: Calendar) {
    this.calendars.push(cal);
  }

  changeCheckedStatus(name: string, checked: boolean) {
    for (let i = 0; i < this.calendars.length; i++) {
      for (let j = 0; j < environment.calendars[i].names.length; j++) {
        if (this.calendars[i].calendarNames[j] === name) {
          this.calendars[i].checked = checked;
          return;
        }
      }
    }
  }

  getEventById(calId: any, eventId: any) {
    return new Promise<Event>((resolve, reject) => {
      for (let i = 0; i < this.calendars.length; i++) {
        for (let j = 0; j < environment.calendars[i].calendarIds.length; j++) {
          if (this.calendars[i].calendarIds[j] === calId) {
            if (this.calendars[i].eventLists[j][eventId] === undefined) {
              reject("Invalid Event");
            } else {
              resolve(this.calendars[i].eventLists[j][eventId]);
            }
          }
        }
      }
      reject("Invalid Calendar");
    });
  }

  static formatDate(date: Date): string {
    return weekdays[date.getDay()] + ' ' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}