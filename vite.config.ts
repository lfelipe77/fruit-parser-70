import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: mode === 'development' ? {
      // TODO: CSP can be temporarily loosened for debugging by adding more to connect-src:
      // connect-src * ws: wss: https://*.supabase.co https://*.functions.supabase.co https://challenges.cloudflare.com blob: data:
      // frame-src https://challenges.cloudflare.com
      // script-src 'self' https://challenges.cloudflare.com 'unsafe-eval' 'unsafe-inline'
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://www.gstatic.com https://www.recaptcha.net; style-src 'self' 'unsafe-inline'; img-src * data: blob:; connect-src * ws: wss:; frame-ancestors *; object-src 'none'; base-uri 'self';",
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-XSS-Protection': '1; mode=block',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    } : {},
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // Strip console.debug in production builds
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.debug'] : [],
      },
    },
  },
}));
