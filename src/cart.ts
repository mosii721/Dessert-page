import type { Product,CartItem } from "./product.interface";

export class CartService {
    private cart: CartItem[] = [];

    addToCart (product:Product):void{
        const existingItem = this.cart.find(item => item.product.name === product.name);

        if(existingItem){
            existingItem.quantity +=1;
        } else {
            this.cart.push({product,quantity:1});
        }
        console.log('Cart updated:',this.cart);
    }

    removeFromCart(productName:string):void{
        this.cart = this.cart.filter(item => item.product.name !== productName);
        console.log('updated',this.cart)
    }

    updateQuantity
}