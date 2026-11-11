import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BlogCommentCreate } from '../models/blog-comment/blog-comment-create.model';
import { BlogComment } from '../models/blog-comment/blog-comment.model';

@Injectable({ providedIn: 'root' })
export class BlogCommentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.webApi}/BlogComment`;

  create(model: BlogCommentCreate): Observable<BlogComment> {
    return this.http.post<BlogComment>(this.url, model);
  }

  delete(blogCommentId: number): Observable<number> {
    return this.http.delete<number>(`${this.url}/${blogCommentId}`);
  }

  getAll(blogId: number): Observable<BlogComment[]> {
    return this.http.get<BlogComment[]>(`${this.url}/${blogId}`);
  }
}
