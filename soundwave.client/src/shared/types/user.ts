export interface User {
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
};

export type UserRole = "listener" | "artist";
