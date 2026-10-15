import messages from '../scripts/messages'
import badiCalc from '../scripts/badiCalc'

const splitSeparator = /[,،]+/

function localize(el, binding) {
  var info = String(binding.expression || '').replace(/'/g, '')
  var useDateInfo = binding.modifiers.di
  var children = el.children
  var accessKeyFor = null
  var text = ''
  var parts = info.split(splitSeparator)
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i]
    var detail = part.split(':')
    var target, value = ''
    if (detail.length === 1) {
      var key = detail[0]
      var key2 = key === '_id_' ? el.getAttribute('id') : key
      target = 'html'
      value = messages.get(key2, useDateInfo ? badiCalc.di : null)
    }
    if (detail.length === 2) {
      if (detail[0] === 'extractAccessKeyFor') {
        accessKeyFor = detail[1]
        continue
      }
      target = detail[0]
      value = messages.get(detail[1])
    }
    if (target === 'html') {
      Array.from(children).filter(function (c) {
        var name = c.dataset.child
        value = value.replace('{' + name + '}', c.outerHTML)
      })
      el.innerHTML = value
      text = value
    } else if (target === 'text') {
      el.innerText = value
      text = value
    } else if (target) {
      el.getAttribute(target, value)
    }
  }
  if (accessKeyFor) {
    var html = document.createElement('div')
    html.innerHTML = text
    var uList = html.getElementsByTagName('u')
    if (uList.length > 0) {
      el.dataset.key = uList[0].innerText
      el.dataset.keyfor = accessKeyFor
    }
  }
}

export default {
  beforeMount(el, binding) {
    localize(el, binding)
  },
  mounted(el) {
    var forElement = document.getElementById(el.dataset.keyfor)
    if (forElement) {
      forElement.accessKey = el.dataset.key
    }
  }
}
