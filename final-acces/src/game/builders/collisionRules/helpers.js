export function toArray(collection) {
  if (!collection) return []
  if (typeof collection.getChildren === 'function') return collection.getChildren()
  if (Array.isArray(collection)) return collection
  return []
}