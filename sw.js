const CACHE_NAME = "v2"
const staticFiles = [
    "/",
    "/index.html",
    "/style.css",
    "/main.js",
    "/page2.html",
]

self.addEventListener("install", (e) => {
    let cacheReady = caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(staticFiles)
    })
    e.waitUntil(cacheReady)
    console.log("Service Worker Installed")
})

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((cacheName) => {
                    if(cacheName !== CACHE_NAME){
                        return caches.delete(cacheName)
                    }
                })
            )
        }).catch((err) => console.log(err))

    )
})
self.addEventListener("fetch", (e) => { 
    // if (!e.request.url.match(location.origin)) return;
    // return e.respondWith(caches.open().then((cache) => {
    //     return cache.match(e.request).then((res) => {
    //         if (res) { return res; }
    //         return fetch(e.request).then((fetchRes) => {
    //             if (fetchRes.ok)
    //                 cache.put(e.request, fetchRes.clone())
    //             return fetchRes;
    //         });
    //     });
    // }));
    // 3. Network first then cache
    return e.respondWith(
        fetch(e.request).then((fetchRes) => {
            if (fetchRes.ok)
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, fetchRes));
            return fetchRes.clone();
        }).catch((err) => caches.match(e.request))
    );

    // e.respondWith(
    //     caches.match(e.request).then((res) => {
    //         if (res) return res;
    //         return fetch(e.request).then((res) => {
    //             if (e.request.method === "GET" && res.ok) {
    //                 const cloneres = res.clone()
    //                 caches.open(CACHE_NAME).then((cache) => {
    //                     cache.put(e.request,cloneres)
    //                 })
    //             }
    //             return res
    //         })
    //     }).catch(() => {
    //         if (e.request.url.endsWith("/db-test.json")) {
    //              return caches.match("db-test.json")
    //          }
    //      })
    // )
})
// Note: event.respondWith() harus menerima objek Response atau Promise yang resolve ke Response