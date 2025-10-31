export interface Product {
    ID?: number; // Gorm ID
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    
    name: string;
    description: string;
    price: number;
}