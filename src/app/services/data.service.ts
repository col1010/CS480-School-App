import { Injectable, EventEmitter } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { convert } from 'html-to-text';
import { CapacitorHttp } from '@capacitor/core';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface Post {
  title: string;
  dateObject: Date;
  dateString: string
  url: string;
  featuredMediaUrl: string | undefined;
  content: string;
  color: string;
  calendarName: string;
}

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

export class Blog {
  private postUrl: string;
  private mediaUrl: string;
  private calendarName: string;
  private color: string;
  postList: Post[] = [];

  constructor(schoolCode: string, color: string, calendarName: string) {
    console.log("school code: ", schoolCode)
    this.postUrl = `https://www.lewistonschools.net/${schoolCode}/wp-json/wp/v2/posts`;
    this.mediaUrl = `https://www.lewistonschools.net/${schoolCode}/wp-json/wp/v2/media/`; // insert media id at end
    this.color = color;
    this.calendarName = calendarName;
  }

  populateBlogPosts() {
    this.postList = [];
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2); // only fetch posts from 2 months ago or sooner
    const options = {
      url: this.postUrl,
      params: { _fields: "title,content,date,featured_media,link", after: twoMonthsAgo.toISOString() }
    }

    return CapacitorHttp.get(options)
      .then(response => {
        //console.log(this.postUrl);
        //console.log("RESPONSE: ", response);
        const posts = response.data;
        for (const post of posts) {
          let tmpPost = this.emptyPost();
          tmpPost.title = convert(post.title.rendered.toString(), { wordwrap: false });
          tmpPost.dateObject = new Date(post.date);
          tmpPost.dateString = CalendarService.formatDate(tmpPost.dateObject);
          tmpPost.url = post.link;
          tmpPost.color = this.color;
          tmpPost.calendarName = this.calendarName;
          tmpPost.content = convert(post.content.rendered.toString(), { wordwrap: false });
          if (post.featured_media) {
            const media_options = {
              url: this.mediaUrl + post.featured_media,
              params: { _fields: "source_url" }
            }
            CapacitorHttp.get(media_options)
              .then(response => {
                tmpPost.featuredMediaUrl = response.data.source_url;
                console.log("Found featured media: ", tmpPost.featuredMediaUrl);
              })
          }
          //console.log("Stripped excerpt: ", tmpPost.excerpt);
          this.postList.push(tmpPost);
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  emptyPost(): Post {
    return {
      title: '',
      dateObject: new Date(),
      dateString: '',
      url: '',
      featuredMediaUrl: '',
      content: '',
      color: '',
      calendarName: ''
    }
  }
}

export class Calendar {
  calendarIds: string[] = [];
  calendarNames: string[] = [];
  checked: boolean = false;
  primaryColor: string = '';
  secondaryColor: string = '';
  eventLists: Event[][] = [];
  blog: Blog | undefined;

  constructor(calendarName: string, checked: boolean) {
    var cal = undefined;
    for (let i = 0; i < environment.calendars.length; i++) {
      for (let j = 0; j < environment.calendars[i].names.length; j++) {
        if (environment.calendars[i].names[j] === calendarName) {
          cal = environment.calendars[i];
          if (environment.calendars[i].schoolCode !== undefined) {
            this.blog = new Blog(environment.calendars[i].schoolCode!, environment.calendars[i].secondaryColor, environment.calendars[i].names[0]);
          }
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
    //now.setMonth(now.getMonth() - 1);
    var oneYear = new Date();
    oneYear.setFullYear(now.getFullYear() + 1);

    console.log("Calendar Ids: ", this.calendarIds);
    const promises = this.calendarIds.map((calendarId, index) => {

      var options = {
        url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        params: {
          key: environment.calendarApiKey,
          timeMin: now.toISOString(),
          timeMax: oneYear.toISOString(),
          singleEvents: "true",
          orderBy: "startTime"
        }
      }

      return CapacitorHttp.get(options)
        .then((response) => {
          //console.log(response);
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
  private selectedCalendars: string[] = [];
  public selectedCalendarsChanged = new EventEmitter<string[]>();

  public getCalendarList() {
    return this.calendars.filter((cal) => cal.checked);
  }

  public getSelectedCalendars(): string[] {
    return this.selectedCalendars;
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
      const eventPromises = this.calendars.map(cal => cal.populateEventList());
      const blogPromises = this.calendars.map(cal => cal.blog?.populateBlogPosts());
      await Promise.all(eventPromises);
      await Promise.all(blogPromises);
      this.selectedCalendarsChanged.emit(this.selectedCalendars);
      resolve();
    });
  }

  addCalendar(cal: Calendar) {
    this.calendars.push(cal);
    if (cal.checked) {
      console.log("Adding ", cal.calendarNames[0]);
      this.selectedCalendars.push(cal.calendarNames[0]);
      this.selectedCalendarsChanged.emit(this.selectedCalendars);
    }
  }

  changeCheckedStatus(name: string, checked: boolean) {
    for (let i = 0; i < this.calendars.length; i++) {
      for (let j = 0; j < environment.calendars[i].names.length; j++) {
        if (this.calendars[i].calendarNames[j] === name) {
          if (this.selectedCalendars.includes(this.calendars[i].calendarNames[0])) {
            this.selectedCalendars.splice(this.selectedCalendars.indexOf(this.calendars[i].calendarNames[0]), 1);
          } else {
            this.selectedCalendars.push(this.calendars[i].calendarNames[0]);
          }
          this.calendars[i].checked = checked;
          console.log("Done changing checked status");
          console.log("Checked calendars: ", this.selectedCalendars);
          this.selectedCalendarsChanged.emit();
          return;
        }
      }
    }
  }

  getEventById(calId: string, eventId: number): Event | undefined {
    for (let i = 0; i < this.calendars.length; i++) {
      for (let j = 0; j < environment.calendars[i].calendarIds.length; j++) {
        if (this.calendars[i].calendarIds[j] === calId) {
          if (this.calendars[i].eventLists[j][eventId] === undefined) {
            return undefined;
          } else {
            return this.calendars[i].eventLists[j][eventId];
          }
        }
      }
    }
    return undefined;
  }

  getBlogPosts(): Post[] {
    const calendars = this.calendars.filter((cal) => cal.checked && cal.blog?.postList);
    return calendars.reduce((acc, cal) => acc.concat(cal.blog!.postList), [] as Post[]);
  }

  static formatDate(date: Date): string {
    return weekdays[date.getDay()] + ' ' + date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

export class PostService {
  constructor() { }
}