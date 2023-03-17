import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService, Event } from '../services/data.service';

@Component({
  selector: 'app-view-Event',
  templateUrl: './view-Event.page.html',
  styleUrls: ['./view-Event.page.scss'],
})
export class ViewEventPage implements OnInit {
  public event!: Event;

  constructor(
    private data: DataService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.event = this.data.getEventById(parseInt(id, 10));
  }

  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Calendar' : '';
  }
}
