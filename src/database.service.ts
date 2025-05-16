import type { Product, CartItem } from './product.interface'; 

export class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'ProductCartDB';
  private readonly PRODUCT_STORE = 'products';
  private readonly CART_STORE = 'cart';

  constructor() {
    this.initDatabase();
  }

  public initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized');
        const transaction = this.db!.transaction([this.CART_STORE], 'readonly');
        const store = transaction.objectStore(this.CART_STORE);
        console.log('Cart store indexes:', Array.from(store.indexNames));
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const productStore = db.createObjectStore(this.PRODUCT_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        productStore.createIndex('name', 'name', { unique: false });
        console.log('Created product store and name index');

        const cartStore = db.createObjectStore(this.CART_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        cartStore.createIndex('productId', 'productId', { unique: false });
        console.log('Created cart store and productId index');
      };
    });
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.PRODUCT_STORE], 'readwrite');
      const store = transaction.objectStore(this.PRODUCT_STORE);
      const request = store.add(product);

      request.onsuccess = () => {
        console.log('Product added:', product);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addToCart(productId: number, quantity: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.CART_STORE], 'readwrite');
      const store = transaction.objectStore(this.CART_STORE);
      const index = store.index('productId');
      const existingRequest = index.get(productId);

      existingRequest.onsuccess = () => {
        const existingItem: CartItem = existingRequest.result;
        if (existingItem) {
          existingItem.quantity += quantity;
          const updateRequest = store.put(existingItem);
          updateRequest.onsuccess = () => {
            console.log('Updated cart item:', existingItem);
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          const cartItem: CartItem = { productId, quantity };
          const addRequest = store.add(cartItem);
          addRequest.onsuccess = () => {
            console.log('Added to cart:', cartItem);
            resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      existingRequest.onerror = () => reject(existingRequest.error);
    });
  }

  async updateCartQuantity(id: number, quantity: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.CART_STORE], 'readwrite');
      const store = transaction.objectStore(this.CART_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          data.quantity = quantity;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Cart item not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromCart(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.CART_STORE], 'readwrite');
      const store = transaction.objectStore(this.CART_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.PRODUCT_STORE], 'readonly');
      const store = transaction.objectStore(this.PRODUCT_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        console.log('Retrieved products:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getCart(): Promise<CartItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.CART_STORE], 'readonly');
      const store = transaction.objectStore(this.CART_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        console.log('Retrieved cart:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      const transaction = this.db.transaction([this.CART_STORE], 'readwrite');
      const store = transaction.objectStore(this.CART_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Cart cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}