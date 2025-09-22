const CACHE_NAME = 'nexanotes-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',

  // App source files
  './index.tsx',
  './App.tsx',
  './types.ts',
  './styles/themes.ts',
  './services/backstage.ts',
  './services/geminiService.ts',
  './components/AdminDashboard.tsx',
  './components/Auth.tsx',
  './components/CustomCursor.tsx',
  './components/DiscussionPage.tsx',
  './components/GifPickerModal.tsx',
  './components/HomePage.tsx',
  './components/MarkdownHelpModal.tsx',
  './components/NoteEditor.tsx',
  './components/NoteList.tsx',
  './components/ProfilePage.tsx',
  './components/SettingsModal.tsx',
  './components/ShareModal.tsx',
  './components/SharedNoteViewer.tsx',
  './components/Sidebar.tsx',
  './components/TopBar.tsx',
  './components/UserAvatar.tsx',

  // Caching key CDN dependencies for robustness
  'https://unpkg.com/@babel/standalone@7.24.7/babel.min.js',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/@google/genai@^1.20.0',
  'https://aistudiocdn.com/marked@^16.3.0',
  'https://aistudiocdn.com/emoji-picker-element@^1.27.0'
];

// On install, cache the core app shell files.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache and caching app shell with dependencies');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

// On activate, clean up old, unused caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!cacheWhitelist.includes(cacheName)) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim()) // Take control of all open clients.
  );
});

// On fetch, use a cache-first strategy to serve assets.
self.addEventListener('fetch', event => {
  // Let the browser handle non-GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Use a cache-first strategy for all GET requests.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If we have a cached response, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not, fetch from the network.
      return fetch(event.request).then(networkResponse => {
        // Only cache valid, successful responses.
        // This includes our same-origin files and the CDN resources.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(error => {
        // This catch handles exceptions from fetch, such as when the network is down.
        console.error('Fetch failed:', error);
        // We could return a custom offline page here if one was cached.
    })
  );
});