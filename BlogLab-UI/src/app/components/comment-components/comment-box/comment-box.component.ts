import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogCommentViewModel } from '../../../models/blog-comment/blog-comment-view-model.model';
import { BlogComment } from '../../../models/blog-comment/blog-comment.model';
import { BlogCommentService } from '../../../services/blog-comment.service';
import { ToastService } from '../../../shared/toast.service';

@Component({
  selector: 'app-comment-box',
  imports: [FormsModule],
  templateUrl: './comment-box.component.html',
  styleUrl: './comment-box.component.css'
})
export class CommentBoxComponent implements OnInit {
  private readonly blogCommentService = inject(BlogCommentService);
  private readonly toast = inject(ToastService);

  readonly comment = input.required<BlogCommentViewModel>();
  /** Show a Cancel button (used when editing or replying). */
  readonly cancellable = input(false);

  readonly commentSaved = output<BlogComment>();
  readonly cancelled = output<void>();

  readonly saving = signal(false);
  text = '';

  ngOnInit(): void {
    this.text = this.comment().content ?? '';
  }

  onSubmit(): void {
    const comment = this.comment();
    this.saving.set(true);

    this.blogCommentService
      .create({
        blogCommentId: comment.blogCommentId,
        parentBlogCommentId: comment.parentBlogCommentId,
        blogId: comment.blogId,
        content: this.text.trim()
      })
      .subscribe({
        next: saved => {
          this.saving.set(false);
          this.toast.success('Comment saved.');
          this.text = '';
          this.commentSaved.emit(saved);
        },
        error: () => this.saving.set(false)
      });
  }
}
