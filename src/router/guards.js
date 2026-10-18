import { useAuthStore } from '@/stores/auth'

export async function requireAuth(to, from) {
  const authStore = useAuthStore()

  // If already have user, allow
  if (authStore.isAuthenticated) {
    return true
  }

  // Try to fetch user from server (validates cookie)
  try {
    await authStore.fetchMe()
    return true
  } catch {
    // Not authenticated, redirect to login with redirect path
    return { name: 'login', query: { redirect: to.fullPath } }
  }
}

export async function guestOnly(to, from) {
  const authStore = useAuthStore()

  // If not authenticated, allow
  if (!authStore.isAuthenticated) {
    return true
  }

  // Try to verify session
  try {
    await authStore.fetchMe()
    // Already logged in, redirect to lobby or intended page
    return { name: 'lobby' }
  } catch {
    // Session invalid, allow access to guest pages
    return true
  }
}

export async function optionalAuth(to, from) {
  const authStore = useAuthStore()

  // Try to restore session but don't block navigation
  if (!authStore.isAuthenticated) {
    try {
      await authStore.fetchMe()
    } catch {
      // Ignore, continue as guest
    }
  }
  return true
}