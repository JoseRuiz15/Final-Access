import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import GameModeView from '../views/GameModeView.vue'
import CodeVerificationView from '../views/CodeVerificationView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/gamemode',
      name: 'gamemode',
      component: GameModeView
    },
    {
      path: '/codeverification',
      name: 'codeverification',
      component: CodeVerificationView
    }
  ]
})

export default router