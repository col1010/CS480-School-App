import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        component: TabsComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'home',
          },
          {
            path: 'home',
            loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
          },
          {
            path: 'radio',
            loadChildren: () => import('./feed/feed.module').then((m) => m.FeedPageModule),
          },
          {
            path: 'calendar/:calendarId/event/:eventId',
            loadChildren: () => import('./view-event/view-event.module').then( m => m.ViewEventPageModule)
          }
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})

export class AppRoutingModule { }
