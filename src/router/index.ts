import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import ScannPage from '../views/Scann.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/scann'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/scann',
    name: 'Scann',
    component: ScannPage
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
