import { Component, OnInit, OnDestroy} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { CalendarService } from '../app.module';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  envCalList: any[] = [];
  selectedCalendars: string[] = [];
  constructor(private platform: Platform, private calService: CalendarService) {
    this.envCalList = environment.calendars;
  }

  async ngOnInit() {
    await this.platform.ready();
    this.selectedCalendars = this.calService.getSelectedCalendars();
  }

  onCheckboxChange(event: any, cal: any) {
    this.calService.changeCheckedStatus(cal.names[0], event.detail.checked);
  }
}
