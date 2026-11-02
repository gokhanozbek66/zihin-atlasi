/* Keep the app shell consistent between releases. User data lives in localStorage. */
const CACHE='zihin-atlasi-shell-v2.0.1';
const FILES=['./','./index.html','./styles.css','./core.js','./app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const SHELL=new Set(FILES.map(file=>new URL(file,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('zihin-atlasi-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const clean=new URL(event.request.url);clean.search='';clean.hash='';
  if(!SHELL.has(clean.href)&&event.request.mode!=='navigate')return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request.mode==='navigate'?'./index.html':clean.href);
    if(cached)return cached;
    try{return await fetch(event.request);}catch{return new Response('Çevrimdışısın. İlk kurulum için internete bağlan.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  }));
});
