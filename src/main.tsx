import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import 'normalize.css';
import './index.css';
import App from './App';
import DataProvider from './data/DataProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Synchronous router updates keep URL-backed controlled inputs (the search bar) responsive. */}
    <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
