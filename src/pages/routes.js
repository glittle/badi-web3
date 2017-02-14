import Vue from 'vue'
var folder = './'

// import Home from './pages/Home'
// import Listing from './pages/Listing'
// import Verse from './pages/Verse'
// import UserSetup from './pages/UserSetup'

const names = [
  // this is their order in the menus
  // name, path [=name], group [='main']
  {
    name: 'Home',
    path: '/',
    group: 'main'
  }, {
    name: 'Listing',
    group: 'main'
  }, {
    name: 'Verse',
    group: 'main'
  }, {
    name: 'Notifications',
    group: 'setup'
  }, {
    name: 'LocationSetup',
    group: 'setup'
  }, {
    name: 'OtherSetup',
    group: ['setup', 'initial']
  }, {
    name: 'About',
    group: 'setup'
  }, {
    name: 'InitialSetup',
    group: 'setup'
  }, {
    name: 'Error404', // must be last!
    path: '*',
    group: 'hidden'
  },
]

const routeInfoList = names.map(function (n) {
  var vueName = n.name || n;
  var path = n.path || vueName.toLowerCase();
  var group = n.group || '';

  return {
    component: Vue.component(vueName, require(`${folder}${vueName}.vue`)),
    name: vueName,
    path: path,
    group: group
  }
})

const menuPages = routeInfoList
  .filter(function (ri) {
    return !ri.group.includes('hidden');
  })
  .map(function (ri, i) {
    let data = ri.component.options.data()
    return {
      to: ri.path,
      text: data.title,
      icon: data.icon,
      index: '' + i,
      name: ri.name,
      group: ri.group
    }
  });

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
      path: '/' + ri.path,
      name: ri.name
    }
  }),
  menuPages: menuPages,
  getNext: getNext
}

// function load (component) {
//   return () => System.import(`components/${component}.vue`)
// }
