const STATIC_CACHE = 'imagens-nasa-static-v2';
const IMAGE_CACHE = 'imagens-nasa-images-v2';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/29.png',
  './icons/40.png',
  './icons/57.png',
  './icons/58.png',
  './icons/60.png',
  './icons/80.png',
  './icons/87.png',
  './icons/114.png',
  './icons/120.png',
  './icons/180.png',
  './icons/1024.png'
];

// instala e salva arquivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ativa e remove caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// intercepta requisições
self.addEventListener('fetch', event => {
  const request = event.request;

  // só trabalha com GET
  if (request.method !== 'GET') return;

  // cache para imagens
  if (request.destination === 'image') {
    event.respondWith(cacheFirstImages(request));
    return;
  }

  // cache para arquivos estáticos
  event.respondWith(cacheFirstStatic(request));
});

// estratégia cache first para estáticos
async function cacheFirstStatic(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // salva no cache estático apenas recursos da própria aplicação
    if (request.url.startsWith(self.location.origin)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Erro ao buscar recurso:', error);
    throw error;
  }
}

// estratégia cache first para imagens
async function cacheFirstImages(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // pode armazenar inclusive resposta opaque de imagens externas
    if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Erro ao buscar imagem:', error);
    throw error;
  }
}