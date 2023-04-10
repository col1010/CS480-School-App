import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarService, Event } from '../services/data.service';
import { Calendar as NativeCalendar } from '@awesome-cordova-plugins/calendar/ngx';
import { ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';


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

  isIOS: boolean = true;
  deviceReady: boolean = false;

  //baseGoogleMapsURL = "https://google.com/maps/search/?api=1&query=";

  constructor(
    private calService: CalendarService,
    private activatedRoute: ActivatedRoute,
    private calendar: NativeCalendar,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) {
    platform.ready().then(() => {
      this.deviceReady = true;
    })
   }

  async ngOnInit() {
    this.isIOS = this.platform.is("ios");
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
        this.presentToastNotification("Error creating event! Does the app have permission to access your Calendar?", true);
        console.log(err);
      });

  }

  async presentToastNotification(message: string, error: boolean) {
    var color;
    error ? color = 'danger' : color = 'success';
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
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
          //console.log(calendar);
          return { name: calendar.name, id: calendar.id, isPrimary: calendar.isPrimary };
        });
      })
      .catch(err => {
        console.error(err);
        this.presentToastNotification("Error getting calendar list", true);
      });
  }
}
