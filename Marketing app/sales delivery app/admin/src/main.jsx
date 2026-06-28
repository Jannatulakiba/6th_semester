/**
 * Application entry point.
 * Wraps the app with required providers (Router, Auth).
 */
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';

import './index.css';
import App from './app';
import { store } from './redux/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
);