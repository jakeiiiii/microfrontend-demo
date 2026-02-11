import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="mfe-card">
      <div className="mfe-header">React MFE</div>
      <div className="mfe-body">
        <p className="version">React v{React.version}</p>
        <p className="description">
          This microfrontend was built with React and packaged as a Web Component
          using Webpack Module Federation.
        </p>
        <div className="counter">
          <span>Counter: {count}</span>
          <button onClick={() => setCount(c => c + 1)}>+</button>
          <button onClick={() => setCount(c => c - 1)}>-</button>
        </div>
      </div>
    </div>
  );
}
