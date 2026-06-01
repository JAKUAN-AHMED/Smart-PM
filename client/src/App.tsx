import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        containerClassName="toast-container"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            fontWeight: 500,
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  );
}
