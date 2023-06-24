import { createMemoryHistory, createRouter } from 'vue-router'
import { useLogStore } from '@/stores/log-store'

const routeOptions = {
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('../views/welcome.vue'),
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('../views/play.vue'),
    },
    {
      path: '/end',
      name: 'end',
      component: () => import('../views/end.vue'),
    },
  ],
}

const index = createRouter(routeOptions)

index.beforeEach((to) => {
  if (to.name !== 'welcome') {
    const logStore = useLogStore()
    if (!logStore.loaded) {
      return {name: 'welcome'}
    }
  }
  return true
})

export default index
