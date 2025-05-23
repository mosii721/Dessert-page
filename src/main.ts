import './style.css';
import productsData from './data.json';
import { DatabaseService } from './database.service';


async function initializeApp() {
  const db = new DatabaseService();
  await db.initDatabase();
  const existingProducts = await db.getAllProducts();
  if (existingProducts.length === 0) {
    for (const product of productsData) {
      const imagePath = product.image.desktop;
      await db.addProduct({
        name: product.name,
        category: product.category,
        price: product.price,
        image: imagePath
      });
    }
  }

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Desserts</h1>
    <div class="container">
      <div>
        <div id="productsList"></div>
      </div>
      <div class="cart">
        <h2>Your Cart</h2>
        <div id="cartItems"></div>
        <p id="cartTotal">Order Total: $0.00</p>
        <button id="confirmOrder" disabled>Confirm Order</button>
      </div>
    </div>
    <div id="modal" class="modal" style="display: none;">
      <div class="modal-content">
        <h2>Order Confirmed</h2>
        <div id="modalItems" class="modal-items"></div>
        <p id="modalTotal"></p>
        <button id="startNewOrder">Start New Order</button>
      </div>
    </div>
  `;

  async function displayProductsAndCart() {
    const productsList = document.querySelector('#productsList')!;
    const cartItemsDiv = document.querySelector('#cartItems')!;
    const cartTotal = document.querySelector('#cartTotal')!;
    const confirmButton = document.querySelector('#confirmOrder')! as HTMLButtonElement;
    const products = await db.getAllProducts();
    const cart = await db.getCart();
    products.forEach(product => {
      console.log(`Product: ${product.name}, Image path: ${product.image}`);
    });
    productsList.innerHTML = products
      .map((product) => {
        const cartItem = cart.find(item => item.productId === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        return `
          <div class="product-card" id="product-${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-button" >
            ${
              quantity > 0
                ? `
                  <div class="quantity-controls">
                    <button onclick="decreaseQuantity(${cartItem!.id})">-</button>
                    <span>${quantity}</span>
                    <button onclick="increaseQuantity(${cartItem!.id})">+</button>
                  </div>
                `
                : `<button onclick="addToCart(${product.id})"  class="product-button1">Add to Cart</button>`
            }
            </div>
             <p> ${product.category}</p>
            <h3>${product.name}</h3>
            <p> <span>$${product.price.toFixed(2)}</span></p>
          </div>
        `;
      })
      .join('');
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<img src="/assets/illustration-empty-cart.svg" alt="cart is not available" class="product-image"/><h2>Your added items will appear here</h2>';
      confirmButton.disabled = true;
    } else {
      cartItemsDiv.innerHTML = await Promise.all(
        cart.map(async (item) => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return '';
          return `
            <div class="cart-item" id="cart-${item.id}">
            <div>
              <h3>${product.name}</h3>
              <p> <span>${item.quantity}x</span>  @$${product.price.toFixed(2)}  $${(product.price * item.quantity).toFixed(2)}</p>
              </div>
              <div class="cart-action">
                <button onclick="removeFromCart(${item.id})">x</button>
              </div>
            </div>
          `;
        })
      ).then(items => items.join(''));
      confirmButton.disabled = false;
    }
    const total = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }

  async function showConfirmationModal() {
    const modal = document.querySelector('#modal')! as HTMLElement;
    const modalItems = document.querySelector('#modalItems')!;
    const modalTotal = document.querySelector('#modalTotal')!;
    const products = await db.getAllProducts();
    const cart = await db.getCart();

    modalItems.innerHTML = cart.map((item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        return `
          <div>
            <img src="${product.image}" alt="${product.name}">
            <p>${product.name} </br> ${item.quantity}x   $${product.price }</p>
            <span>$${(product.price * item.quantity).toFixed(2)}</span>
          </div>
        `;
      })
      .join('');
    const total = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    modalTotal.textContent = `Total: $${total.toFixed(2)}`;
    modal.classList.add('modal-visible');
    modal.style.display = 'flex';
    (document.querySelector('#startNewOrder') as HTMLElement)?.focus();
  }

  window.addToCart = async (productId: number) => {
    console.log('Add to cart clicked, productId:', productId);
    await db.addToCart(productId);
    await displayProductsAndCart();
  };

  window.increaseQuantity = async (id: number) => {
    console.log('Increase quantity, cartId:', id);
    const cart = await db.getCart();
    const item = cart.find(item => item.id === id);
    if (item) {
      await db.updateCartQuantity(id, item.quantity + 1);
      await displayProductsAndCart();
    }
  };

  window.decreaseQuantity = async (id: number) => {
    console.log('Decrease quantity, cartId:', id);
    const cart = await db.getCart();
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
      await db.updateCartQuantity(id, item.quantity - 1);
    } else {
      await db.removeFromCart(id);
    }
    await displayProductsAndCart();
  };

  window.removeFromCart = async (id: number) => {
    console.log('Remove from cart, cartId:', id);
    await db.removeFromCart(id);
    await displayProductsAndCart();
  };

  document.querySelector('#confirmOrder')?.addEventListener('click', async () => {
    await showConfirmationModal();
  });

  document.querySelector('#startNewOrder')?.addEventListener('click', async () => {
    await db.clearCart();
    const modal = document.querySelector('#modal')! as HTMLElement;
    modal.style.display = 'none';
    await displayProductsAndCart();
  });

  await displayProductsAndCart();
}

declare global {
  interface Window {
    addToCart: (productId: number) => Promise<void>;
    increaseQuantity: (id: number) => Promise<void>;
    decreaseQuantity: (id: number) => Promise<void>;
    removeFromCart: (id: number) => Promise<void>;
  }
}

initializeApp().catch(console.error);