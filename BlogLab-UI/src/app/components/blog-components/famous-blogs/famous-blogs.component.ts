import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Blog } from '../../../models/blog/blog.model';
import { BlogService } from '../../../services/blog.service';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-famous-blogs',
  imports: [RouterLink, BlogCardComponent],
  templateUrl: './famous-blogs.component.html',
  styleUrl: './famous-blogs.component.css'
})
export class FamousBlogsComponent implements OnInit {
  private readonly blogService = inject(BlogService);

  readonly famousBlogs = signal<Blog[]>([]);

  ngOnInit(): void {
    this.blogService.getMostFamous().subscribe(blogs => this.famousBlogs.set(blogs));
  }
}
