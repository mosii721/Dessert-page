export interface Product {
    name: string;
    category: string;
    price: number;
    image: {
      thumbnail: string;
      mobile: string;
      tablet: string;
      desktop: string;
    }; 
    id?: number;
  }
  
  export interface CartItem {
    id?: number;
    productId: number;
    quantity: number;
  }