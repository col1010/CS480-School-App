import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tabnav',
  templateUrl: './tabnav.page.html',
  styleUrls: ['./tabnav.page.scss'],
})
export class TabnavPage implements OnInit {
  envCalList: any[];

  constructor(private alertController: AlertController) { 
    this.envCalList = environment.calendars;
  }

  async ngOnInit() {
    if (!localStorage.getItem("firstOpen")) { // first time opening the app
      const defaultCalendarName = 'Independent School District #1';
      const defaultCalendar = this.envCalList.find((cal) => cal.names.includes(defaultCalendarName));
      if (defaultCalendar) {
        localStorage.setItem(defaultCalendarName, 'checked');
      }
      const alert = await this.alertController.create({
        header: 'Welcome to the Independent School District Calendar App!',
        message: 'You can select school calendars to view using the menu on the left. By default, only the district calendar has been selected.',
        buttons: ['Got it!']
      });
      alert.present();
      localStorage.setItem("firstOpen", "false");
    }
  }
}
