export interface Blog {
  blogId: number;
  title: string;
  content: string;
  applicationUserId: number;
  username: string;
  publishDate: string;
  updateDate: string;
  photoId?: number | null;
  /** UI only: the "Sure?" step before deleting */
  deleteConfirm?: boolean;
}
