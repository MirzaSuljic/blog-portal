import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, numberAttribute, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Blog } from '../../../models/blog/blog.model';
import { InitialsPipe } from '../../../pipes/initials.pipe';
import { ReadTimePipe } from '../../../pipes/read-time.pipe';
import { AccountService } from '../../../services/account.service';
import { BlogService } from '../../../services/blog.service';
import { PhotoService } from '../../../services/photo.service';
import { CommentSystemComponent } from '../../comment-components/comment-system/comment-system.component';

@Component({
  selector: 'app-blog',
  imports: [DatePipe, RouterLink, InitialsPipe, ReadTimePipe, CommentSystemComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);
  protected readonly accountService = inject(AccountService);

  /** Route parameter :id (bound through withComponentInputBinding). */
  readonly id = input.required({ transform: numberAttribute });

  readonly blog = signal<Blog | null>(null);
  readonly blogPhotoUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.blogService.get(this.id()).subscribe(blog => {
      if (!blog) {
        this.router.navigate(['/not-found']);
        return;
      }

      this.blog.set(blog);

      if (blog.photoId) {
        this.photoService.get(blog.photoId).subscribe(photo => this.blogPhotoUrl.set(photo?.imageUrl ?? null));
      }
    });
  }
}
