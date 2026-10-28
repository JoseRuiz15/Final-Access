import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, guestOnly, optionalAuth } from './guards'

import { setGameMusicActive } from '@/game/services/GameMusic.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      beforeEnter: optionalAuth,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: guestOnly,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: guestOnly,
    },
    {
      path: '/codeverification',
      name: 'codeverification',
      component: () => import('../views/CodeVerificationView.vue'),
      beforeEnter: guestOnly,
    },
    {
      path: '/gamemode',
      name: 'gamemode',
      component: () => import('../views/GameModeView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('../views/LobbyView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/characters',
      name: 'characters',
      component: () => import('../views/CharactersView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/levels',
      name: 'levels',
      component: () => import('../views/LevelsView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/multiplayer',
      name: 'multiplayer',
      component: () => import('../views/MultiplayerView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/store',
      name: 'store',
      component: () => import('../views/StoreView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('../views/CreateView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/loading',
      name: 'loading',
      component: () => import('../views/LoadingScene.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/mission',
      name: 'mission',
      component: () => import('../views/MissionView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/level-summary',
      name: 'level-summary',
      component: () => import('../views/LevelSummaryView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue'),
      beforeEnter: requireAuth,
    },
  ],
})

// Descarga y decodifica el fondo antes de cambiar de pantalla para evitar que
// el usuario vea un fondo vacío mientras el componente termina de montarse.
const routeBackgrounds = {
  home: '/img/lobby/fondoinicio.webp',
  login: '/img/lobby/sesion.webp',
  register: '/img/lobby/sesion.webp',
  codeverification: '/img/lobby/sesion.webp',
  gamemode: '/img/lobby/a.webp',
  lobby: '/img/lobby/lobby2.webp',
  characters: '/img/lobby/lobby2.webp',
  store: '/img/lobby/lobby2.webp',
  levels: '/img/map/mapa.webp',
  multiplayer: '/img/multy-player/partida.webp',
  create: '/img/multy-player/partida.webp',
  loading: '/img/present/loadingscene.webp',
  mission: '/img/present/loadingscene.webp',
  'level-summary': '/img/lobby/pantalla_resumen.webp',
}
const backgroundPromises = new Map()
const loadedBackgrounds = new Set()

function preloadBackground(url) {
  if (!url || typeof window === 'undefined' || loadedBackgrounds.has(url)) {
    return Promise.resolve()
  }
  if (backgroundPromises.has(url)) return backgroundPromises.get(url)

  const image = new Image()
  image.fetchPriority = 'high'
  image.decoding = 'async'

  const loading = new Promise((resolve) => {
    let settled = false
    const timeout = window.setTimeout(() => finish(false), 5000)
    const finish = (loaded) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      if (loaded) loadedBackgrounds.add(url)
      else backgroundPromises.delete(url)
      resolve()
    }

    image.onload = () => {
      image.decode?.().then(() => finish(true)).catch(() => finish(true))
    }
    image.onerror = () => finish(false)
    image.src = url
    if (image.complete && image.naturalWidth > 0) image.onload()
  })

  backgroundPromises.set(url, loading)
  return loading
}

router.beforeResolve((to) => preloadBackground(routeBackgrounds[to.name]))

router.afterEach((to) => {
  setGameMusicActive(to.name === 'game')
})

export default router
