import { createRouter, createWebHashHistory } from 'vue-router'
import routeList from './pages/routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes: routeList.raw
})

export default router
