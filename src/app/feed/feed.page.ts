import { Component, OnInit } from '@angular/core';
import { CalendarService } from '../app.module';
import { Subscription } from 'rxjs';
import { Post } from '../services/data.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {

  subscription: Subscription = new Subscription();
  postList: Post[] = [];

  constructor(private calService: CalendarService, private platform: Platform) { }

  async ngOnInit() {
    await this.platform.ready();

    this.subscription = this.calService.selectedCalendarsChanged.subscribe(() => {
      console.log("Changed (feed component)!");
      this.refreshPosts();
    });
    this.refreshPosts();
  }

  refreshPosts() {
    this.postList = this.sortPosts(this.calService.getBlogPosts());
  }

  sortPosts(posts: Post[]): Post[] {
    return posts.slice().sort((a: Post, b: Post) => {
      return b.dateObject.getTime() - a.dateObject.getTime();
    });
  }

  handleRefresh(event: any) {
    this.calService.updateAllCalendars()
      .then(() => event.target.complete());
  }

}
