import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabnavPageRoutingModule } from './tabnav-routing.module';

import { TabnavPage } from './tabnav.page';
import { MenuComponent } from '../menu/menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabnavPageRoutingModule,
  ],
  declarations: [TabnavPage, MenuComponent]
})
export class TabnavPageModule {}
