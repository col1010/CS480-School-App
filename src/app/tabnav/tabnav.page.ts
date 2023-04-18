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
  envCalList: any[];

  constructor(private alertController: AlertController, private calService: CalendarService, private platform: Platform) {
    this.envCalList = environment.calendars;
  }

  async ngOnInit() {
    await this.platform.ready();
    if (!localStorage.getItem("firstOpen")) { // first time opening the app
      const defaultCalendarName = 'Independent School District #1';
      const defaultCalendar = this.envCalList.find((cal) => cal.names.includes(defaultCalendarName));
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

  initializeCalendars(): Promise<void> {
    return new Promise<void>(async (resolve) => {

      for (let i = 0; i < this.envCalList.length; i++) {
        if (localStorage.getItem(this.envCalList[i].names[0]) === "checked") {
          // console.log(this.envCalList[i].names[0], " is checked!");
          this.calService.addCalendar(new Calendar(this.envCalList[i].names[0], true));
        } else {
          this.calService.addCalendar(new Calendar(this.envCalList[i].names[0], false));
        }
      }
      await this.calService.updateAllCalendars();
      resolve();
    })
  }
}
