import Vue from 'vue'
import messages from '../scripts/messages'
import dateInfo from '../scripts/dateInfo'

const splitSeparator = /[,،]+/;

Vue.directive('msg', {
  bind: function (el, binding, vnode) {
    localize(el, binding);
  }
});

function localize(el, binding, fnOnEach) {
  // syntax v-msg="target:value,target"
  // syntax v-msg:di="target:value,target"

  // parse data-msg...  target:value,target,target,target:value
  // if no value given in one pair, use the element's ID
  // if the target element has child elements, they will be deleted.
  //   However, if a child has data-child='x' and resource text has {x}, {y}, etc. the children will be inserted in those spaces.

  var info = binding.expression;
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
      value = messages.get(key2, useDateInfo ? dateInfo.di : null);
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
      children.filter(function (c) {
        var name = c.dataset.child;
        value = value.replace('{' + name + '}', c.outerHTML);
      });
      el.innerHTML = value;
      localize(el); // nested?
      text = value;
    } else if (target === 'text') {
      el.innerText = value;
      text = value;
    } else {
      el.getAttribute(target, value);
    }
  }
  if (accessKeyFor) {
    //   var accessKey = $('<div/>').html(text).find('u').text().substring(0, 1);
    var html = document.createElement('div')
    html.innerHTML = text;
    var uList = html.getElementsByTagName('u')
    if (uList.length > 0) {
      el.accessKey = uList[0].innerText;
    }
  }
}
