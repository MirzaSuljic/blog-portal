import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Blog } from '../../../models/blog/blog.model';
import { PagedResult } from '../../../models/blog/paged-result.model';
import { BlogService } from '../../../services/blog.service';
import { PaginationComponent } from '../../../shared/pagination.component';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-blogs',
  imports: [RouterLink, BlogCardComponent, PaginationComponent],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {
  private readonly blogService = inject(BlogService);

  readonly pageSize = 6;
  readonly page = signal(1);
  readonly pagedBlogResult = signal<PagedResult<Blog> | null>(null);

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.page.set(page);
    this.blogService.getAll({ page, pageSize: this.pageSize }).subscribe(result => {
      this.pagedBlogResult.set(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
