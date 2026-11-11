import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BlogCreate } from '../models/blog/blog-create.model';
import { BlogPaging } from '../models/blog/blog-paging.model';
import { Blog } from '../models/blog/blog.model';
import { PagedResult } from '../models/blog/paged-result.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.webApi}/Blog`;

  create(model: BlogCreate): Observable<Blog> {
    return this.http.post<Blog>(this.url, model);
  }

  getAll(paging: BlogPaging): Observable<PagedResult<Blog>> {
    const params = new HttpParams().set('Page', paging.page).set('PageSize', paging.pageSize);
    return this.http.get<PagedResult<Blog>>(this.url, { params });
  }

  get(blogId: number): Observable<Blog | null> {
    return this.http.get<Blog | null>(`${this.url}/${blogId}`);
  }

  getByApplicationUserId(applicationUserId: number): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.url}/user/${applicationUserId}`);
  }

  getMostFamous(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.url}/famous`);
  }

  delete(blogId: number): Observable<number> {
    return this.http.delete<number>(`${this.url}/${blogId}`);
  }
}
