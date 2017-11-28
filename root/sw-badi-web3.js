/* global self */
/* global fetch */
/* global caches */
/* global indexedDB */

// originally adapted from google newtab service worker

var BLACKLIST = [
    /https\:\/\/www\.google\-analytics\.com\/collect.*/,
    /https\:\/\/www\.google\-analytics\.com\/r\/collect.*/
];
//var FILES = ['sw3.js']; // just need to name this file... all others are automaticly added
var FILES = [];

var versionFile = 'version.json';
var currentVersion = '1'; // will be updated

var CacheNamePrefix = 'glenTest'

function getNameOfCurrentCache() {
    return CacheNamePrefix + currentVersion;
}

function updateVersion() {

    if (!navigator.onLine) {
        console.log('skip version check - we are offline')
        return;
    }

    var url = './' + versionFile + '?' + Math.random().toString().slice(2, 7)
    var options = {
        credentials: 'same-origin',
        cache: 'no-cache'
    };

    console.log('fetching', url);

    fetch(url, options)
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            if (json.version) {
                var serverVersion = json.version;

                console.log('server version', serverVersion);

                // get version from DB
                var store = db.transaction([dbStoreName], 'readwrite').objectStore(dbStoreName);
                var getter = store.get('main');
                getter.onerror = function(ev) {
                    console.log('db getter error', ev)
                }
                getter.onsuccess = function(ev) {
                    var obj = ev.target.result || {
                        key: 'main',
                        version: '1'
                    };
                    var dbVersion = obj.version;
                    console.log('db version', dbVersion);

                    self.clients.matchAll().then(all => all.map(client => client.postMessage({
                        msg: 'CurrentVersion',
                        version: dbVersion
                    })))

                    if (serverVersion === dbVersion) {
                        currentVersion = serverVersion;
                        console.log('version not changed')
                    } else {
                        console.log('updating to version', serverVersion)
                        currentVersion = serverVersion;
                        obj.version = serverVersion;

                        caches.open(getNameOfCurrentCache()).then(function(cache) {
                            console.log('add files', FILES);
                            FILES.forEach(function(url) {
                                console.log('add file', url);
                                cache.add(url, {
                                    credentials: 'same-origin'
                                });
                            });
                        });

                        clearCache();

                        store.put(obj);


                    }
                }
            } else {
                console.log('version??', json)
            }
        })
        .catch(function(reason) {
            console.log('failed to load version.json', reason)
        });
}

function clearCache() {

    var cachedFiles = {};

    // remove the old cache (any that are not our new name!)
    caches.keys().then(function(keys) {
        keys.map(function(cacheName) {
            console.log('checking', cacheName);

            if (cacheName != getNameOfCurrentCache()) { // && k.indexOf(CACHEPrefix) == 0) {
                console.log('delete cache', cacheName)

                if (cacheName.indexOf(CacheNamePrefix) === 0) {

                    console.log('read old urls')
                    caches.open(cacheName).then(function(cache) {

                        console.log('cache opened')

                        cache.keys().then(function(keys) {

                            // console.log('keys retreived', keys)

                            // keys.forEach(function(request, index, array) {

                            //     console.log('old key', request)

                            //     // use object to prevent duplicate entries
                            //     cachedFiles[request.url] = request;
                            // });

                            // var cachedFileKeys = Object.keys(cachedFiles);

                            // console.log('recache what', cachedFileKeys, cachedFiles);

                            // if (cachedFileKeys.length) {
                            //     // reload anything that was in the cache
                            //     caches.open(getNameOfCurrentCache()).then(function(cache) {
                            //         cachedFileKeys.forEach(function(oldUrl) {
                            //             var oldRequest = cachedFiles[oldUrl];
                            //             debugger;
                            //             if (oldUrl.indexOf(this.location.origin) === 0) {
                            //                 oldRequest = new Request(oldUrl, {
                            //                     credentials: 'same-origin'
                            //                 });
                            //             }

                            //             console.log('refreshing cache for', oldUrl, oldRequest);

                            //             cache.add(oldRequest);
                            //         });

                            //     })
                            // }

                            console.log('deleting after reading', cacheName)
                            caches.delete(cacheName);
                            console.log('deleted after reading', cacheName)

                            console.log('tell client a reload is needed')
                            self.clients.matchAll().then(all => all.map(client => client.postMessage({
                                msg: 'UpdateNeeded',
                                version: currentVersion
                            })))
                        });


                    })
                } else {

                    caches.delete(cacheName);
                    console.log('deleted other', cacheName)

                }
            }
        })
    });


}

var db;
var dbName = 'swStorage'
var dbStoreName = 'versions'
var cvTimer = null;

function checkVersionSoon() {
    clearTimeout(cvTimer);
    cvTimer = setTimeout(function() {
        console.log('sw internal check version')
        checkVersion();
    }, 10000);
}

function checkVersion() {
    var dbRequest = indexedDB.open(dbName, 1);

    dbRequest.onsuccess = function() {
        db = this.result;
        console.log('db opened');
        updateVersion();
    };
    dbRequest.onerror = function(event) {
        console.error("DB Error", event);
    };
    dbRequest.onupgradeneeded = function(evt) {
        console.log('updating schema')
        var store = evt.currentTarget.result.createObjectStore(
            dbStoreName, {
                keyPath: 'key',
                autoIncrement: false
            });
    }
}









self.addEventListener('message', function(event) {
    console.log("SW Received Message: " + event.data);
    switch (event.data) {
        case 'reloaded':
            checkVersion();
            break;
        case 'echo':
            self.clients.matchAll().then(all => all.map(client => client.postMessage({
                msg: 'echo'
            })))
            break;
        case 'reloading':
            console.log('sw clearing for reload')
            clearCache();
            self.registration.unregister()
            break;
        case 'checkVersion':
            checkVersion();
            break;
    }
});


self.addEventListener('install', function(event) {
    console.log('sw3 installed')
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    console.log('sw3 activated')
    event.waitUntil(self.clients.claim());

    console.log('cache keys', caches.keys());

    checkVersion();

    return event.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(k) {
            console.log('checking', k);

            if (k != getNameOfCurrentCache()) { // && k.indexOf(CACHEPrefix) == 0) {
                console.log('delete cache', k)
                return caches.delete(k);
            } else {
                return Promise.resolve();
            }
        }));
    }));
});

self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = request.url;

    var isSecure = url.slice(0, 5).toLocaleString() === 'https' || url.indexOf('localhost:8') !== -1;
    var isVersionFile = url.indexOf('version.json') !== -1

    var isBlacklisted = false;
    for (var i = 0; i < BLACKLIST.length; ++i) {
        var b = BLACKLIST[i];
        if (b.test(url)) {
            isBlacklisted = true;
            // console.log('blacklist - do not cache', url)
            break;
        }
    }

    var cacheThisRequest = isSecure && !isVersionFile && !isBlacklisted;

    if (cacheThisRequest) {
        // console.log('sw3 fetch request for', url);
        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) {
                    console.log('fetched from cache', event.request.url)
                    checkVersionSoon();
                    return response;
                }

                console.log('not in cache, fetch from server', event.request.url);

                return fetch(event.request, {
                    cache: 'no-cache'
                }).then(function(response) {
                    var shouldCache = true;
                    // for (var i = 0; i < BLACKLIST.length; ++i) {
                    //     var b = BLACKLIST[i];
                    //     if (b.test(event.request.url)) {
                    //         shouldCache = false;
                    //         console.log('blacklist - do not cache', event.request.url)
                    //         break;
                    //     }
                    // }

                    if (event.request.method == 'POST') {
                        shouldCache = false;
                    }

                    if (shouldCache) {
                        return caches.open(getNameOfCurrentCache()).then(function(cache) {
                            try {
                                cache.put(event.request.clone(), response.clone());
                            } catch (error) {
                                console.log(`didn't cache when expected`, error)
                            }
                            return response;
                        }).catch(function(err) {
                            console.log(err);
                        });
                    } else {
                        return response;
                    }
                });
            }));
    } else {
        console.log('bypass cache for', url)
    }
});



if (!Cache.prototype.add) {

    Cache.prototype.add = function add(request) {
        return this.addAll([request]);
    };
}

if (!Cache.prototype.addAll) {

    Cache.prototype.addAll = function addAll(requests) {
        var cache = this;

        function NetworkError(message) {
            this.name = 'NetworkError';
            this.code = 19;
            this.message = message;
        }
        NetworkError.prototype = Object.create(Error.prototype);

        return Promise.resolve().then(function() {
            if (arguments.length < 1) throw new TypeError();

            var sequence = [];

            requests = requests.map(function(request) {
                if (request instanceof Request) {
                    return request;
                } else {
                    return String(request);
                }
            });

            return Promise.all(
                requests.map(function(request) {
                    if (typeof request === 'string') {
                        request = new Request(request);
                    }

                    return fetch(request.clone());
                })
            );
        }).then(function(responses) {
            return Promise.all(
                responses.map(function(response, i) {
                    return cache.put(requests[i], response);
                })
            );
        }).then(function() {
            return undefined;
        });
    };
}

if (!CacheStorage.prototype.match) {

    CacheStorage.prototype.match = function match(request, opts) {
        var caches = this;
        return caches.keys().then(function(cacheNames) {
            var match;
            return cacheNames.reduce(function(chain, cacheName) {
                return chain.then(function() {
                    return match || caches.open(cacheName).then(function(cache) {
                        return cache.match(request, opts);
                    }).then(function(response) {
                        match = response;
                        return match;
                    });
                });
            }, Promise.resolve());
        });
    };
}

// notifications
self.addEventListener('notificationclick', function(event) {
    // Close notification.
    // event.notification.close();
    var url = event.notification.data.url;

    // Example: Open window after 3 seconds.
    // (doing so is a terrible user experience by the way, because
    //  the user is left wondering what happens for 3 seconds.)
    var promise = new Promise(function() {
        // return the promise returned by openWindow, just in case.
        // Opening any origin only works in Chrome 43+.
        var found = false;

        clients.matchAll().then(function(cList) {
            for (i = 0; i < cList.length; i++) {
                if (cList[i].url.startsWith(url)) {
                    found = true;
                    cList[i].focus();
                    break;
                }
            }
            if (!found) {
                clients.openWindow(url).then(function(windowClient) {
                    //   do something with the windowClient.
                });
            }
        });
    });

    // Now wait for the promise to keep the permission alive.
    event.waitUntil(promise);
});

self.addEventListener('notificationclose', event => {
    // Do something with the event
    console.log('closed notification', event.notification)
});
