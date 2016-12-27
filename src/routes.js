import Vue from 'vue'

var folder = './components/'

// import Home from './pages/Home'
// import Listing from './pages/Listing'
// import Verse from './pages/Verse'
// import UserSetup from './pages/UserSetup'

const names = [
  // this is their order in the menus
  'Verse',
  'Index',
  'Listing',
  'UserSetup',
  'Error404'
]

const routes = names.map(function (n) {
  return {
    component: Vue.component(n, require(`${folder}${n}.vue`)),
    name: n
  }
})

export default {
  raw: routes.map(function (m) {
    let data = m.component.options.data()
    return {
      component: m.component,
      path: '/' + data.path
    }
  }),
  menuPages: routes
    .filter(function (m) {
      let data = m.component.options.data()
      return !data.hideFromMenu
    })
    .map(function (m, i) {
      let data = m.component.options.data()
      return {
        to: data.path,
        text: data.title,
        index: '' + i
      }
    })
}

// function load (component) {
//   return () => System.import(`components/${component}.vue`)
// }
