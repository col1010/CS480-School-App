import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewEventPage } from './view-event.page';

import { IonicModule } from '@ionic/angular';

import { ViewEventPageRoutingModule } from './view-event-routing.module';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewEventPageRoutingModule
  ],
  declarations: [ViewEventPage],
  providers: [Calendar]
})
export class ViewEventPageModule {}
