export interface Photo {
  photoId: number;
  applicationUserId: number;
  imageUrl: string;
  publicId: string;
  description: string;
  publishDate: string;
  updateDate: string;
  /** UI only: the "Sure?" step before deleting */
  deleteConfirm?: boolean;
}
