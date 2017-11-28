var testCount = 0;

onconnect = function(e) {
    var port = e.ports[0];
    port.postMessage({ code: 'message', message: 'shared worker loaded' });

    port.onmessage = function(e) {
        switch (e.data.code) {
            case 'close':
                port.postMessage({ code: 'message', message: 'shared worker closing self' });
                close();
                return;
            case 'doCallback':
                setTimeout(function() {
                    port.postMessage({ code: e.data.cbCode })
                }, e.data.delay);
                port.postMessage({ code: 'pulseRequested', key: e.data.key })
                return;
        }

        // console.log('shared worker onmessage')
        // var workerResult = '!!!Result!!!';
        // port.postMessage({ code: 'message', message: workerResult + ' ' + e.data.code + ' 1 ' + ++testCount });

        // setTimeout(function() {
        //     port.postMessage({ code: 'message', message: workerResult + ' 2 ' + ++testCount });
        // }, 2000);

        // setTimeout(function() {
        //     port.postMessage({ code: 'message', message: workerResult + ' 12 ' + ++testCount });
        // }, 12000);
    }
}
