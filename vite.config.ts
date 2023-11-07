import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {crx, defineManifest} from '@crxjs/vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'gpt-shortcut',
  version: '1.0.0',
  action: {default_icon: 'src/assets/logo.png'},
  content_scripts: [
    {js: ['src/content/index.tsx'], matches: ['https://*/*', 'http://*/*']},
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    crx({
      manifest,
      contentScripts: {
        injectCss: false,
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: ['index.html'],
    },
    manifest: true,
  },
})
