// src/types/Auth.ts

// This is the specific literal type for user roles
export type UserRole = 'admin' | 'user';

// This is the shape of the user object stored in the AuthContext
export interface UserState {
    id: number;
    name: string;
    role: UserRole;
}

// This is the expected response shape from the backend's /login endpoint
export interface LoginResponse {
    token: string;
    name: string;
    user_id: number;
    role: UserRole;
}