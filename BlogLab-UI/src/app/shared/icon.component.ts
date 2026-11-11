import { Component, computed, input } from '@angular/core';

const ICONS = {
  check: 'M5 13l4 4L19 7',
  plus: 'M12 5v14M5 12h14',
  pen: 'M15.2 5.2l3.6 3.6M4 20l4.5-1 10.3-10.3a2.5 2.5 0 00-3.5-3.5L5 15.5 4 20z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3',
  reply: 'M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z',
  photo: 'M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2zm8-12h.01',
  left: 'M15 19l-7-7 7-7',
  right: 'M9 5l7 7-7 7',
  close: 'M6 18L18 6M6 6l12 12',
  menu: 'M4 6h16M4 12h16M4 18h16',
  logout: 'M15 17l5-5-5-5M20 12H9M12 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7',
  grid: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  upload: 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M7 9l5-5 5 5',
  chat: 'M8 10h8M8 14h5M21 12c0 4.4-4 8-9 8-1.5 0-3-.3-4.2-.9L3 20l1.1-3.7C3.4 15 3 13.5 3 12c0-4.4 4-8 9-8s9 3.6 9 8z',
  eye: 'M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7zM12 15a3 3 0 100-6 3 3 0 000 6z',
  arrow: 'M5 12h14M13 6l6 6-6 6'
} as const;

export type IconName = keyof typeof ICONS;

/** Small inline SVG icon set (replaces Font Awesome). */
@Component({
  selector: 'app-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="d()" />
    </svg>
  `,
  host: { class: 'inline-flex shrink-0' }
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  protected readonly d = computed(() => ICONS[this.name()]);
}
