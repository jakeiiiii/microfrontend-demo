import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'app-mfe',
  template: `
    <div class="mfe-card">
      <div class="mfe-header">Angular 14 MFE B</div>
      <div class="mfe-body">
        <p class="version">Angular v{{ version }}</p>
        <p class="description">This is the second Angular 14 microfrontend. It shares the Angular 14 framework with MFE A via Webpack Module Federation.</p>
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
      border: 2px solid #e67e22;
      border-radius: 8px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .mfe-header {
      background: #e67e22;
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
      color: #e67e22;
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
      background: #e67e22;
      color: white;
      border: none;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .counter button:hover {
      background: #d35400;
    }
  `]
})
export class MfeComponent {
  version = VERSION.full;
  count = 0;

  increment() { this.count++; }
  decrement() { this.count--; }
}
