// src/types/User.ts
export type UserRole = 'admin' | 'user';

export interface User {
    ID: number; // Note: The Go backend sends 'ID' in uppercase
    Name: string;
    Email: string;
    Role: UserRole;
}