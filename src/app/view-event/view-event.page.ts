import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarService } from '../app.module';
import { Event } from '../services/data.service';
import { Calendar as NativeCalendar } from '@awesome-cordova-plugins/calendar/ngx';
import { ToastController } from '@ionic/angular';
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
  public event: Event | undefined;
  calendarList: SystemCalendar[] = [];
  selectedCalendarId: string = "";

  isIOS: boolean = true;
  deviceReady: boolean = false;

  constructor(
    private calService: CalendarService,
    private activatedRoute: ActivatedRoute,
    private calendar: NativeCalendar,
    private toastController: ToastController,
    private platform: Platform,
  ) {
    platform.ready().then(() => {
      this.deviceReady = true;
    })
  }

  ngOnInit() {
    this.isIOS = this.platform.is("ios");
    const eventId = this.activatedRoute.snapshot.paramMap.get('eventId') as string;
    const calId = this.activatedRoute.snapshot.paramMap.get('calendarId') as string;
    this.event = this.calService.getEventById(calId, parseInt(eventId, 10));
  }

  getBackButtonText() {
    return this.isIOS ? 'Calendar' : '';
  }

  addEventToNativeCalendarInteractively(event: Event) {
    try {
      this.calendar.createEventInteractivelyWithOptions(event.summary, event.location, event.description,
        event.startDateObject, event.endDateObject, {});
    } catch (err) {
      this.presentToastNotification("Error creating event! Does the app have permission to access your Calendar?", true);
    }
  }

  async presentToastNotification(message: string, error: boolean) {
    const color = error ? 'danger' : 'success';
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

  getGoogleMapsUrl(location: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
}
