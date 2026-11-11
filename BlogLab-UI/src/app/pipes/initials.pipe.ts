import { Pipe, PipeTransform } from '@angular/core';

/** "john.doe" -> "JD", "Mirza" -> "MI" */
@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.trim().slice(0, 2);
    return letters.toUpperCase();
  }
}
