import Vue from 'vue'
var folder = './'

// import Home from './pages/Home'
// import Listing from './pages/Listing'
// import Verse from './pages/Verse'
// import UserSetup from './pages/UserSetup'

const names = [
  // this is their order in the menus
  // 'NameOfVueFile[-urlPath]'
  'Home-/',
  'Verse',
  'Listing',
  'Notifications',
  'LocationSetup',
  'OtherSetup',
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

const menuItems = routeInfoList
  .filter(function (ri) {
    let data = ri.component.options.data()
    return !data.hideFromMenu
  })

const menuPages = menuItems
  .map(function (ri, i) {
    let data = ri.component.options.data()
    return {
      to: ri.path,
      text: data.title,
      icon: data.icon,
      index: '' + i,
      name: ri.name
    }
  });

var namedPages = {}
menuPages.filter(function (mp) {
  namedPages[mp.name] = mp
})

function getNext(delta, currentRoute) {
  if (!currentRoute.matched.length) {
    return null;
  }

  var path = currentRoute.matched[0].path.substring(1) || '/';
  // console.log(`current: "${path}"`)
  var desired = -1;

  for (var i = 0; i < menuPages.length; i++) {
    // console.log('check: ' + menuPages[i].to)
    if (path === menuPages[i].to) {
      desired = i + delta;
      break;
    }
  }
  if (desired >= 0 && desired < menuPages.length) {
    return menuPages[desired].to
  }
  return null;
}

export default {
  raw: routeInfoList.map(function (ri) {
    return {
      component: ri.component,
      path: '/' + ri.path
    }
  }),
  menuPages: menuPages,
  named: namedPages,
  getNext: getNext
}

// function load (component) {
//   return () => System.import(`components/${component}.vue`)
// }
