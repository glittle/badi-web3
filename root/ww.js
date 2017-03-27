var timerUpdate = null;

onmessage = function (ev) {
    // console.log('received in ww', ev.data)

    switch (ev.data.msg) {
        case 'doCallback':
            clearTimeout(timerUpdate);
            timerUpdate = setTimeout(doCallback, ev.data.delay);
            break;

        // default:
        //     console.warn('unexpected msg to ww', ev.data);
        //     break;
    }
}

function doCallback() {
    postMessage({
        msg: 'callingBack'
    });
}
