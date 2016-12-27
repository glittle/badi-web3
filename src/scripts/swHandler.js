
if ('serviceWorker' in navigator) {
  console.log('yes')

  //require('./sw-badi-web3.js')

  // navigator.serviceWorker.register('./sw-badi-web3.js', {
  // navigator.serviceWorker.register('./sw-badi-web3.js', {
  //     scope: '/'
  //   }).then(function (registration) {
  //     console.log('ServiceWorker 7 registration successful with scope: ', registration.scope);
  //     return navigator.serviceWorker.ready;
  //   })
  //   .catch(function (error) {
  //     // Something went wrong during registration. The service-worker.js file
  //     // might be unavailable or contain a syntax error.
  //     console.log(error);
  //   });
} else {
  console.log('service workers not supported')
}
