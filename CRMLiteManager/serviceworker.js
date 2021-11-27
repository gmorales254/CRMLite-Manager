var CACHE_VERSION = 611;


































































































































































































































































































































































































































































































































































var CURRENT_CACHES = {
  font: 'forms-v' + CACHE_VERSION
};

var typesToCache = [
    'text/html',
    'text/css',
    'image/svg+xml',
    'image/jpeg',
    'image/png',
    'application/javascript',
    'application/octet-stream',
    'application/json'
];


function find(key) {

  for (var i = 0; i < typesToCache.length; i++) {
    if (typesToCache[i] == key) {
      return true;    }
    }
  return false;

}

self.addEventListener('install', function (event) {
  
  event.waitUntil(self.skipWaiting());

});



self.addEventListener('activate', function(event) {
  
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1 && cacheName.indexOf('ucontact') < 0) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('Deleting out of date cache:', cacheName);
            caches.delete(cacheName);
            return self.clients.claim();
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  
  //console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    caches.open(CURRENT_CACHES.font).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) {

          //console.log('Found response in cache:', response);

          return response;
        }

        
        //console.log('No response for %s found in cache. About to fetch from network...', event.request.url);

        return fetch(event.request.clone()).then(function(response) {
          
          //console.log('Response for %s from network is: %O', event.request.url, response);

       
          if (response.status < 400 && response.headers.has('content-type') && find(response.headers.get('content-type'))) {
            //console.log('Caching the response to', event.request.url);
            cache.put(event.request, response.clone());
          } else {
            //console.log('Not caching the response to', event.request.url);
          }

          return response;
        });
      }).catch(function(error) {

        console.error('  Error in fetch handler:', error);

        throw error;
      });
    })
  );
});