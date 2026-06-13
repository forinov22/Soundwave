export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isAdmin: boolean;
}

export type UserRole = "listener" | "artist" | "admin";
