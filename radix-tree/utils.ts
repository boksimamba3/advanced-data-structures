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
