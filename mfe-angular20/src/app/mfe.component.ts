import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'app-mfe',
  standalone: true,
  template: `
    <div class="mfe-card">
      <div class="mfe-header">Angular 20 MFE</div>
      <div class="mfe-body">
        <p class="version">Angular v{{ version }}</p>
        <p class="description">This microfrontend was built with Angular 20 and packaged as a Web Component using @angular/elements.</p>
        <div class="counter">
          <span>Counter: {{ count }}</span>
          <button (click)="increment()">+</button>
          <button (click)="decrement()">-</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mfe-card {
      border: 2px solid #3498db;
      border-radius: 8px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .mfe-header {
      background: #3498db;
      color: white;
      padding: 1rem 1.25rem;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .mfe-body {
      padding: 1.25rem;
      background: #fff;
    }
    .version {
      font-size: 1.1rem;
      font-weight: 600;
      color: #3498db;
      margin: 0 0 0.75rem;
    }
    .description {
      color: #555;
      line-height: 1.5;
      margin: 0 0 1rem;
    }
    .counter {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .counter span {
      font-size: 1.05rem;
      font-weight: 500;
    }
    .counter button {
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .counter button:hover {
      background: #2980b9;
    }
  `]
})
export class MfeComponent {
  version = VERSION.full;
  count = 0;

  increment() { this.count++; }
  decrement() { this.count--; }
}
