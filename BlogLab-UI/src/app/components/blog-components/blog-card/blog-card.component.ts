import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Blog } from '../../../models/blog/blog.model';
import { InitialsPipe } from '../../../pipes/initials.pipe';
import { ReadTimePipe } from '../../../pipes/read-time.pipe';
import { SummaryPipe } from '../../../pipes/summary.pipe';
import { PhotoService } from '../../../services/photo.service';

@Component({
  selector: 'app-blog-card',
  imports: [RouterLink, DatePipe, SummaryPipe, InitialsPipe, ReadTimePipe],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.css'
})
export class BlogCardComponent implements OnInit {
  private readonly photoService = inject(PhotoService);

  readonly blog = input.required<Blog>();
  readonly blogPhotoUrl = signal<string | null>(null);

  ngOnInit(): void {
    const photoId = this.blog().photoId;
    if (photoId) {
      this.photoService.get(photoId).subscribe(photo => this.blogPhotoUrl.set(photo?.imageUrl ?? null));
    }
  }
}
