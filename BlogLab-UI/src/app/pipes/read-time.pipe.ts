import { Pipe, PipeTransform } from '@angular/core';

/** Estimated reading time, e.g. "3 min read". */
@Pipe({ name: 'readTime' })
export class ReadTimePipe implements PipeTransform {
  transform(content: string | null | undefined): string {
    const words = content ? content.trim().split(/\s+/).length : 0;
    return `${Math.max(1, Math.round(words / 200))} min read`;
  }
}
