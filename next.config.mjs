// ============= next.config.mjs =============
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    
    // PWA Configuration
    headers: async () => {
      return [
        {
          source: '/manifest.json',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/manifest+json',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/sw.js',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/javascript; charset=utf-8',
            },
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
            {
              key: 'Service-Worker-Allowed',
              value: '/',
            },
          ],
        },
      ];
    },
  
    // Webpack config for PWA
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    },
  };
  
  export default nextConfig;
  
  // ============= Instructions for full setup =============
  /*
  
  1. INSTALL REQUIRED PACKAGES:
     npm install next-pwa
     
     OR use the configuration above without next-pwa for manual setup.
  
  2. CREATE SERVICE WORKER (public/sw.js):
     Copy the service worker code from the previous artifact.
  
  3. CREATE MANIFEST (public/manifest.json):
     Copy the manifest configuration from the previous artifact.
  
  4. CREATE ICON ASSETS:
     Generate the following icon files in your /public directory:
     - icon-192.png (192x192)
     - icon-512.png (512x512)
     - icon-maskable-192.png (192x192 with safe zone)
     - icon-maskable-512.png (512x512 with safe zone)
     
     You can use tools like:
     - https://www.pwabuilder.com/imageGenerator
     - https://realfavicongenerator.net/
  
  5. UPDATE _app.tsx or layout.tsx:
     Add the PWAGate component as shown in the previous artifact.
  
  6. TEST PWA INSTALLATION:
     - Chrome: DevTools > Application > Manifest
     - Safari: Web Inspector > Storage > Manifest
     - Firefox: DevTools > Application > Manifest
  
  7. DEPLOY:
     - PWAs require HTTPS (except localhost)
     - Ensure your domain has a valid SSL certificate
     - Deploy manifest.json and sw.js at the root
  
  8. VERIFY:
     - Use Lighthouse in Chrome DevTools
     - Check all PWA criteria are met
     - Test installation on mobile devices
  
  9. HANDLE DEEP LINKS (Optional):
     Add to manifest.json:
     {
       "share_target": {
         "action": "/share",
         "method": "POST",
         "enctype": "multipart/form-data",
         "params": {
           "title": "title",
           "text": "text",
           "url": "url"
         }
       }
     }
  
  10. ADD OFFLINE SUPPORT:
      Update sw.js to handle offline scenarios:
      - Cache API responses
      - Serve cached content when offline
      - Show offline page when needed
  */