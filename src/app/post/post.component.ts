import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../services/data.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  @Input() post?: Post;
  
  constructor() { }

  ngOnInit() {}

  openUrl(url: string) {
    var iab = new InAppBrowser();
    iab.create(url, '_blank');
  }
}
