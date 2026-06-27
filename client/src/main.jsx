import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './app/store';
import AppRouter from './router/AppRouter';
import { DriverAuthProvider } from './context/DriverAuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <DriverAuthProvider>
        <AppRouter />
      </DriverAuthProvider>
    </Provider>
  </React.StrictMode>
);
