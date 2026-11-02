const CACHE='html-viewer-v3';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','screenshot-wide.png','screenshot-narrow.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE&&n!=='shared').map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method==='POST'&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{
        const f=(await r.formData()).get('file');
        if(f&&f.text){
          const c=await caches.open('shared');
          await c.put('shared-file',new Response(await f.text(),{headers:{'x-name':encodeURIComponent(f.name||'dibagikan.html')}}));
        }
      }catch(_){}
      return Response.redirect('./?shared=1',303);
    })());
    return;
  }
  if(r.method!=='GET')return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r).catch(()=>caches.match('index.html'))));
});
