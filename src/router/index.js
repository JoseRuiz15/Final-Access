import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, guestOnly, optionalAuth } from './guards'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import GameModeView from '../views/GameModeView.vue'
import CodeVerificationView from '../views/CodeVerificationView.vue'
import LobbyView from '../views/LobbyView.vue'
import CharactersView from '../views/CharactersView.vue'
import LevelsView from '../views/LevelsView.vue'
import MultiplayerView from '../views/MultiplayerView.vue'
import StoreView from '@/views/StoreView.vue'
import CreateView from '@/views/CreateView.vue'
import LoadingScene from '@/views/LoadingScene.vue'
import MissionView from '@/views/MissionView.vue'
import GameView from '@/views/GameView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: optionalAuth,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: guestOnly,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      beforeEnter: guestOnly,
    },
    {
      path: '/codeverification',
      name: 'codeverification',
      component: CodeVerificationView,
      beforeEnter: guestOnly,
    },
    {
      path: '/gamemode',
      name: 'gamemode',
      component: GameModeView,
      beforeEnter: requireAuth,
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView,
      beforeEnter: requireAuth,
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharactersView,
      beforeEnter: requireAuth,
    },
    {
      path: '/levels',
      name: 'levels',
      component: LevelsView,
      beforeEnter: requireAuth,
    },
    {
      path: '/multiplayer',
      name: 'multiplayer',
      component: MultiplayerView,
      beforeEnter: requireAuth,
    },
    {
      path: '/store',
      name: 'store',
      component: StoreView,
      beforeEnter: requireAuth,
    },
    {
      path: '/create',
      name: 'create',
      component: CreateView,
      beforeEnter: requireAuth,
    },
    {
      path: '/loading',
      name: 'loading',
      component: LoadingScene,
      beforeEnter: requireAuth,
    },
    {
      path: '/mission',
      name: 'mission',
      component: MissionView,
      beforeEnter: requireAuth,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
      beforeEnter: requireAuth,
    },
  ],
})

export default router
