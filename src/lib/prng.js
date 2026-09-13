// Deterministic pseudo-random utilities — used to generate stable, realistic
// district/asset intelligence that never changes between reloads.

export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32 PRNG — fast, deterministic
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rng(seedStr) {
  return mulberry32(hashString(seedStr))
}

// random in [lo, hi]
export function rand(seedStr, lo = 0, hi = 1) {
  return lo + rng(seedStr)() * (hi - lo)
}

export function randInt(seedStr, lo, hi) {
  return Math.round(rand(seedStr, lo, hi))
}

// pick from an array deterministically
export function pick(seedStr, arr) {
  return arr[Math.floor(rng(seedStr)() * arr.length)]
}