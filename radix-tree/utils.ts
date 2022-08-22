export function longestCommonPrefix(k1: string, k2: string) {
  let i
  for (i = 0; i < Math.min(k1.length, k2.length); i++) {
    if (k1.charAt(i) !== k2.charAt(i)) break
  }

  return i
}

export function hasPrefix(s: string, prefix: string): boolean {
  return s.length >= prefix.length && s.slice(0, prefix.length) === prefix
}

/**
 * Search uses binary search to find and return the smallest index i
 * in [0, n) at which f(i) is true, assuming that on the range [0, n),
 */
export function search(n: number, predicate: (i: number) => boolean): number {
  let i = 0
  let j = n
  while (i < j) {
    const k = i + Math.floor((j - i) / 2)
    if (!predicate(k)) {
      i = i + 1
    } else {
      j = k
    }
  }

  return i
}

// Levenshtein distance
export function getEditDistance(lhs: string, rhs: string): number {
  if (lhs.length === 0) {
    return rhs.length
  }
  if (rhs.length === 0) {
    return lhs.length
  }

  const distance: number[][] = Array.from<number[]>({ length: lhs.length + 1 }).map(
    () => Array.from<number>({ length: rhs.length + 1 }).fill(0)
  )

  for (let i = 0; i <= lhs.length; i++) {
    distance[i][0] = i
  }

  for (let j = 1; j <= rhs.length; j++) {
    distance[0][j] = j
  }

  for (let i = 1; i <= lhs.length; i++) {
    for (let j = 1; j <= rhs.length; j++) {
      distance[i][j] = Math.min(
        Math.min(
          distance[i - 1][j] + 1, // // deletion
          distance[i][j - 1] + 1 // insertion
        ),
        distance[i - 1][j - 1] + (lhs.charAt(i - 1) === rhs.charAt(j - 1) ? 0 : 1) // substitution
      )
    }
  }

  return distance[lhs.length][rhs.length]
}
