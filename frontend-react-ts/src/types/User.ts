// src/types/User.ts
export interface User {
    ID: number; // Note: The Go backend sends 'ID' in uppercase
    Name: string;
    Email: string;
    Role: 'admin' | 'user';
}