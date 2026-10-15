function createBus() {
  const events = Object.create(null)
  return {
    serverCallbackLog: [],
    $on(name, fn) {
      (events[name] || (events[name] = [])).push(fn)
    },
    $off(name, fn) {
      const list = events[name]
      if (!list) return
      if (!fn) {
        events[name] = []
        return
      }
      events[name] = list.filter(function (f) { return f !== fn })
    },
    $emit(name) {
      const list = events[name]
      if (!list) return
      const args = Array.prototype.slice.call(arguments, 1)
      list.slice().forEach(function (fn) { fn.apply(null, args) })
    }
  }
}

export default createBus
