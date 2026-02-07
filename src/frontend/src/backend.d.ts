import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    id: bigint;
    name: string;
    productCount: bigint;
    image: string;
}
export interface CartItem {
    id: bigint;
    quantity: bigint;
    variant?: bigint;
}
export interface ProductVariant {
    name: string;
    priceInPaise: bigint;
    stock: bigint;
    variantId: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    categories: Array<string>;
    inStock: boolean;
    name: string;
    createdAt: bigint;
    tags: Array<string>;
    unit: string;
    priceInPaise: bigint;
    description: string;
    volume: string;
    variants: Array<ProductVariant>;
    stock: bigint;
    brand: string;
    image: string;
    hasDealPrice: boolean;
    dealPriceInPaise?: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, image: string): Promise<bigint>;
    createProduct(name: string, description: string, priceInPaise: bigint, stock: bigint, image: string, categories: Array<string>, unit: string, brand: string, volume: string): Promise<bigint>;
    getAllCategoriesByProductCount(): Promise<Array<Category>>;
    getAllProductsByPrice(): Promise<Array<Product>>;
    getAllProductsByStock(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFilteredProductsByCategory(category: string, filter: string): Promise<Array<Product>>;
    getProduct(id: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeDemoData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(cartItems: Array<CartItem>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
