/* Workout Roulette service worker: cache the app and fonts so it works offline.
   Bump CACHE (for example to workout-roulette-v2) whenever you change index.html. */
var CACHE="workout-roulette-v1";
var CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
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
  e.respondWith(caches.match(req).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&(res.ok||res.type==="opaque")){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      return hit||(req.mode==="navigate"?caches.match("./index.html"):undefined);
    });
    return hit||net;
  }));
});
