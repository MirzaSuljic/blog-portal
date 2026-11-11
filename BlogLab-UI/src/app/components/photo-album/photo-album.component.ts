import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Photo } from '../../models/photo/photo.model';
import { PhotoService } from '../../services/photo.service';
import { IconComponent } from '../../shared/icon.component';
import { ToastService } from '../../shared/toast.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-photo-album',
  imports: [FormsModule, IconComponent],
  templateUrl: './photo-album.component.html',
  styleUrl: './photo-album.component.css'
})
export class PhotoAlbumComponent implements OnInit {
  private readonly photoService = inject(PhotoService);
  private readonly toast = inject(ToastService);

  private readonly photoForm = viewChild.required<NgForm>('photoForm');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('photoUploadElement');

  readonly photos = signal<Photo[]>([]);
  readonly current = signal(0);
  readonly uploading = signal(false);
  readonly deleteConfirm = signal(false);

  photoFile: File | null = null;
  previewUrl: string | null = null;
  newPhotoDescription = '';

  ngOnInit(): void {
    this.photoService.getByApplicationUserId().subscribe(photos => this.photos.set(photos));
  }

  prev(): void {
    const count = this.photos().length;
    this.deleteConfirm.set(false);
    this.current.update(i => (i - 1 + count) % count);
  }

  next(): void {
    const count = this.photos().length;
    this.deleteConfirm.set(false);
    this.current.update(i => (i + 1) % count);
  }

  goTo(index: number): void {
    this.deleteConfirm.set(false);
    this.current.set(index);
  }

  deleteConfirmed(photo: Photo): void {
    this.photoService.delete(photo.photoId).subscribe(() => {
      this.photos.update(list => list.filter(p => p.photoId !== photo.photoId));
      this.current.update(i => Math.max(0, Math.min(i, this.photos().length - 1)));
      this.deleteConfirm.set(false);
      this.toast.info('Photo deleted.');
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    if (file && file.size > MAX_FILE_SIZE) {
      this.toast.error('The photo is larger than 10 MB.');
      this.fileInput().nativeElement.value = '';
      this.photoFile = null;
      this.setPreview(null);
      return;
    }

    this.photoFile = file;
    this.setPreview(file);
  }

  private setPreview(file: File | null): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  onSubmit(): void {
    if (!this.photoFile) return;

    const formData = new FormData();
    // The API stores the file name as the photo description.
    formData.append('file', this.photoFile, this.newPhotoDescription.trim());

    this.uploading.set(true);
    this.photoService.create(formData).subscribe({
      next: created => {
        this.photoForm().resetForm();
        this.fileInput().nativeElement.value = '';
        this.photoFile = null;
        this.setPreview(null);
        this.uploading.set(false);

        this.photos.update(list => [created, ...list]);
        this.current.set(0);
        this.toast.success('Photo uploaded.');
      },
      error: () => this.uploading.set(false)
    });
  }
}
