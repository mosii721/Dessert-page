export interface Product {
  name: string;
  category: string;
  price: number;
  image: string;
  id?: number;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
}