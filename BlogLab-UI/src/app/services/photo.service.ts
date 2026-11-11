import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Photo } from '../models/photo/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.webApi}/Photo`;

  create(model: FormData): Observable<Photo> {
    return this.http.post<Photo>(this.url, model);
  }

  getByApplicationUserId(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.url);
  }

  get(photoId: number): Observable<Photo | null> {
    return this.http.get<Photo | null>(`${this.url}/${photoId}`);
  }

  delete(photoId: number): Observable<number> {
    return this.http.delete<number>(`${this.url}/${photoId}`);
  }
}
