const activePointers = { left: new Set(), right: new Set() }
const lastTapAt = { left: Number.NEGATIVE_INFINITY, right: Number.NEGATIVE_INFINITY }
let pendingDash = null

export function pressTouchDirection(direction, pointerId) {
  const pointers = activePointers[direction]
  if (!pointers || pointers.has(pointerId)) return

  if (pointers.size === 0) {
    const now = performance.now()
    if (now - lastTapAt[direction] <= 300) pendingDash = direction
    lastTapAt[direction] = now
  }

  pointers.add(pointerId)
}

export function releaseTouchDirection(direction, pointerId) {
  activePointers[direction]?.delete(pointerId)
}

export function isTouchDirectionDown(direction) {
  return Boolean(activePointers[direction]?.size)
}

export function consumeTouchDash(direction) {
  if (pendingDash !== direction) return false
  pendingDash = null
  return true
}

export function clearTouchControls() {
  activePointers.left.clear()
  activePointers.right.clear()
  lastTapAt.left = Number.NEGATIVE_INFINITY
  lastTapAt.right = Number.NEGATIVE_INFINITY
  pendingDash = null
}
