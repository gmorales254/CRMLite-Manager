//service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js?f='+ Math.random())
        .then(function (reg) {
            console.log('ServiceWorker Registered', reg);
        }).catch(function (err) {
            console.log('Cant Register ServiceWorker!', err);
        });
}
//