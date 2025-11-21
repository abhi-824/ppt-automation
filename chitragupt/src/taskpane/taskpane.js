import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

Office.onReady(() => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
