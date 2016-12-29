import Vue from 'vue'

var folder = './pages/'

// import Home from './pages/Home'
// import Listing from './pages/Listing'
// import Verse from './pages/Verse'
// import UserSetup from './pages/UserSetup'

const names = [
  // this is their order in the menus
  // 'NameOfVueFile[-urlPath]'
  'Home-index',
  'Verse',
  'Listing',
  'Notifications',
  'LocationSetup',
  'About',
  'Error404-*', // must be last!
]

const routeInfoList = names.map(function (n) {
  var parts = n.split('-');
  var vueName = parts[0];
  var path = parts.length > 1 ? parts[1] : vueName.toLowerCase();

  return {
    component: Vue.component(vueName, require(`${folder}${vueName}.vue`)),
    name: vueName,
    path: path
  }
})

export default {
  raw: routeInfoList.map(function (ri) {
    return {
      component: ri.component,
      path: '/' + ri.path
    }
  }),
  menuPages: routeInfoList
    .filter(function (ri) {
      let data = ri.component.options.data()
      return !data.hideFromMenu
    })
    .map(function (ri, i) {
      let data = ri.component.options.data()
      return {
        to: ri.path,
        text: data.title,
        index: '' + i
      }
    })
}

// function load (component) {
//   return () => System.import(`components/${component}.vue`)
// }
