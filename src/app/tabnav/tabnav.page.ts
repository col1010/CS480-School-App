import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { CalendarService } from '../app.module';
import { Calendar } from '../services/data.service';

@Component({
  selector: 'app-tabnav',
  templateUrl: './tabnav.page.html',
  styleUrls: ['./tabnav.page.scss'],
})
export class TabnavPage implements OnInit {

  constructor(private alertController: AlertController, private calService: CalendarService, private platform: Platform) { }

  async ngOnInit() {
    await this.platform.ready();
    if (!localStorage.getItem("firstOpen")) { // first time opening the app
      const defaultCalendarName = 'Independent School District #1';
      const defaultCalendar = environment.calendars.find((cal) => cal.names.includes(defaultCalendarName));
      if (defaultCalendar) {
        localStorage.setItem(defaultCalendarName, 'checked');
        this.initializeCalendars();
      }
      const alert = await this.alertController.create({
        header: 'Welcome to the Independent School District Calendar App!',
        message: 'You can select school calendars to view using the menu on the left. By default, only the district calendar has been selected.',
        buttons: ['Got it!']
      });
      alert.present();
      localStorage.setItem("firstOpen", "false");
    } else {
      this.initializeCalendars();
    }
  }

  initializeCalendars() {
    environment.calendars.map((cal) => {
      if (localStorage.getItem(cal.names[0]) === "checked") {
        this.calService.addCalendar(new Calendar(cal.names[0], true));
      } else {
        this.calService.addCalendar(new Calendar(cal.names[0], false));
      }
    });
    this.calService.updateAllCalendars();
  }
}
