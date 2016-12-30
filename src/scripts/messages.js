require('./stringExt')
var has = require('lodash/has');

// var locale = 'fr';
const messageFiles = [];

var _cachedMessages = {};
// var _cachedMessageUseCount = 0;

function get(key, obj, defaultValue) {
  var rawMsg;
  var inCache = has(_cachedMessages, key);
  if (!inCache) {
    //rawMsg = chrome.i18n.getMessage(key);
    rawMsg = getRawMessage(key);
    _cachedMessages[key] = rawMsg;
  } else {
    // _cachedMessageUseCount++; // --> good for testing
    rawMsg = _cachedMessages[key];
  }

  var msg = rawMsg || defaultValue || '{' + key + '}';
  if (obj === null || typeof obj === 'undefined' || msg.search(/{/) === -1) {
    return msg;
  }

  var before = msg;
  var repeats = 0;
  while (repeats < 5) { // failsafe
    msg = msg.filledWith(obj);
    if (msg === before) {
      return msg;
    }
    if (msg.search(/{/) === -1) {
      return msg;
    }
    before = msg;
    repeats++;
  }
  return msg;
}

function getRawMessage(key) {
  // caller will cache the result
  var answer = '';
  for (var i = 0; i < messageFiles.length; i++) {
    const file = messageFiles[0];
    if (has(file, key)) {
      answer = file[key].message;
    }
  }
  // console.log(`raw for "${key}": "${answer}"`);
  return answer;
}

messageFiles.push(require('../locales/en/messages.json'))
messageFiles.push(require('../locales/en/messages.web3.json'));

// NOT WORKING - require seems to require hardcoded string
// if (locale !== 'en') {

//   var parts = locale.split('-')
//   if (parts.length > 1) {
//     var parent = parts[0];
//     try {
//       messageFiles.push(require('../locales/' + parent + '/messages.json'))
//     } catch (ex) {
//       console.log(ex)
//     }
//     try {
//       messageFiles.push(require('../locales/' + parent + '/messages.web3.json'))
//     } catch (ex) {
//       console.log(ex)
//     }
//   }
//   try {
//     let path = '../locales/' + locale + '/messages.web3.json';
//     console.log('load ' + path)
//     messageFiles.push(require(path))
//   } catch (ex) {
//     console.log(ex)
//   }
//   try {
//     let path = 'locales/' + locale + '/messages.web3.json'
//     console.log('load ' + path)
//     messageFiles.push(require(path))
//   } catch (ex) {
//     console.log(ex)
//   }
// }

// console.log(messageFiles)
// console.log(_cachedMessageUseCount)
// console.log('test1: ' + getMessage('test1'))
// console.log('test1: ' + getMessage('test1'))
// console.log('test1: ' + getMessage('test1'))
// console.log(_cachedMessageUseCount)
// console.log(_cachedMessages)

export default {
  get: get,
  locale: 'en' // locale // not working
}
