import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    action: {},
    permissions: ["activeTab", "sidePanel", "storage", ],
    name: 'microLMS',
    description: "関大LMSの課題をわかりやすく",
    version: "1.0.0",
    web_accessible_resources: [
      {
        "matches": ["*://kulms.tl.kansai-u.ac.jp/*"],
        "resources": ["/font/*","/assets/*"]
      }
    ],
  },
});
