import { Component, OnInit, OnDestroy} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { CalendarService } from '../app.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  envCalList: any[] = [];
  localSelectedCalendars: string[] = [];
  subscription: Subscription = new Subscription();
  constructor(private platform: Platform, private calService: CalendarService) {
    this.envCalList = environment.calendars;
  }

  async ngOnInit() {
    await this.platform.ready();
    this.localSelectedCalendars = this.calService.getSelectedCalendars();
    this.subscription = this.calService.selectedCalendarsChanged.subscribe(
      (selectedCalendars: string[]) => {
        if (selectedCalendars) {
          this.localSelectedCalendars = selectedCalendars;
        }
        console.log("Changed (menu component)! ", this.localSelectedCalendars);
      }
    )
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
  }



  onCheckboxChange(event: any, cal: any) {
    const isChecked = event.detail.checked;
    if (isChecked) {
      localStorage.setItem(cal.names[0], "checked");
    } else {
      localStorage.setItem(cal.names[0], "unchecked");
    }
    this.calService.changeCheckedStatus(cal.names[0], isChecked);
    console.log("Changing events...");
    //console.log("Done");
  }

}
