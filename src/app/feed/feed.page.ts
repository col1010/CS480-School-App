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
    this.calService.getBlogPosts()
      .then(result => {
        this.sortPosts(result)
          .then(sortedPosts => {
            this.postList = sortedPosts;
          })
        this.postList = result;

      });
  }

  sortPosts(posts: Post[]): Promise<Post[]> {
    return new Promise<Post[]>((resolve) => {
      const sortedEventList = posts.slice().sort((a: Post, b: Post) => {
        return b.dateObject.getTime() - a.dateObject.getTime();
      });
      resolve(sortedEventList);
    });
  }

  async handleRefresh(event: any) {
    await this.calService.updateAllCalendars();
    this.refreshPosts();
    event.target.complete();
  }

}
