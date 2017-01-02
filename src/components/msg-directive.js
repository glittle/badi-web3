import Vue from 'vue'
import messages from '../scripts/messages'
import badiCalc from '../scripts/badiCalc'

const splitSeparator = /[,،]+/;

Vue.directive('msg', {
  bind: function (el, binding, vnode) {
    // console.log('bind ' + binding.expression)
    localize(el, binding);
  },
  inserted: function (el, binding, vnode) {
    // console.log('inserted ' + binding.expression)
    var forElement = document.getElementById(el.dataset.keyfor);
    if (forElement) {
      forElement.accessKey = el.dataset.key;
    }
  },
  // update: function (el, binding, vnode) {
  //   console.log('update ' + binding.expression)
  // },
  // componentUpdated: function (el, binding, vnode) {
  //   console.log('componentUpdated ' + binding.expression)
  // },
  // unbind: function (el, binding, vnode) {
  //   console.log('unbind ' + binding.expression)
  // },
});

function localize(el, binding, fnOnEach) {
  // syntax v-msg="target:value,target"
  // syntax v-msg:di="target:value,target"

  // parse data-msg...  target:value,target,target,target:value
  // if no value given in one pair, use the element's ID
  // if the target element has child elements, they will be deleted.
  //   However, if a child has data-child='x' and resource text has {x}, {y}, etc. the children will be inserted in those spaces.

  var info = binding.expression.replace(/'/g, '');
  var useDateInfo = binding.modifiers.di;
  var children = el.children;
  var accessKeyFor = null;
  var text = '';
  var parts = info.split(splitSeparator);
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    var detail = part.split(':');
    var target, value = '';
    if (detail.length === 1) {
      var key = detail[0];
      var key2 = key === '_id_' ? el.getAttribute('id') : key;
      target = 'html';
      value = messages.get(key2, useDateInfo ? badiCalc.di : null);
    }
    if (detail.length === 2) {
      if (detail[0] === 'extractAccessKeyFor') {
        accessKeyFor = detail[1];
        continue;
      }
      target = detail[0];
      value = messages.get(detail[1]);
    }
    if (fnOnEach) {
      value = fnOnEach(value);
    }
    if (target === 'html') {
      Array.from(children).filter(function (c) {
        var name = c.dataset.child;
        value = value.replace('{' + name + '}', c.outerHTML);
      });
      el.innerHTML = value;
      // if (el.innerHTML !== value) {
      //   // localize(el, binding, fnOnEach); // nested?
      // }
      text = value;
    } else if (target === 'text') {
      el.innerText = value;
      text = value;
    } else {
      el.getAttribute(target, value);
    }
  }
  if (accessKeyFor) {
    var html = document.createElement('div')
    html.innerHTML = text;
    var uList = html.getElementsByTagName('u')
    if (uList.length > 0) {
      el.dataset.key = uList[0].innerText;
      el.dataset.keyfor = accessKeyFor;
      //   forElement.accessKey = ;
      //   console.log('--> set')
      // } else {
      //   console.log('--> not found!')
    }
  }
}
