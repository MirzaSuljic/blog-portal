export interface BlogComment {
  blogCommentId: number;
  blogId: number;
  content: string;
  username: string;
  applicationUserId: number;
  publishDate: string;
  updateDate: string;
  parentBlogCommentId?: number | null;
}
