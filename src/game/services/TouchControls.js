const activePointers = { left: new Set(), right: new Set() }
const activeActions = { jump: new Set(), attack: new Set(), interact: new Set(), dropKey: new Set() }
const pendingActionPresses = new Set()
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

export function pressTouchAction(action, pointerId) {
  const pointers = activeActions[action]
  if (!pointers || pointers.has(pointerId)) return
  if (pointers.size === 0) pendingActionPresses.add(action)
  pointers.add(pointerId)
}

export function releaseTouchAction(action, pointerId) {
  activeActions[action]?.delete(pointerId)
}

export function isTouchActionDown(action) {
  return Boolean(activeActions[action]?.size)
}

export function consumeTouchActionPress(action) {
  if (!pendingActionPresses.has(action)) return false
  pendingActionPresses.delete(action)
  return true
}

export function clearTouchControls() {
  activePointers.left.clear()
  activePointers.right.clear()
  Object.values(activeActions).forEach((pointers) => pointers.clear())
  pendingActionPresses.clear()
  lastTapAt.left = Number.NEGATIVE_INFINITY
  lastTapAt.right = Number.NEGATIVE_INFINITY
  pendingDash = null
}
