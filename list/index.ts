export class Element<T = unknown> {
  next: Element<T> | null
  prev: Element<T> | null
  list: List<T> | null
  value: T | null

  constructor(value: T | null = null) {
    this.next = null
    this.prev = null
    this.list = null
    this.value = value
  }

  getNext(): Element<T> | null {
    let p = this.next
    if (this.list !== null && p !== this.list.root) {
      return p
    }

    return null
  }

  getPrev(): Element<T> | null {
    let p = this.prev
    if (this.list !== null && p !== this.list.root) {
      return p
    }

    return null
  }
}

export class ListIterator<T> implements Iterator<Element<T>> {
  list: List<T>
  current: Element<T> | null

  constructor(list: List<T>) {
    this.list = list
    this.current = list.front()
  }

  next(): IteratorResult<Element<T>> {
    const e = this.current

    if (e === null) {
      return { value: null, done: true }
    }

    this.current = e.getNext()

    return { value: e, done: false }
  }
}

export class List<T = unknown> {
  root: Element<T>
  size: number

  constructor() {
    this.root = new Element()
    this.root.next = this.root
    this.root.prev = this.root
    this.size = 0
  }

  length(): number {
    return this.size
  }

  private _insert(e: Element<T>, at: Element<T>) {
    e.next = at.next
    e.prev = at
    e.prev.next = e
    e.next!.prev = e
    e.list = this
    this.size++

    return e
  }

  private _remove(e: Element<T>) {
    e.prev!.next = e.next
    e.next!.prev = e.prev
    e.next = null
    e.prev = null
    e.list = null
    this.size--

    return
  }

  private _move(e: Element<T>, at: Element<T>) {
    if (e === at) {
      return
    }
    e.prev!.next = e.next
    e.next!.prev = e.prev

    e.next = at.next
    e.prev = at
    e.prev.next = e
    e.next!.prev = e
  }

  private _insertValue(value: T, at: Element<T>): Element<T> {
    return this._insert(new Element(value), at)
  }

  front(): Element<T> | null {
    if (this.size === 0) {
      return null
    }

    return this.root.next
  }

  back(): Element<T> | null {
    if (this.size === 0) {
      return null
    }

    return this.root.prev
  }

  pushFront(value: T): Element<T> {
    return this._insertValue(value, this.root!)
  }

  pushBack(value: T): Element<T> {
    return this._insertValue(value, this.root.prev!)
  }

  insertBefore(value: T, mark: Element<T>): Element<T> | null {
    if (this !== mark.list) {
      return null
    }

    return this._insertValue(value, mark.prev!)
  }

  insertAfter(value: T, mark: Element<T>): Element<T> | null {
    if (this !== mark.list) {
      return null
    }

    return this._insertValue(value, mark)
  }

  remove(e: Element<T>): T {
    if (this === e.list) {
      this._remove(e)
    }

    return e.value!
  }

  moveToFront(e: Element<T>) {
    if (this !== e.list || this.root.next === e) {
      return
    }
    this._move(e, this.root)
  }

  moveToBack(e: Element<T>) {
    if (this !== e.list || this.root.prev === e) {
      return
    }
    this._move(e, this.root.prev!)
  }

  moveBefore(e: Element<T>, mark: Element<T>) {
    if (this !== e.list || e === mark || this !== mark.list) {
      return
    }
    this._move(e, mark.prev!)
  }

  moveAfter(e: Element<T>, mark: Element<T>) {
    if (this !== e.list || e === mark || this !== mark.list) {
      return
    }
    this._move(e, mark)
  }

  [Symbol.iterator](): ListIterator<T> {
    return new ListIterator(this)
  }
}
