import { Injectable } from '@angular/core';
import { google } from 'googleapis';

export interface Message {
  schoolName: string;
  subject: string;
  date: string;
  location: string;
  id: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public messages: Message[] = [
    {
      schoolName: 'Lewiston High School',
      subject: 'Boys basketball game at LHS aslkdjfiouzcouaoisdfuiosadufiouasiou',
      date: 'November 12th, 5 PM',
      location: 'LHS',
      id: 0,
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
      schoolName: 'Lewiston High School',
      subject: 'Girls basketball game at LHS',
      date: 'November 12th, 5 PM',
      location: 'LHS',
      id: 0,
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  ];

  constructor() { 
    
  }

  public /*async*/ getMessages() /*: Promise<Message[]>*/ {
    
    return this.messages;
  }
  
  private async getGCalendarEvents() {
    var returnEvents = new Array();
    const cal = google.calendar('v3');
    const eventList = await cal.events.list({
      calendarId: 'c24d93250c31d00077422e6da47cd4a0e5fc94680dad684d14fcf5e7fed2ba55@group.calendar.google.com',
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })
    const events = eventList.data.items;
    
    if (!events || events.length === 0) {
      return {};
    }
    events.forEach(function (event) {
      returnEvents.push({
        schoolName: 'sample school name',
        subject: event.summary,
        date: event.start?.dateTime,
        location: event.location,
        id: 0,
        description: event.description
      })
    });
    return returnEvents;
  }
  

  public getMessageById(id: number): Message {
    return this.messages[id];
  }
}
