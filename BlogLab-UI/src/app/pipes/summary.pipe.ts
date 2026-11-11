import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'summary' })
export class SummaryPipe implements PipeTransform {
  transform(content: string | null | undefined, characterLimit: number): string {
    if (!content) return '';
    return content.length <= characterLimit ? content : `${content.substring(0, characterLimit)}...`;
  }
}
