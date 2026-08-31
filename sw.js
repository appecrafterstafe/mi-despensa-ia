// Service Worker básico: cachea el "cascarón" de la app para que abra
// aunque no haya conexión momentánea, y para cumplir el requisito de
// Google Play de tener funcionalidad mínima offline en apps TWA.

const CACHE_NOMBRE = "almacen-familiar-v2";
const ARCHIVOS_BASE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NOMBRE).then((cache) => cache.addAll(ARCHIVOS_BASE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== CACHE_NOMBRE)
          .map((clave) => caches.delete(clave))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: red primero, y si falla (sin conexión), usamos la copia en caché.
// Así los datos del inventario (que vienen de la red/Supabase) siempre están
// actualizados cuando hay conexión, pero la app abre igual sin internet.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NOMBRE).then((cache) => cache.put(event.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});
