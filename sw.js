const CACHE='cath-lab-tracker-pwa-v2';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const k of await caches.keys()){if(k!==CACHE)await caches.delete(k)}await self.clients.claim()})())});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;event.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(event.request);if(hit)return hit;try{const r=await fetch(event.request);if(r.ok)c.put(event.request,r.clone());return r}catch(e){return c.match('./index.html')}})())});
