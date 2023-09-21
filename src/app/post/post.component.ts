import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../services/data.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent {
  @Input() post?: Post;
  
  constructor() { }

  async openUrl(url: string) {
    await Browser.open({url: url});
  }
}
