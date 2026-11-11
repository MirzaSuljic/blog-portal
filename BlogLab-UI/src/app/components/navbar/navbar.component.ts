import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { AccountService } from '../../services/account.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, InitialsPipe, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  protected readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly userMenuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.update(open => !open);
  }

  closeMenus(): void {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }

  logout(): void {
    this.closeMenus();
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}
