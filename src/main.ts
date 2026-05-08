import { Component, Injectable, signal, EventEmitter, computed, effect, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

// --- Types ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

// --- Service (State Management) ---
@Injectable({ providedIn: 'root' })
export class CartService {
  // Writable signal for private state
  private cartItems = signal<Product[]>([]);

  // Computed signals for derived state (Reactive UI)
  cartCount = computed(() => this.cartItems().length);
  totalPrice = computed(() => this.cartItems().reduce((acc, curr) => acc + curr.price, 0));

  constructor() {
    // Effect for logging or local storage sync
    effect(() => {
      console.log(`Cart updated: ${this.cartCount()} items, Total: $${this.totalPrice()}`);
    });
  }

  addToCart(product: Product) {
    this.cartItems.update((items) => [...items, product]);
  }

  removeFromCart(productId: number) {
    this.cartItems.update((items) => items.filter((p) => p.id !== productId));
  }

  getCart() {
    return this.cartItems.asReadonly();
  }
}

// --- Child Component: Product Card ---
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <img [src]="product.image" [alt]="product.name">
      <div class="card-body">
        <h3>{{ product.name }}</h3>
        <p class="price">{{ product.price | currency }}</p>
        <button (click)="onAdd.emit(product)">Add to Cart</button>
      </div>
    </div>
  `,
  styles: [`
    .card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; transition: transform 0.2s; }
    .card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    img { width: 100%; height: 150px; object-fit: cover; }
    .card-body { padding: 1rem; text-align: center; }
    .price { font-weight: bold; color: #2c3e50; margin: 0.5rem 0; }
    button { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; width: 100%; }
    button:hover { background: #0056b3; }
  `],
  inputs: ['product'],
  outputs: ['onAdd']
})
export class ProductCardComponent {
  product!: Product;
  onAdd = new (EventEmitter)<Product>();
}

// --- Main App Component ---
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <header class="sticky-header">
      <div class="container header-content">
        <h1>TechStore</h1>
        <div class="cart-badge">
          🛒 <span>{{ cartService.cartCount() }}</span>
        </div>
      </div>
    </header>

    <main class="container">
      <section class="hero">
        <h2>Featured Products</h2>
        <p>Total Value in Cart: {{ cartService.totalPrice() | currency }}</p>
      </section>

      <div class="product-grid">
        <app-product-card 
          *ngFor="let item of products" 
          [product]="item"
          (onAdd)="cartService.addToCart($event)">
        </app-product-card>
      </div>
    </main>
  `,
  styles: [`
    :host { font-family: sans-serif; display: block; background: #f8f9fa; min-height: 100vh; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 1rem; }
    .sticky-header { 
      position: sticky; top: 0; background: #333; color: white; 
      padding: 1rem 0; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .cart-badge { background: #ff4757; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; }
    .hero { padding: 2rem 0; text-align: center; }
    .product-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
      gap: 1.5rem; 
      padding-bottom: 3rem;
    }
  `]
})
export class App implements OnInit {
  products: Product[] = [];

  constructor(public cartService: CartService) {}

  ngOnInit() {
    // Mock Load
    this.products = [
      { id: 1, name: 'Wireless Headphones', price: 99, image: 'https://picsum.photos/id/21/300/200' },
      { id: 2, name: 'Smart Watch', price: 199, image: 'https://picsum.photos/id/48/300/200' },
      { id: 3, name: 'Mechanical Keyboard', price: 150, image: 'https://picsum.photos/id/160/300/200' },
      { id: 4, name: 'Gaming Mouse', price: 50, image: 'https://picsum.photos/id/180/300/200' },
      { id: 5, name: 'Portable SSD', price: 120, image: 'https://picsum.photos/id/250/300/200' },
      { id: 6, name: 'Monitor Arm', price: 80, image: 'https://picsum.photos/id/350/300/200' },
    ];
  }
}

bootstrapApplication(App);