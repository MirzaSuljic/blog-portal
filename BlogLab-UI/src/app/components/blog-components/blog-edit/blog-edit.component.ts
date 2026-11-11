import { Component, OnInit, inject, input, numberAttribute, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Blog } from '../../../models/blog/blog.model';
import { Photo } from '../../../models/photo/photo.model';
import { BlogService } from '../../../services/blog.service';
import { PhotoService } from '../../../services/photo.service';
import { IconComponent } from '../../../shared/icon.component';
import { ToastService } from '../../../shared/toast.service';

type Field = 'title' | 'content';

@Component({
  selector: 'app-blog-edit',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './blog-edit.component.html',
  styleUrl: './blog-edit.component.css'
})
export class BlogEditComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly photoService = inject(PhotoService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Route parameter :id, -1 means a new blog. */
  readonly id = input.required({ transform: numberAttribute });

  readonly userPhotos = signal<Photo[]>([]);
  readonly blogId = signal(-1);
  readonly saving = signal(false);

  readonly blogForm = inject(FormBuilder).group({
    title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]],
    content: ['', [Validators.required, Validators.minLength(300), Validators.maxLength(5000)]],
    photoId: [null as number | null]
  });

  ngOnInit(): void {
    this.blogId.set(Number.isNaN(this.id()) ? -1 : this.id());

    this.photoService.getByApplicationUserId().subscribe(photos => this.userPhotos.set(photos));

    if (!this.isNew()) {
      this.blogService.get(this.blogId()).subscribe(blog => {
        if (blog) {
          this.updateForm(blog);
        } else {
          this.router.navigate(['/not-found']);
        }
      });
    }
  }

  isNew(): boolean {
    return this.blogId() === -1;
  }

  invalid(field: Field): boolean {
    const control = this.blogForm.controls[field];
    return control.touched && control.invalid;
  }

  valid(field: Field): boolean {
    const control = this.blogForm.controls[field];
    return control.touched && control.valid;
  }

  hasError(field: Field, error: string): boolean {
    return this.blogForm.controls[field].hasError(error);
  }

  selectedPhoto(): Photo | undefined {
    const photoId = this.blogForm.controls.photoId.value;
    return this.userPhotos().find(p => p.photoId === photoId);
  }

  selectPhoto(photoId: number | null): void {
    this.blogForm.patchValue({ photoId });
    this.blogForm.markAsDirty();
  }

  detachPhoto(): void {
    this.blogForm.patchValue({ photoId: null });
    this.blogForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    const { title, content, photoId } = this.blogForm.getRawValue();
    this.saving.set(true);

    this.blogService
      .create({ blogId: this.blogId(), title: title ?? '', content: content ?? '', photoId })
      .subscribe({
        next: saved => {
          const wasNew = this.isNew();
          this.updateForm(saved);
          this.saving.set(false);
          this.toast.success('Blog saved.');
          if (wasNew) {
            this.router.navigate(['/dashboard', saved.blogId], { replaceUrl: true });
          }
        },
        error: () => this.saving.set(false)
      });
  }

  private updateForm(blog: Blog): void {
    this.blogId.set(blog.blogId);
    this.blogForm.reset({
      title: blog.title,
      content: blog.content,
      photoId: blog.photoId ?? null
    });
  }
}
