import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Blog } from '../../models/blog/blog.model';
import { SummaryPipe } from '../../pipes/summary.pipe';
import { AccountService } from '../../services/account.service';
import { BlogService } from '../../services/blog.service';
import { IconComponent } from '../../shared/icon.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, SummaryPipe, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  protected readonly accountService = inject(AccountService);
  private readonly toast = inject(ToastService);

  readonly userBlogs = signal<Blog[]>([]);
  readonly loaded = signal(false);
  readonly username = computed(() => this.accountService.user()?.username ?? '');
  readonly withPhoto = computed(() => this.userBlogs().filter(b => !!b.photoId).length);

  ngOnInit(): void {
    const user = this.accountService.currentUserValue;
    if (!user) return;

    this.blogService.getByApplicationUserId(user.applicationUserId).subscribe(blogs => {
      this.userBlogs.set(blogs);
      this.loaded.set(true);
    });
  }

  setDeleteConfirm(blog: Blog, value: boolean): void {
    this.userBlogs.update(list => list.map(b => (b.blogId === blog.blogId ? { ...b, deleteConfirm: value } : b)));
  }

  deleteConfirmed(blog: Blog): void {
    this.blogService.delete(blog.blogId).subscribe(() => {
      this.userBlogs.update(list => list.filter(b => b.blogId !== blog.blogId));
      this.toast.info('Blog deleted.');
    });
  }
}
