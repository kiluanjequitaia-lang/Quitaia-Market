export type Category = { id: string; name: string; icon?: string | null };
export type ProductStatus = 'active' | 'paused' | 'sold' | 'deleted';
export type Product = { id: string; title: string; description: string | null; price: number; category_id: string; status: ProductStatus; created_at: string; seller_id: string; city: string | null; whatsapp_phone?: string | null; product_images?: { id: string; storage_path: string; position: number }[] };
