import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { IconComponent } from '../../shared/icon.component';
import { FamousBlogsComponent } from '../blog-components/famous-blogs/famous-blogs.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RegisterComponent, FamousBlogsComponent, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  protected readonly accountService = inject(AccountService);

  readonly points = [
    { title: 'Ready in seconds', text: 'Simple registration, and you are logged in right away.' },
    { title: 'Build connections', text: 'Talk with other authors in threaded comments under every blog.' },
    { title: 'Get featured', text: 'The most discussed blogs land right here on the home page.' }
  ];
}
