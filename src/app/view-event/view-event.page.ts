import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarService, Event } from '../services/data.service';
import { Calendar as NativeCalendar } from '@awesome-cordova-plugins/calendar/ngx';
import { ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface SystemCalendar {
  id: string;
  name: string;
  isPrimary: string;
}

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.page.html',
  styleUrls: ['./view-event.page.scss'],
})
export class ViewEventPage implements OnInit {
  public event!: Event;
  calendarList: SystemCalendar[] = [];
  selectedCalendarId: string = "";

  //baseGoogleMapsURL = "https://google.com/maps/search/?api=1&query=";

  constructor(
    private calService: CalendarService,
    private activatedRoute: ActivatedRoute,
    private calendar: NativeCalendar,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
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
  /*
    encodeSearchQuery(query: string) {
      return encodeURIComponent(query);
    }
  
    sanitizeUrl(url: string): SafeUrl {
      console.log(this.sanitizer.bypassSecurityTrustUrl(url));
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }
  */
  addEventToNativeCalendarInteractively(event: Event) {

    this.calendar.createEventInteractivelyWithOptions(event.summary, event.location, event.description, event.startDateObject, event.endDateObject, {}).then(
      () => {

      }, (err) => {
        this.presentToastNotification("Error creating event!", true);
      });

  }

  addEventToNativeCalendarSilently(event: Event) {
    this.calendar.createEventWithOptions(event.summary, event.location, event.description, event.startDateObject, event.endDateObject, {calendarId: parseInt(this.selectedCalendarId)}).then(
      () => {

      }, (err) => {
        this.presentToastNotification("Error creating event!", true);
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

  async presentToastNotification(message: string, error: boolean) {
    var color;
    error ? color = 'danger' : color = 'success';
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }

  getCalendarICSUrl(calId: string): string {
    return `https://calendar.google.com/calendar/ical/${calId}/public/basic.ics`;
  }

  getGoogleCalendarUrl(calId: string): string {
    return `https://calendar.google.com/calendar/r?cid=${calId}`;
  }

  getCalendarList() {
    this.calendar.listCalendars()
      .then(calendars => {
        this.calendarList = calendars.map((calendar: any) => {
          console.log(calendar);
          return { name: calendar.name, id: calendar.id, isPrimary: calendar.isPrimary };
        });
      })
      .catch(err => {
        console.error(err);
        this.presentToastNotification("Error getting calendar list", true);
      });
  }
}
