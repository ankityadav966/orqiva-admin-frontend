import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'ORQIVA Tech — Admin CMS Dashboard',
  description: 'Enterprise Content Management System & Administration for ORQIVA Tech',
  icons: {
    icon: '/orqiva_tech_logo.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B1220] text-slate-100 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            toastOptions={{
              style: {
                background: '#111C2E',
                borderColor: '#1E2D4A',
                color: '#F1F5F9',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
