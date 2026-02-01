import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
// import { Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import './index.css';
import {store} from './store';
import App from './App.tsx';

// const toaster = new Toaster();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            {/* <ToasterProvider toaster={toaster}> */}
            <App />
            {/* <ToasterComponent />
      </ToasterProvider> */}
        </Provider>
    </StrictMode>,
);
