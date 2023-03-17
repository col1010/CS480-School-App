import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Event {
  summary: string;
  calendarName: string;
  dateTime: string;
  location: string;
  id: number;
  description: string;
}

var execute = 1;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public eventList: Event[] = [];

  constructor() { 
    
  }

  public async getEventList(): Promise<any> {
    //this.getGCalendarEvents();
    console.log("hi");
    var url = 'https://www.googleapis.com/calendar/v3/calendars/c24d93250c31d00077422e6da47cd4a0e5fc94680dad684d14fcf5e7fed2ba55@group.calendar.google.com/events';
      const params = {
        key: environment.calendarApiKey,
      }

      await axios.get(url, {params: params})
      
      .then(response => {
        //console.log(response.data);
        const data = JSON.parse(JSON.stringify(response.data));
        const events = data.items;
        var id = 0;
        for (const event of events) {
          var tmpEvent = this.emptyEvent();
          tmpEvent.summary = event.summary;
          tmpEvent.calendarName = '';
          tmpEvent.dateTime = event.start.dateTime;
          tmpEvent.location = event.location;
          tmpEvent.description = event.description;
          tmpEvent.id = id++;
          this.eventList.push(tmpEvent);
        }
        console.log(this.eventList);
      })
      .catch(error => {
        console.log(error);
      });
      return this.eventList
  }

  public getEventById(id: any) {
    return this.eventList[id];
  }

  private emptyEvent(): Event {
    return {
      summary: '',
      calendarName: '',
      dateTime: '',
      location: '',
      id: 0,
      description: ''
    }
  }
  
}
