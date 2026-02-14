
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Vercel 빌드 환경의 API_KEY를 브라우저의 process.env.API_KEY로 주입합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
