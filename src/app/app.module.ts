import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TabnavPageModule } from './tabnav/tabnav.module';

import { CalendarService } from './services/data.service';
export { CalendarService } from './services/data.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, TabnavPageModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, CalendarService],
  bootstrap: [AppComponent],
})
export class AppModule {}