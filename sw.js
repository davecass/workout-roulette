/* Workout Roulette service worker: keeps the app working offline.
   The app page is fetched from the network first so updates show up as soon as you are online,
   and the saved copy is used only when you are offline. Bump CACHE whenever you change index.html. */
var CACHE="workout-roulette-v11";
var CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(CORE.map(function(u){return new Request(u,{cache:"reload"});}));
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET") return;
  var url=new URL(req.url);
  var isFont=url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com";
  if(url.origin!==location.origin&&!isFont) return;
  var isPage=req.mode==="navigate"||/\/$/.test(url.pathname)||/index\.html$/.test(url.pathname)||/manifest\.webmanifest$/.test(url.pathname);
  if(isPage){
    e.respondWith(
      fetch(new Request(req.url,{cache:"no-store",credentials:"same-origin"})).then(function(res){
        if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
        return res;
      }).catch(function(){
        return caches.match(req).then(function(hit){return hit||caches.match("./index.html");});
      })
    );
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&(res.ok||res.type==="opaque")){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){return hit;});
    return hit||net;
  }));
});
