export interface BlogCommentCreate {
  blogCommentId: number;
  blogId: number;
  content: string;
  parentBlogCommentId?: number | null;
}
