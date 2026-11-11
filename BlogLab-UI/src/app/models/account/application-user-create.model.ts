export interface ApplicationUserCreate {
  username: string;
  password: string;
  email: string;
  fullname?: string | null;
}
