export interface BlogCommentViewModel {
  parentBlogCommentId: number | null;
  blogCommentId: number;
  blogId: number;
  content: string;
  username: string;
  publishDate: string | null;
  updateDate: string | null;
  isEditable: boolean;
  deleteConfirm: boolean;
  isReplying: boolean;
  comments: BlogCommentViewModel[];
}
