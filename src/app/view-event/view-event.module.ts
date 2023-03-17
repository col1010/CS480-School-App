import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewEventPage } from './view-event.page';

import { IonicModule } from '@ionic/angular';

import { ViewEventPageRoutingModule } from './view-event-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewEventPageRoutingModule
  ],
  declarations: [ViewEventPage]
})
export class ViewEventPageModule {}
