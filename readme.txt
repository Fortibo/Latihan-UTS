json-server --watch db-test.json
http-server -g 
http server -p <port>
npm install http-server -g
npm install json-server -g


sw js

self.addEventListener('fetch', (e) => {
    // only intercept request made to our domain
    if (!e.request.url.match(location.origin)) return;

    // intercept certain file and replace with another file
    // if (e.request.url.endsWith('main.css')) {
    //     console.log(`Fetch Event: ${e.request.url}`);
    //     e.respondWith(fetch("/main2.css"));
    // }

    //check if camera_feed available else return content from cache as "offline content"
    if (e.request.url.endsWith('/camera_feed.html')) {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    if (res.ok) return res;
                    // return new Response('Camera feed currently not available.')
                    return caches.open(pwaCacheKey).then((cache) => cache.match('/camera_feed_unavailable.html'))
                })
        )
        return;
    }

    //1. Cache Only
    // return e.respondWith(caches.open(pwaCacheKey).then((cache) => cache.match(e.request)));

    //2. Cache first then network
    return e.respondWith(caches.open(pwaCacheKey).then((cache) => {
        return cache.match(e.request).then((res) => {
            if (res) { return res; }
            return fetch(e.request).then((fetchRes) => {
                if (fetchRes.ok)
                    cache.put(e.request, fetchRes.clone())
                return fetchRes;
            });
        });
    }));

    // 3. Network first then cache
    // return e.respondWith(
    //     fetch(e.request).then((fetchRes) => {
    //         if (fetchRes.ok)
    //             caches.open(pwaCacheKey).then(cache => cache.put(e.request, fetchRes));
    //         return fetchRes.clone();
    //     }).catch((err) => caches.match(e.request))
    // );

    // 4. Cache with network update
    // return e.respondWith(
    //     caches.open(pwaCacheKey).then((cache) => {
    //         return cache.match(e.request).then((res) => {
    //             let updatedRes = fetch(e.request).then((fetchRes) => {
    //                 if (fetchRes.ok)
    //                     cache.put(e.request, fetchRes.clone());
    //                 return fetchRes;
    //             });
    //             return res || updatedRes;
    //         })
    //     })
    // );

    // 5. Cache & network race
    // let firstResponse = new Promise((resolve, reject) => {
    //     let firstRejectionReceived = false;
    //     let rejectOnce = () => {
    //         firstRejectionReceived ? reject('No Response') : firstRejectionReceived = true;
    //     }
    //     fetch(e.request).then((fetchRes) => {
    //         if (fetchRes.ok) {
    //             caches.open(pwaCacheKey).then(cache => cache.put(e.request, fetchRes));
    //             resolve(fetchRes.clone());
    //         } else
    //             rejectOnce();
    //     }).catch(rejectOnce);
    //     caches.open(pwaCacheKey).then((cache) =>
    //         cache.match(e.request).then((res) => {
    //             res.ok ? resolve(res) : rejectOnce();
    //         })
    //     ).catch(rejectOnce);
    // })
    // e.respondWith(firstResponse);
});