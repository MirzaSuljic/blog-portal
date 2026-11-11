import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { BlogCommentViewModel } from '../../../models/blog-comment/blog-comment-view-model.model';
import { BlogComment } from '../../../models/blog-comment/blog-comment.model';
import { InitialsPipe } from '../../../pipes/initials.pipe';
import { AccountService } from '../../../services/account.service';
import { BlogCommentService } from '../../../services/blog-comment.service';
import { IconComponent } from '../../../shared/icon.component';
import { ToastService } from '../../../shared/toast.service';
import { CommentBoxComponent } from '../comment-box/comment-box.component';

@Component({
  selector: 'app-comments',
  imports: [DatePipe, InitialsPipe, IconComponent, CommentBoxComponent],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {
  protected readonly accountService = inject(AccountService);
  private readonly blogCommentService = inject(BlogCommentService);
  private readonly toast = inject(ToastService);

  readonly comments = input.required<BlogCommentViewModel[]>();

  isOwn(comment: BlogCommentViewModel): boolean {
    return this.accountService.givenUserIsLoggedIn(comment.username);
  }

  deleteConfirmed(comment: BlogCommentViewModel): void {
    this.blogCommentService.delete(comment.blogCommentId).subscribe(() => {
      this.remove(comment);
      this.toast.info('Comment deleted.');
    });
  }

  replyComment(comment: BlogCommentViewModel): void {
    const user = this.accountService.currentUserValue;
    if (!user) return;

    comment.comments.push({
      parentBlogCommentId: comment.blogCommentId,
      content: '',
      blogId: comment.blogId,
      blogCommentId: -1,
      username: user.username,
      publishDate: null,
      updateDate: null,
      isEditable: false,
      deleteConfirm: false,
      isReplying: true,
      comments: []
    });
  }

  cancelEdit(comment: BlogCommentViewModel): void {
    if (comment.blogCommentId === -1) {
      // an unsaved reply: just drop it
      this.remove(comment);
    } else {
      comment.isEditable = false;
      comment.isReplying = false;
    }
  }

  onCommentSaved(saved: BlogComment, comment: BlogCommentViewModel): void {
    comment.blogCommentId = saved.blogCommentId;
    comment.parentBlogCommentId = saved.parentBlogCommentId ?? null;
    comment.blogId = saved.blogId;
    comment.content = saved.content;
    comment.publishDate = saved.publishDate;
    comment.updateDate = saved.updateDate;
    comment.username = saved.username;
    comment.isEditable = false;
    comment.isReplying = false;
  }

  private remove(comment: BlogCommentViewModel): void {
    const list = this.comments();
    const index = list.indexOf(comment);
    if (index > -1) {
      list.splice(index, 1);
    }
  }
}
