// src/types/user.ts
export type UserRole = "admin" | "front-office" | "manager" | "housekeeping";

export interface AppUser {
  id?: string;
  username: string;
  email: string;
  avatar?: string;
  divisi?: string;
  role?: UserRole; // boleh optional dulu, karena user lama di DB mungkin belum punya
}
