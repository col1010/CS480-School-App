import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Calendar, CalendarService, Event } from '../services/data.service';

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
    private activatedRoute: ActivatedRoute
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
}
