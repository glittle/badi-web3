/* eslint-disable */
/*
 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
 *  Licensed under the New BSD License.
 *  https://github.com/stackp/promisejs
 */
(function (a) {
  function b() {
    this._callbacks = [];
  }
  b.prototype.then = function (a, c) {
    var d;
    if (this._isdone) d = a.apply(c, this.result);
    else {
      d = new b();
      this._callbacks.push(function () {
        var b = a.apply(c, arguments);
        if (b && typeof b.then === 'function') b.then(d.done, d);
      });
    }
    return d;
  };
  b.prototype.done = function () {
    this.result = arguments;
    this._isdone = true;
    for (var a = 0; a < this._callbacks.length; a++) this._callbacks[a].apply(null, arguments);
    this._callbacks = [];
  };

  function c(a) {
    var c = new b();
    var d = [];
    if (!a || !a.length) {
      c.done(d);
      return c;
    }
    var e = 0;
    var f = a.length;

    function g(a) {
      return function () {
        e += 1;
        d[a] = Array.prototype.slice.call(arguments);
        if (e === f) c.done(d);
      };
    }
    for (var h = 0; h < f; h++) a[h].then(g(h));
    return c;
  }

  function d(a, c) {
    var e = new b();
    if (a.length === 0) e.done.apply(e, c);
    else a[0].apply(null, c).then(function () {
      a.splice(0, 1);
      d(a, arguments).then(function () {
        e.done.apply(e, arguments);
      });
    });
    return e;
  }

  function e(a) {
    var b = "";
    if (typeof a === "string") b = a;
    else {
      var c = encodeURIComponent;
      var d = [];
      for (var e in a)
        if (a.hasOwnProperty(e)) d.push(c(e) + '=' + c(a[e]));
      b = d.join('&');
    }
    return b;
  }

  function f() {
    var a;
    if (window.XMLHttpRequest) a = new XMLHttpRequest();
    else if (window.ActiveXObject) try {
      a = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (b) {
      a = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return a;
  }

  function g(a, c, d, g) {
    var h = new b();
    var j, k;
    d = d || {};
    g = g || {};
    try {
      j = f();
    } catch (l) {
      h.done(i.ENOXHR, "");
      return h;
    }
    k = e(d);
    if (a === 'GET' && k) {
      c += '?' + k;
      k = null;
    }
    j.open(a, c);
    var m = 'application/x-www-form-urlencoded';
    for (var n in g)
      if (g.hasOwnProperty(n))
        if (n.toLowerCase() === 'content-type') m = g[n];
        else j.setRequestHeader(n, g[n]);
    j.setRequestHeader('Content-type', m);

    function o() {
      j.abort();
      h.done(i.ETIMEOUT, "", j);
    }
    var p = i.ajaxTimeout;
    if (p) var q = setTimeout(o, p);
    j.onreadystatechange = function () {
      if (p) clearTimeout(q);
      if (j.readyState === 4) {
        var a = (!j.status || (j.status < 200 || j.status >= 300) && j.status !== 304);
        h.done(a, j.responseText, j);
      }
    };
    j.send(k);
    return h;
  }

  function h(a) {
    return function (b, c, d) {
      return g(a, b, c, d);
    };
  }
  var i = {
    Promise: b,
    join: c,
    chain: d,
    ajax: g,
    get: h('GET'),
    post: h('POST'),
    put: h('PUT'),
    del: h('DELETE'),
    ENOXHR: 1,
    ETIMEOUT: 2,
    ajaxTimeout: 0
  };
  if (typeof define === 'function' && define.amd) define(function () {
    return i;
  });
  else a.promise = i;
})(this);


//talkify-ajax.js
var talkifyHttp = (function ajax() {

  var get = function (url) {
    var call = new promise.Promise();

    promise
    //  .get(application.appendAppPath(url))
      .get(window.talkifyConfig.host + url)
      .then(function (error, data) {
        try {
          var jsonObj = JSON.parse(data);
          call.done(error, jsonObj);
        } catch (e) {
          call.done(e, data);
        }

      }); //$http({ method: 'GET', url: application.appendAppPath(url), timeout: canceler });

    return call;
  };

  return {
    get: get
  };
})();

// 
// talkify-config.js


var talkifyConfig = {
    host: 'http://talkify.net'
  }
  // 
  // talkify-html5-speechsynthesis-player.js


var Html5Player = function () {
  this.isStopped = false;
  this.forcedVoice = null;

  this.currentContext = {
    item: null,
    endedCallback: function () {},
    utterances: [],
    currentUtterance: null
  };

  var me = this;

  this.audioSource = {
    play: function () {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();

        return;
      }

      if (me.currentContext.item) {
        me.playCurrentContext();
      }
    },
    pause: function () {
      window.speechSynthesis.pause();
    },
    ended: function () {
      return !window.speechSynthesis.speaking;
    },
    isPlaying: function () {
      return window.speechSynthesis.speaking;
    },
    paused: function () {
      return !window.speechSynthesis.speaking;
    },
    currentTime: function () {
      return 0;
    },
    cancel: function (asPause) {
      if (asPause) {
        me.stop();
      } else {
        console.log('FOOOO');
        window.speechSynthesis.cancel();
      }
    },
    stop: function () {
      me.stop();
    }
  };

  this.__proto__.__proto__ = new BasePlayer(this.audioSource);
};

Html5Player.prototype.extractWords = function (text, language) {
  var wordRegex = new RegExp(/[&\$\-|]|([("\-&])*(\b[^\s]+[.:,"-)!&?]*)/g);

  if (language) {
    if (language.indexOf('zh-') > -1) {
      return text.split('，');
    }

    if (language.indexOf('ko-') > -1) {
      return text.split('.');
    }
  }

  var words = [];
  var m;

  while ((m = wordRegex.exec(text)) !== null) {
    if (m.index === wordRegex.lastIndex) {
      wordRegex.lastIndex++;
    }

    words.push(m[0]);
  }

  return words;
};

Html5Player.prototype.getVoice = function () {
  var p = new promise.Promise();
  var me = this;

  if (this.forcedVoice) {
    p.done(this.forcedVoice);

    return p;
  }

  if (window.speechSynthesis.getVoices().length) {
    var voices = window.speechSynthesis.getVoices();

    p.done(me.selectVoiceToPlay(voices));

    return p;
  }

  window.speechSynthesis.onvoiceschanged = function () {
    var voices = window.speechSynthesis.getVoices();

    p.done(me.selectVoiceToPlay(voices));
  };

  return p;
};

Html5Player.prototype.selectVoiceToPlay = function (voices) {
  var matchingVoices = [];
  var voice = null;

  var language = this.settings.lockedLanguage || this.settings.referenceLanguage.Culture;

  for (var i = 0; i < voices.length; i++) {
    if (voices[i].lang === language) {
      matchingVoices.push(voices[i]);
      voice = voices[i];
    }
  }

  for (var j = 0; j < matchingVoices.length; j++) {
    if (matchingVoices[j].localService) {
      voice = matchingVoices[j];

      break;
    }
  }

  if (!voice && matchingVoices.length) {
    voice = matchingVoices[0];
  }

  if (!voice && voices.length) {
    voice = voices[0];
  }

  return voice;
};

Html5Player.prototype.chunckText = function (text) {
  var language = this.settings.lockedLanguage || this.settings.referenceLanguage.Culture;
  var chunckSize = language.indexOf('zh-') > -1 ? 70 :
    language.indexOf('ko-') > -1 ? 130 : 200;

  var chuncks = [];
  var sentences = text.split(/(\?|\.|。)+/g); //('.');
  var currentChunck = '';
  var me = this;

  sentences.forEach(function (sentence) {
    if (sentence === '' || sentence === '.' || sentence === '。' || sentence === '?') {
      if (currentChunck) {
        currentChunck += sentence;
      }

      return;
    }

    if (currentChunck && ((currentChunck.length + sentence.length) > chunckSize)) {
      chuncks.push(currentChunck);
      currentChunck = '';
    }

    if (sentence.length > chunckSize) {
      var words = me.extractWords(sentence, language);

      words.forEach(function (word) {
        if (currentChunck.length + word.length > chunckSize) {
          chuncks.push(currentChunck);
          currentChunck = '';
        }

        currentChunck += word.trim() + ' ';
      });

      if (currentChunck.trim()) {
        chuncks.push(currentChunck.trim() + '.');
        currentChunck = '';
      }

      return;
    }

    currentChunck += sentence;
  });

  chuncks.push(currentChunck);

  return chuncks;
};

Html5Player.prototype.playAudio = function (item, onEnded) {
  this.currentContext.endedCallback = onEnded;
  this.currentContext.item = item;
  this.currentContext.utterances = [];
  this.currentContext.currentUtterance = null;
  var me = this;

  //if (me.settings.lockedLanguage !== null) {
  return me.playCurrentContext();
  //}

  //TODO: Need better server side help here with refLang
  //var p = new promise.Promise();

  //talkifyHttp.get("/api/Language?text=" + item.text)
  //    .then(function (error, data) {
  //        me.settings.referenceLanguage = data;

  //        me.playCurrentContext().then(function () {
  //            p.done();
  //        });
  //    });

  //return p;
};

Html5Player.prototype.playCurrentContext = function () {
  var item = this.currentContext.item;
  var onEnded = this.currentContext.endedCallback;

  var chuncks = this.chunckText(item.text);

  var me = this;

  me.currentContext.utterances = [];
  me.isStopped = false;

  chuncks.forEach(function (chunck) {
    var utterance = new window.SpeechSynthesisUtterance();

    utterance.text = chunck;
    utterance.lang = me.settings.lockedLanguage || me.settings.referenceLanguage.Culture;

    me.currentContext.utterances.push(utterance);
  });

  var p = new promise.Promise();

  var wordIndex = 0;
  var previousCharIndex = 0;
  var words = this.extractWords(item.text);

  me.currentContext.utterances[me.currentContext.utterances.length - 1].onend = function (e) {
    me.events.onSentenceComplete(item);

    if (!me.currentContext.currentUtterance) {
      return;
    }

    if (me.currentContext.currentUtterance.text !== e.currentTarget.text) {
      return;
    }

    if (onEnded && !me.isStopped) {
      onEnded();
    }
  };

  me.currentContext.utterances.forEach(function (u, index) {
    if (index === 0) {
      u.onstart = function (e) {
        me.currentContext.currentUtterance = e.utterance;
        p.done();
        me.internalEvents.onPlay();
      };
    } else {
      u.onstart = function (e) {
        me.currentContext.currentUtterance = e.utterance;
      };
    }

    u.onpause = function () {
      me.internalEvents.onPause();
    };

    u.onresume = function () {};

    u.onboundary = function (e) {
      if (!me.settings.useTextHighlight || !u.voice.localService) {
        return;
      }

      if (e.name !== "word" || !words[wordIndex]) {
        return;
      }

      if (!words[wordIndex]) {
        return;
      }

      var fromIndex = 0;

      for (var k = 0; k < wordIndex; k++) {
        fromIndex += words[k].length + 1;
      }

      var isCommaOrSimilair = previousCharIndex + 1 === e.charIndex;

      if (isCommaOrSimilair) {
        previousCharIndex = e.charIndex;
        return;
      }

      me.wordHighlighter.highlight(item, words[wordIndex], fromIndex);
      wordIndex++;
      previousCharIndex = e.charIndex;
    };

    me.getVoice().then(function (voice) {
      if (words.length && me.settings.useTextHighlight && voice.localService) {
        me.wordHighlighter.highlight(item, words[0], 0);
      }

      u.voice = voice;

      console.log(u); //Keep this, speech bugs out otherwise
      window.speechSynthesis.cancel();

      window.setTimeout(function () {
        window.speechSynthesis.speak(u);
      }, 100);
    });
  });

  return p;
};

Html5Player.prototype.stop = function () {
  this.isStopped = true;
  window.speechSynthesis.cancel();

  if (this.currentContext.utterances.indexOf(this.currentContext.currentUtterance) < this.currentContext.utterances.length - 1) {
    console.log('Not the last, finishing anyway...');
    this.events.onSentenceComplete(this.currentContext.item);
  }
};

Html5Player.prototype.forceVoice = function (voice) {
  this.forcedVoice = voice;

  return this;
};

// 
// talkify-player-core.js


var BasePlayer = function (_audiosource) {
  this.audioSource = _audiosource;
  this.wordHighlighter = new TalkifyWordHighlighter();
  this.id = this.generateGuid();
  var me = this;

  this.settings = {
    useTextHighlight: false,
    referenceLanguage: {
      Culture: '',
      Language: -1
    },
    lockedLanguage: null
  };

  this.events = {
    onBeforeItemPlaying: function () {},
    onItemLoaded: function () {},
    onSentenceComplete: function () {},
    onPause: function () {},
    onPlay: function () {},
    onResume: function () {}
  };

  this.internalEvents = {
    onPause: function () {
      //me.wordHighlighter.pause();

      if (!me.audioSource.ended && me.audioSource.currentTime() > 0) {
        me.events.onPause();
      }
    },
    onPlay: function () {
      //me.wordHighlighter.resume();

      if (me.audioSource.currentTime() > 0) {
        me.events.onResume();
      } else {
        me.events.onPlay();
      }
    }
  };
};

BasePlayer.prototype.withReferenceLanguage = function (refLang) {
  this.settings.referenceLanguage = refLang;

  return this;
};

BasePlayer.prototype.withTextHighlighting = function () {
  this.settings.useTextHighlight = true;

  return this;
};

BasePlayer.prototype.subscribeTo = function (subscriptions) {
  this.events.onBeforeItemPlaying = subscriptions.onBeforeItemPlaying || function () {};
  this.events.onSentenceComplete = subscriptions.onItemFinished || function () {};
  this.events.onPause = subscriptions.onPause || function () {};
  this.events.onPlay = subscriptions.onPlay || function () {};
  this.events.onResume = subscriptions.onResume || function () {};
  this.events.onItemLoaded = subscriptions.onItemLoaded || function () {};

  return this;
};

BasePlayer.prototype.generateGuid = function () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

BasePlayer.prototype.playItem = function (item) {
  var p = new promise.Promise();

  if (item && item.isPlaying) {
    if (this.audioSource.paused()) {
      this.audioSource.play();
    } else {
      this.audioSource.pause();
    }

    return p;
  }

  this.events.onBeforeItemPlaying(item);

  var me = this;

  item.isLoading = true;
  item.isPlaying = true;
  item.element.addClass("playing");

  this.playAudio(item, function () {
      item.isPlaying = false;
      p.done();
    })
    .then(function () {
      item.isLoading = false;
      me.events.onItemLoaded();
    });

  return p;
};

BasePlayer.prototype.createItems = function (text, $element) { //TODO: jQuery-dependency
  var safeMaxQuerystringLength = 1000;

  var items = [];

  //TODO: Smart split, should really split at the first end of sentence (.) that is < safeLength
  if (text.length > safeMaxQuerystringLength) {
    var f = text.substr(0, safeMaxQuerystringLength);

    items.push(template(f, $element));

    items = items.concat(this.createItems(text.substr(safeMaxQuerystringLength, text.length - 1), $element));

    return items;
  }

  items.push(template(text, $element));

  return items;

  function template(t, $el) {
    var outerHtml = $el.length > 0 ? $($el[0].outerHTML) : $();

    return {
      text: t,
      preview: t.substr(0, 40),
      element: $el,
      originalElement: outerHtml,
      isPlaying: false,
      isLoading: false
    };
  }
};

BasePlayer.prototype.playText = function (text) {
  var items = this.createItems(text, $());

  var currentItem = 0;

  var next = function () {
    currentItem++;

    if (currentItem >= items.length) {
      return;
    }

    this.playItem(items[currentItem])
      .then(next);
  };

  this.playItem(items[currentItem])
    .then(next);
};

BasePlayer.prototype.paused = function () {
  return this.audioSource.paused();
};

BasePlayer.prototype.isPlaying = function () {
  return this.audioSource.isPlaying();
};

BasePlayer.prototype.play = function () {
  this.audioSource.play();
};

BasePlayer.prototype.pause = function () {
  this.audioSource.pause();
  var me = this;

  if (!me.audioSource.paused() && me.audioSource.cancel) {
    me.audioSource.cancel(true);
  }
};

BasePlayer.prototype.dispose = function () {
  this.wordHighlighter.cancel();
  this.audioSource.stop();
};

BasePlayer.prototype.forceLanguage = function (culture) {
  this.settings.lockedLanguage = culture;

  return this;
};
// 
// talkify-player.js


function TtsPlayer() {
  var me = this;
  var audioElement;

  this.currentContext = {
    item: null,
    positions: []
  };

  this.audioSource = {
    play: function () {
      audioElement.play();
    },
    pause: function () {
      audioElement.pause();
    },
    isPlaying: function () {
      return audioElement.duration > 0 && !audioElement.paused;
    },
    paused: function () {
      return audioElement.paused;
    },
    currentTime: function () {
      return audioElement.currentTime;
    },
    stop: function () {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  };

  this.forcedVoice = '';

  function setupBindings() {
    audioElement.addEventListener("pause", onPause);
    audioElement.addEventListener("play", onPlay);
  }

  function onPause() {
    me.internalEvents.onPause();

    me.wordHighlighter.pause();
  }

  function onPlay() {
    me.internalEvents.onPlay();

    if (!me.currentContext.positions.length) {
      return;
    }

    if (me.audioSource.currentTime() > 0) {
      me.wordHighlighter.resume();
    } else {
      var interval = setInterval(function () {
        if (me.audioSource.currentTime() > 0) {
          clearInterval(interval);

          me.wordHighlighter
            .start(me.currentContext.item, me.currentContext.positions)
            .then(function (completedItem) {
              me.events.onSentenceComplete(completedItem);
            });
        }
      }, 20);
    }
  }

  function initialize() {
    audioElement = document.getElementById("talkify-audio");

    if (!audioElement) {
      var mp3Source = document.createElement("source");
      var wavSource = document.createElement("source");
      audioElement = document.createElement("audio");

      audioElement.appendChild(mp3Source);
      audioElement.appendChild(wavSource);

      mp3Source.type = "audio/mpeg";
      wavSource.type = "audio/wav";
      audioElement.id = "talkify-audio";
      audioElement.controls = true;
      audioElement.autoplay = true;

      //   $('#btnRead').after(audioElement);
      document.getElementById('btnRead').after(audioElement);

    }

    var clonedAudio = audioElement.cloneNode(true);
    audioElement.parentNode.replaceChild(clonedAudio, audioElement);

    audioElement = clonedAudio;
  }

  initialize();
  this.audioElement = audioElement;

  this.__proto__.__proto__ = new BasePlayer(this.audioSource);

  setupBindings();
};

TtsPlayer.prototype.getPositions = function () {
  var me = this;
  var p = new promise.Promise();

  talkifyHttp.get("/api/Speak/GetPositions?id=" + me.id)
    .then(function (error, positions) {
      p.done(null, positions);
    });

  return p;
};

TtsPlayer.prototype.playAudio = function (item, onEnded) {
  var me = this;

  me.currentContext.item = item;
  me.currentContext.positions = [];

  var p = new promise.Promise();

  var sources = this.audioElement.getElementsByTagName("source");

  var textToPlay = encodeURIComponent(item.text.replace(/\n/g, " "));

  sources[0].src = talkifyConfig.host + "/api/Speak?format=mp3&text=" + textToPlay + "&refLang=" + this.settings.referenceLanguage.Language + "&id=" + this.id + "&voice=" + (this.forcedVoice || '');
  sources[1].src = talkifyConfig.host + "/api/Speak?format=wav&text=" + textToPlay + "&refLang=" + this.settings.referenceLanguage.Language + "&id=" + this.id + "&voice=" + (this.forcedVoice || '');

  this.audioElement.load();

  //TODO: remove jquery dependency
  $(this.audioElement)
    .unbind("loadeddata")
    .bind("loadeddata", function () {
      me.audioSource.pause();

      if (!me.settings.useTextHighlight) {
        p.done();
        me.audioSource.play();
        return;
      }

      me.getPositions().then(function (error, positions) {
        me.currentContext.positions = positions;

        p.done();
        me.audioSource.play();
      });
    })
    .unbind("ended.justForUniqueness")
    .bind("ended.justForUniqueness", onEnded || function () {});

  return p;
};

TtsPlayer.prototype.forceVoice = function (voice) {
  this.forcedVoice = voice;

  return this;
};

// 
// talkify-playlist.js


function talkifyPlaylist() {

  var defaults = {
    useGui: false,
    useTextInteraction: false,
    domElements: [],
    rootSelector: 'body',
    events: {
      onEnded: null
    }
  };

  var s = JSON.parse(JSON.stringify(defaults));

  var p = null;

  function isSupported() {
    var a = document.createElement("audio");

    return (typeof a.canPlayType === "function" && (a.canPlayType("audio/mpeg") !== "" || a.canPlayType("audio/wav") !== ""));
  }

  function implementation(_settings, player) {

    var textextractor = new TalkifyTextextractor();

    var playlist = {
      queue: [],
      currentlyPlaying: null,
      refrenceText: "",
      referenceLanguage: {
        Culture: '',
        Language: -1
      }
    };

    var settings = _settings;
    var playerHasBeenReplaced = false;

    function reset() {
      playlist.queue = [];
      player.withReferenceLanguage({
        Culture: '',
        Language: -1
      });
      playlist.currentlyPlaying = null;
      playlist.refrenceText = "";
    }

    function insertAt(index, items) {
      playlist.queue = playlist.queue.slice(0, index)
        .concat(items)
        .concat(playlist.queue.slice(index));
    }

    function push(items) {
      playlist.queue = playlist.queue.concat(items);
    }

    function resetPlaybackStates() {
      for (var j = 0; j < playlist.queue.length; j++) {
        var item = playlist.queue[j];

        //TODO: Call player.resetItem?
        item.isPlaying = false;
        item.isLoading = false;
        item.element.removeClass("playing");
      }
    };

    function isPlaying() {
      for (var i = 0; i < playlist.queue.length; i++) {
        if (playlist.queue[i].isPlaying) {
          return true;
        }
      }

      return false;
    }

    function domElementExistsInQueue($element) {
      for (var j = 0; j < playlist.queue.length; j++) {
        var item = playlist.queue[j];

        if (!item) {
          continue;
        }

        if ($element.is(item.element)) {
          return true;
        }
      }

      return false;
    }

    function playItem(item) {
      var p = new promise.Promise();

      if (!playerHasBeenReplaced && item && item.isPlaying) {
        if (player.paused()) {
          player.play();
        } else {
          player.pause();
        }

        return p;
      }

      playerHasBeenReplaced = false;

      resetPlaybackStates();

      if (playlist.currentlyPlaying) {
        playlist.currentlyPlaying.element.html(playlist.currentlyPlaying.originalElement.html());
      }

      playlist.currentlyPlaying = item;

      p = player.playItem(item);

      return p;
    };

    function createItems(text, $element) { //TODO: jQuery-dependency
      var safeMaxQuerystringLength = 1000;

      var items = [];

      if (text.length > safeMaxQuerystringLength) {
        var breakAt = text.substr(0, safeMaxQuerystringLength).lastIndexOf('.'); //TODO: What about ckj characters?

        breakAt = breakAt > -1 ? breakAt : safeMaxQuerystringLength;

        var f = text.substr(0, breakAt);

        items.push(template(f, $element));

        items = items.concat(createItems(text.substr(breakAt, text.length - 1), $element));

        return items;
      }

      items.push(template(text, $element));

      return items;

      function template(t, $el) {
        var outerHtml = $el.length > 0 ? $($el[0].outerHTML) : $();

        return {
          text: t,
          preview: t.substr(0, 40),
          element: $el,
          originalElement: outerHtml,
          isPlaying: false,
          isLoading: false
        };
      }
    }

    function play(item) {
      if (!item) {
        playFromBeginning();

        return;
      }

      continueWithNext(item);
    }

    function setupItemForUserInteraction(item) {
      item.element.css("cursor", "pointer")
        .addClass('talkify-highlight')
        .unbind('click.talkify')
        .bind('click.talkify', function () {
          play(item);
        });
    }

    function initialize() {
      reset();

      if (!settings.domElements || settings.domElements.length === 0) {
        settings.domElements = textextractor.extract(settings.rootSelector);
      }

      for (var i = 0; i < settings.domElements.length; i++) {
        var text;
        var element = $();

        if (typeof settings.domElements[i] === "string") {
          text = settings.domElements[i];
        } else {
          element = $(settings.domElements[i]);
          text = element.text().trim();
        }

        if (text === "") {
          continue;
        }

        push(createItems(text, element));

        if (text.length > playlist.refrenceText.length) {
          playlist.refrenceText = text;
        }
      }

      if (settings.useTextInteraction) {
        for (var j = 0; j < playlist.queue.length; j++) {
          var item = playlist.queue[j];

          setupItemForUserInteraction(item);
        }
      }
    }

    function continueWithNext(currentItem) {
      var next = function (completed) {

        if (completed) {
          settings.events.onEnded();

          return;
        }

        playNext().then(next);
      };

      playItem(currentItem).then(next);
    }

    function getNextItem() {
      var currentQueuePosition = playlist.queue.indexOf(playlist.currentlyPlaying);

      if (currentQueuePosition === playlist.queue.length - 1) {
        return null;
      }

      return playlist.queue[currentQueuePosition + 1];
    }

    function playFromBeginning() {
      // GLEN - remove call to non-https api
      playlist.referenceLanguage = {
        Culture: '',
        Language: -1
      };
      player.withReferenceLanguage({
        Culture: '',
        Language: -1
      });

      continueWithNext(playlist.queue[0]);

      // return talkifyHttp.get("/api/Language?text=" + playlist.refrenceText)
      //     .then(function (error, data) {
      //         if (error) {
      //             playlist.referenceLanguage = { Culture: '', Language: -1 };
      //             player.withReferenceLanguage({ Culture: '', Language: -1 });

      //             continueWithNext(playlist.queue[0]);

      //             return;
      //         }

      //         playlist.referenceLanguage = data;
      //         player.withReferenceLanguage(data);

      //         continueWithNext(playlist.queue[0]);
      //     });
    }

    function playNext() {
      var p = new promise.Promise();

      var item = getNextItem();

      if (!item) {
        p.done("Completed");

        return p;
      }

      return playItem(item);
    }

    function insertElement(element) {
      var items = [];

      var text = element.text();

      if (text.trim() === "") {
        return items;
      }

      if (domElementExistsInQueue(element)) {
        return items;
      }

      var documentPositionFollowing = 4;

      for (var j = 0; j < playlist.queue.length; j++) {
        var item = playlist.queue[j];

        var isSelectionAfterQueueItem = element[0].compareDocumentPosition(item.element[0]) == documentPositionFollowing;

        if (isSelectionAfterQueueItem) {
          var queueItems = createItems(text, element);

          insertAt(j, queueItems);

          items = items.concat(queueItems);

          break;
        }

        var shouldAddToBottom = j === playlist.queue.length - 1;

        if (shouldAddToBottom) {
          var qItems = createItems(text, element);

          push(qItems);

          items = items.concat(qItems);

          break;;
        }
      }

      return items;
    }

    function replayCurrent() {
      playlist.currentlyPlaying.isPlaying = false;
      play(playlist.currentlyPlaying);
    }

    initialize();

    return {
      getQueue: function () {
        return playlist.queue;
      },
      play: play,
      pause: player.pause,
      replayCurrent: replayCurrent,
      insert: insertElement,
      isPlaying: isPlaying,
      setPlayer: function (p) {
        player = p;
        player.withReferenceLanguage(playlist.referenceLanguage);
        playerHasBeenReplaced = true;
      }
    }
  }

  return {
    begin: function () {
      s = JSON.parse(JSON.stringify(defaults));
      p = null;

      return {
        withTextInteraction: function () {
          s.useTextInteraction = true;

          return this;
        },
        withTalkifyUi: function () {
          s.useGui = true;

          return this;
        },
        withRootSelector: function (rootSelector) {
          s.rootSelector = rootSelector;

          return this;
        },
        withElements: function (elements) {
          s.domElements = elements;

          return this;
        },
        usingPlayer: function (player) {
          p = player;

          return this;
        },
        subscribeTo: function (events) {
          s.events.onEnded = events.onEnded || function () {};

          return this;
        },
        build: function () {
          if (!isSupported()) {
            throw new Error("Not supported. The browser needs to support mp3 or wav HTML5 Audio.");
          }

          if (!p) {
            throw new Error("A player must be provided. Please use the 'usingPlayer' method to provide one.");
          }

          s.events.onEnded = s.events.onEnded || function () {};

          return new implementation(s, p);
        }
      }
    }

  };
};
// 
// talkify-textextractor.js

var TalkifyTextextractor = function () {
  var validElements = [];

  var inlineElements = ['a', 'span', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo', 'q', 'sub', 'sup', 'label'].join();
  var forbiddenElementsString = ['img', 'map', 'object', 'script', 'button', 'input', 'select', 'textarea', 'br', 'style', 'code', 'nav', '#nav', '#navigation', '.nav', '.navigation', 'footer'].join();

  function getVisible(elements) {
    var result = [];

    for (var j = 0; j < elements.length; j++) {
      if (elements[j].is(':hidden')) {
        continue;
      }

      result.push(validElements[j]);
    }

    return result;
  }

  function getStrippedText(text) {
    return text.replace(/(\r\n|\n|\r)/gm, "").trim();
  }

  function isValidTextNode(node) {
    if (!node) {
      return false;
    }

    if (node.nodeName === "#text") {
      return getStrippedText(node.textContent).length >= 10;
    }

    return false;
  }

  function isValidAnchor($node) {
    if ($node.siblings().length >= 1) {
      return true;
    }

    var previous = $node[0].previousSibling;

    if (isValidTextNode(previous)) {
      return true;
    }

    var next = $node[0].nextSibling;

    if (isValidTextNode(next)) {
      return true;
    }

    return false;
  }

  function isValidForGrouping(node) {
    var isTextNode = node.nodeName === '#text';
    var textLength = getStrippedText(node.textContent).length;

    return (isTextNode && textLength >= 5) || $(node).is(inlineElements);
  }

  function getConnectedElements(nodes, firstIndex) {
    var connectedElements = [];

    for (var l = firstIndex; l < nodes.length; l++) {
      if (isValidForGrouping(nodes[l])) {
        connectedElements.push($(nodes[l]));
      } else {
        break;
      }
    }

    return connectedElements;
  }

  function group(elements) {
    //TODO: wrap in selectable element
    var wrapping = $('<span class="superbar"></span>');

    for (var j = 0; j < elements.length; j++) {
      wrapping.append(elements[j].clone());
    }

    return wrapping;
  }

  function wrapInSelectableElement(node) {
    return $('<span class="foobar"></span').append(node.textContent);
  }

  function wrapAndReplace(node) {
    var spanElement = wrapInSelectableElement(node);

    $(node).replaceWith(spanElement);

    return spanElement;
  }

  function evaluate(nodes) {
    if (!nodes || nodes.length === 0) {
      return;
    }

    for (var i = 0; i < nodes.length; i++) {
      var $node = $(nodes[i]);

      if ($node.is('p, h1, h2, h3, h4, h5, h6')) {
        validElements.push($node);
        continue;
      }

      if ($node.is(forbiddenElementsString)) {
        var forcedElement = $node.find('h1, h2, h3, h4');

        forcedElement.each(function () {
          validElements.push($(this));
        });

        continue;
      }

      if ($node.is('a') && !isValidAnchor($node)) {
        continue;
      }

      var connectedElements = getConnectedElements(nodes, i);

      if (connectedElements.length > 1) {
        var wrapping = group(connectedElements);
        var isAboveThreshold = getStrippedText(wrapping.text()).length >= 20;

        if (isAboveThreshold) {
          $(nodes[i]).replaceWith(wrapping);

          for (var j = 0; j < connectedElements.length; j++) {
            connectedElements[j].remove();
          }

          validElements.push(wrapping);

          continue;
        }
      }

      var node = nodes[i];

      if (isValidTextNode(node)) {
        validElements.push(wrapAndReplace(node));
      }

      evaluate(node.childNodes);
    }
  }

  function extract(rootSelector) {
    validElements = [];

    var topLevelElements = $(rootSelector + ' > *:not(' + forbiddenElementsString + ')');

    var date = new Date();

    for (var i = 0; i < topLevelElements.length; i++) {
      var $element = $(topLevelElements[i]);

      if ($element.is('p, h1, h2, h3, h4, h5, h6')) {
        validElements.push($element);

        continue;
      }

      evaluate(topLevelElements[i].childNodes);
    }

    var result = getVisible(validElements);

    console.log(new Date() - date);

    return result;
  }

  return {
    extract: extract
  };
};
// 
// talkify-timer.js


﻿
function Timer() {
  var callback, timerId, start, remaining;

  this.pause = function () {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  this.resume = function () {
    start = new Date();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, remaining);
  };

  this.cancel = function () {
    window.clearTimeout(timerId);
    callback = null;
  };

  this.start = function (cb, delay) {
    callback = cb;
    remaining = delay;
    timerId = window.setTimeout(callback, remaining);
  };
}
// 
// talkify-word-highlighter.js



var TalkifyWordHighlighter = function () {
  var textHighlightTimer = new Timer();
  var currentItem = null;

  function highlight(item, word, charPosition) {
    resetCurrentItem();

    currentItem = item;
    var text = item.element.text().trim();

    if (charPosition === 0) {
      item.element.html('<span class="talkify-word-highlight">' + text.substring(0, word.length) + '</span> ' + text.substring(word.length + 1));

      return;
    }

    item.element.html(text.substring(0, charPosition) + '<span class="talkify-word-highlight">' + text.substring(charPosition, charPosition + word.length) + '</span>' + text.substring(charPosition - 1 + word.length + 1));
  }

  function setupWordHightlighting(item, positions) {
    var p = new promise.Promise();

    textHighlightTimer.cancel();
    resetCurrentItem();

    if (!positions.length) {
      return p.done(item);
    }

    var i = 0;

    var internalCallback = function () {
      highlight(item, positions[i].Word, positions[i].CharPosition);

      i++;

      if (i >= positions.length) {
        textHighlightTimer.cancel();

        window.setTimeout(function () {
          item.element.html(item.originalElement.html());

          p.done(item);
        }, 1000);

        return;
      }

      var next = (positions[i].Position - positions[i - 1].Position) + 0;

      textHighlightTimer.cancel();
      textHighlightTimer.start(internalCallback, next);
    };

    internalCallback();

    return p;
  }

  function cancel() {
    textHighlightTimer.cancel();

    resetCurrentItem();
  }

  function resetCurrentItem() {
    if (currentItem) {
      currentItem.element.html(currentItem.originalElement.html());
    }
  }

  return {
    pause: textHighlightTimer.pause,
    resume: textHighlightTimer.resume,
    start: setupWordHightlighting,
    highlight: highlight,
    cancel: cancel
  };
};

var exportedPlayer;

export default {
  getPlayer: function () {
    if (!exportedPlayer) {
      exportedPlayer = new TtsPlayer();
    }
    return exportedPlayer;
  }
}
