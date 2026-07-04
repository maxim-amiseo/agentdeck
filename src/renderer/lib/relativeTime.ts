export function relativeTime(ms: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  if (diffSec < 60) return 'à l’instant'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  const diffJ = Math.floor(diffH / 24)
  if (diffJ < 7) return `il y a ${diffJ} j`
  return new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function uniqueName(base: string, taken: Set<string>): string {
  let name = base
  let n = 2
  while (taken.has(name.toLowerCase())) {
    name = `${base} ${n}`
    n++
  }
  return name
}
