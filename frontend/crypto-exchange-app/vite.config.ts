import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/crypto-exchange',
  plugins: [
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Allows using self-signed certificates to run the dev server using HTTPS.
    // https://www.npmjs.com/package/@vitejs/plugin-basic-ssl
    // basicSsl(),
  ],
  publicDir: './public',
  server: {
    // Exposes your dev server and makes it accessible for the devices in the same network.
    host: true,
    proxy: {
      '/crypto-exchange/basic_coins': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/crypto-exchange/search': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/crypto-exchange/buy': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/crypto-exchange/sell': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/crypto-exchange/transactions': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/crypto-exchange/top_transactions': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
      '/get_balance': {
        target: 'http://127.0.0.1:8080/',
        changeOrigin: true,
        secure: false,
      },
    }
  },
});

