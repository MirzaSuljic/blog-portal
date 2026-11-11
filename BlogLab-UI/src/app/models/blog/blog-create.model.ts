export interface BlogCreate {
  blogId: number;
  title: string;
  content: string;
  photoId?: number | null;
}
