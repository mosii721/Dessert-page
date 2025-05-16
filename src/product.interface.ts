export interface Product {
  name: string;
  category: string;
  price: number;
  image: string; // CHANGE: Set to string to match IndexedDB
  id?: number;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
}