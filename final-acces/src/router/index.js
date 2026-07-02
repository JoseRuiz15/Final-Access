import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import GameModeView from '../views/GameModeView.vue'
import CodeVerificationView from '../views/CodeVerificationView.vue'
import LobbyView from '../views/LobbyView.vue'
import CharactersView from '../views/CharactersView.vue'
import MultiplayerView from '../views/MultiplayerView.vue'
import StoreView from '@/views/StoreView.vue'
import CreateView from '@/views/CreateView.vue'

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
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharactersView
    },
    {
      path: '/multiplayer',
      name: 'multiplayer',
      component: MultiplayerView
    },
    {
    path: '/store',
    name: 'store',
    component: StoreView
    },
    {
    path: '/create',
    name: 'create',
    component: CreateView
    }
  ]
})

export default router
