import { Component, VERSION } from '@angular/core';

@Component({
  selector: 'app-mfe',
  standalone: true,
  template: `
    <div class="mfe-card">
      <div class="mfe-header">Angular 20 MFE C</div>
      <div class="mfe-body">
        <p class="version">Angular v{{ version }}</p>
        <p class="description">Third Angular 20 MFE. Shares the entire Angular 20 framework with MFE A &amp; B via Native Federation — only app code is unique.</p>
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
      border: 2px solid #1abc9c;
      border-radius: 8px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .mfe-header {
      background: #1abc9c;
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
      color: #1abc9c;
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
      background: #1abc9c;
      color: white;
      border: none;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .counter button:hover {
      background: #16a085;
    }
  `]
})
export class MfeComponent {
  version = VERSION.full;
  count = 0;

  increment() { this.count++; }
  decrement() { this.count--; }
}
