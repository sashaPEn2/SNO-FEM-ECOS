import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Pages
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Events from '../pages/Events.vue'
import EventDetail from '../pages/EventDetail.vue'
import Profile from '../pages/Profile.vue'
import MyEvents from '../pages/MyEvents.vue'
import Rewards from '../pages/Rewards.vue'
import Leaderboard from '../pages/Leaderboard.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: { title: 'Главная' }
  },
  {
    path: '/login',
    component: Login,
    meta: { title: 'Вход' }
  },
  {
    path: '/register',
    component: Register,
    meta: { title: 'Регистрация' }
  },
  {
    path: '/events',
    component: Events,
    meta: { title: 'Мероприятия' }
  },
  {
    path: '/events/:id',
    component: EventDetail,
    meta: { title: 'Событие' }
  },
  {
    path: '/profile',
    component: Profile,
    meta: { requiresAuth: true, title: 'Профиль' }
  },
  {
    path: '/my-events',
    component: MyEvents,
    meta: { requiresAuth: true, title: 'Мои мероприятия' }
  },
  {
    path: '/rewards',
    component: Rewards,
    meta: { requiresAuth: true, title: 'Награды' }
  },
  {
    path: '/leaderboard',
    component: Leaderboard,
    meta: { title: 'Рейтинг' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
