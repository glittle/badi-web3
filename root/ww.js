var checkVersionFrequency = 1000 * 60 * 60 * 12; // 12 hours

var timer1 = null;
var timer2 = setTimeout(checkVersion, checkVersionFrequency);

onmessage = function(ev) {
    switch (ev.data) {
        case 'start':
            // doUpdate(); -- not helping... doesn't run in background on Android 
            break;
        case 'stop':
            clearTimeout(timer1);
            break;
    } 
}

function doUpdate(){
  clearTimeout(timer1);
  
  timer1 = setTimeout(function(){
      postMessage('pulse');
      doUpdate();
  }, 60 * 1000);
}

function checkVersion(){
    postMessage('checkVersion');
    setTimeout(checkVersion, checkVersionFrequency);
}