export type Less<T> = (a: Array<T>, i: number, j: number) => boolean

export class HeapIterator<T> implements Iterator<T> {
  heap: Heap<T>
  size: number

  constructor(heap: Heap<T>) {
    this.heap = heap
    this.size = heap.length()
  }

  next(): IteratorResult<T> {
    if (this.size > 0) {
      this.size--
      return { value: this.heap.top()!, done: false }
    }

    return { value: null, done: true }
  }
}

export class Heap<T> {
  private h: Array<T | null>
  private size: number
  private capacity: number
  private less: Less<T>

  constructor(less: Less<T>, capacity: number = 10) {
    this.h = Array.from<T | null>({ length: capacity }).fill(null)
    this.size = 0
    this.capacity = capacity
    this.less = less
  }

  length(): number {
    return this.size
  }

  peak(): T | null {
    assertNonEmpty(this.size)
    return this.h[0]
  }

  top(): T | null {
    assertNonEmpty(this.size)
    return this.remove()
  }

  add(elem: T): void {
    if (this.size === this.h.length) {
      this.resize(this.size * 2)
      this.capacity *= 2
    }
    this.h[this.size] = elem
    this.size++
    this.up(this.size - 1)
  }

  remove(i = 0): T | null {
    const n = this.size - 1
    if (n != i) {
      ;[this.h[i], this.h[n]] = [this.h[n], this.h[i]] // swap
      if (!this.down(i, n)) {
        this.up(i)
      }
    }
    const elem = this.h[n]
    this.h[n] = null
    this.size--
    return elem
  }

  private resize(capacity: number) {
    const temp = Array.from<T | null>({ length: capacity })
    for (let i = 0; i < capacity; i++) {
      temp[i] = this.h[i]
    }
    this.h = temp
  }

  private up(i: number): void {
    for (;;) {
      const j = Math.floor((i - 1) / 2) // parent index
      if (j < 0 || !this.less(<Array<T>>this.h, i, j)) break
      ;[this.h[i], this.h[j]] = [this.h[j], this.h[i]] // swap
      i = j
    }
  }

  private down(i0: number, n: number): boolean {
    let i = i0
    for (;;) {
      const j1 = 2 * i + 1 // left child index
      if (j1 >= n || j1 < 0) break
      let j = j1 // set j as left child
      const j2 = j1 + 1 // or 2 * i + 1 right child
      if (j2 < n && this.less(<Array<T>>this.h, j2, j1)) {
        j = j2
      }
      if (!this.less(<Array<T>>this.h, j, i)) break
      ;[this.h[i], this.h[j]] = [this.h[j], this.h[i]] // swap
      i = j
    }

    return i > i0
  }

  [Symbol.iterator](): HeapIterator<T> {
    return new HeapIterator(this)
  }
}

export function assertNonEmpty(size: number) {
  if (size === 0) {
    throw new Error('Heap is empty')
  }
}
