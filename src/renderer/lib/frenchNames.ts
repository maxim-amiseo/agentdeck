const FRENCH_FIRST_NAMES = [
  'Camille', 'Julien', 'Margaux', 'Antoine', 'Léa', 'Hugo', 'Manon', 'Théo',
  'Chloé', 'Nathan', 'Inès', 'Lucas', 'Louise', 'Gabriel', 'Emma', 'Maxime',
  'Jade', 'Adrien', 'Zoé', 'Mathis', 'Clara', 'Baptiste', 'Alice', 'Enzo',
  'Juliette', 'Noah', 'Lola', 'Arthur', 'Sarah', 'Paul', 'Océane', 'Tom',
  'Louna', 'Raphaël', 'Anaïs', 'Victor', 'Eva', 'Simon', 'Rose', 'Léo',
  'Mila', 'Nolan', 'Agathe', 'Basile', 'Iris', 'Gaspard', 'Nina', 'Marius',
  'Capucine', 'Oscar'
] as const

export function randomFrenchName(taken: Set<string>): string {
  const available = FRENCH_FIRST_NAMES.filter((n) => !taken.has(n.toLowerCase()))
  const pool = available.length > 0 ? available : FRENCH_FIRST_NAMES
  const base = pool[Math.floor(Math.random() * pool.length)]

  if (!taken.has(base.toLowerCase())) return base

  let n = 2
  while (taken.has(`${base} ${n}`.toLowerCase())) n++
  return `${base} ${n}`
}
