import { Element, List, ListIterator } from '../list'

export class LRUCacheEntry<TValue, TKey extends PropertyKey> {
  readonly key: TKey
  value: TValue

  constructor(value: TValue, key: TKey) {
    this.value = value
    this.key = key
  }
}

export class LRUCache<TValue, TKey extends PropertyKey>
  implements Iterable<LRUCacheEntry<TValue, TKey>>
{
  maxSize: number
  hashTable: Map<TKey, Element<LRUCacheEntry<TValue, TKey>>>
  list: List<LRUCacheEntry<TValue, TKey>>

  constructor(maxSize: number) {
    this.maxSize = maxSize
    this.hashTable = new Map()
    this.list = new List()
  }

  size(): number {
    return this.hashTable.size
  }

  set(key: TKey, value: TValue): boolean {
    if (this.hashTable.has(key)) {
      const e = this.hashTable.get(key)!
      e.value!.value = value
      this.list.moveToFront(e)

      return false
    } else if (this.list.length() >= this.maxSize) {
      const e = this.list.back()!
      this.list.remove(e)
      this.hashTable.delete(e.value!.key)
    }
    const e = this.list.pushFront(new LRUCacheEntry(value, key))
    this.hashTable.set(key, e)

    return true
  }

  get(key: TKey): TValue | null {
    const e = this.hashTable.get(key)
    if (e === undefined) {
      return null
    }

    this.list.moveToFront(e)

    return e.value!.value
  }

  peek(key: TKey): TValue | null {
    const e = this.hashTable.get(key)
    if (e === undefined) {
      return null
    }

    return e.value!.value
  }

  [Symbol.iterator](): Iterator<LRUCacheEntry<TValue, TKey>> {
    return new ListIterator(this.list)
  }
}
