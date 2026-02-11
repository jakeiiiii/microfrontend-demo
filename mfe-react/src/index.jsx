import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class MfeReactElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this);
    root.render(React.createElement(App));
  }
}

if (!customElements.get('mfe-react')) {
  customElements.define('mfe-react', MfeReactElement);
}
