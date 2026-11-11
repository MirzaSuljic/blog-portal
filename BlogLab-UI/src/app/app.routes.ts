import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'blogs', loadComponent: () => import('./components/blog-components/blogs/blogs.component').then(m => m.BlogsComponent) },
  { path: 'blogs/:id', loadComponent: () => import('./components/blog-components/blog/blog.component').then(m => m.BlogComponent) },
  {
    path: 'photo-album',
    canActivate: [authGuard],
    loadComponent: () => import('./components/photo-album/photo-album.component').then(m => m.PhotoAlbumComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/blog-components/blog-edit/blog-edit.component').then(m => m.BlogEditComponent)
  },
  { path: 'not-found', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) },
  { path: '**', redirectTo: '/not-found' }
];
