import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogCommentViewModel } from '../../../models/blog-comment/blog-comment-view-model.model';
import { BlogComment } from '../../../models/blog-comment/blog-comment.model';
import { InitialsPipe } from '../../../pipes/initials.pipe';
import { AccountService } from '../../../services/account.service';
import { BlogCommentService } from '../../../services/blog-comment.service';
import { CommentBoxComponent } from '../comment-box/comment-box.component';
import { CommentsComponent } from '../comments/comments.component';

export function toViewModel(comment: BlogComment, extra: Partial<BlogCommentViewModel> = {}): BlogCommentViewModel {
  return {
    parentBlogCommentId: comment.parentBlogCommentId ?? null,
    blogCommentId: comment.blogCommentId,
    blogId: comment.blogId,
    content: comment.content,
    username: comment.username,
    publishDate: comment.publishDate,
    updateDate: comment.updateDate,
    isEditable: false,
    deleteConfirm: false,
    isReplying: false,
    comments: [],
    ...extra
  };
}

@Component({
  selector: 'app-comment-system',
  imports: [RouterLink, InitialsPipe, CommentBoxComponent, CommentsComponent],
  templateUrl: './comment-system.component.html',
  styleUrl: './comment-system.component.css'
})
export class CommentSystemComponent implements OnInit {
  private readonly blogCommentService = inject(BlogCommentService);
  protected readonly accountService = inject(AccountService);

  readonly blogId = input.required<number>();

  readonly standAloneComment = signal<BlogCommentViewModel | null>(null);
  readonly commentTree = signal<BlogCommentViewModel[] | null>(null);
  readonly total = signal(0);

  ngOnInit(): void {
    this.resetStandAloneComment();

    this.blogCommentService.getAll(this.blogId()).subscribe(comments => {
      this.total.set(comments.length);
      this.commentTree.set(this.buildTree(comments));
    });
  }

  onCommentSaved(saved: BlogComment): void {
    this.commentTree.update(tree => [toViewModel(saved), ...(tree ?? [])]);
    this.total.update(n => n + 1);
    this.resetStandAloneComment();
  }

  private resetStandAloneComment(): void {
    const user = this.accountService.currentUserValue;
    this.standAloneComment.set(
      user
        ? {
            parentBlogCommentId: null,
            content: '',
            blogId: this.blogId(),
            blogCommentId: -1,
            username: user.username,
            publishDate: null,
            updateDate: null,
            isEditable: false,
            deleteConfirm: false,
            isReplying: false,
            comments: []
          }
        : null
    );
  }

  /** Nests replies under their parent comment. */
  private buildTree(comments: BlogComment[]): BlogCommentViewModel[] {
    const byId = new Map<number, BlogCommentViewModel>();
    comments.forEach(c => byId.set(c.blogCommentId, toViewModel(c)));

    const roots: BlogCommentViewModel[] = [];
    for (const vm of byId.values()) {
      const parent = vm.parentBlogCommentId ? byId.get(vm.parentBlogCommentId) : undefined;
      (parent ? parent.comments : roots).push(vm);
    }
    return roots;
  }
}
