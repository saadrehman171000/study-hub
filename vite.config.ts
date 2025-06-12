import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject environment variables directly as string literals
    'import.meta.env.VITE_API_URL': JSON.stringify('https://study-hub-qez6.onrender.com/api'),
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify('pk_test_Y2xvc2luZy1oeWVuYS02Mi5jbGVyay5hY2NvdW50cy5kZXYk'),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
