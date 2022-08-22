import { hasPrefix, longestCommonPrefix, search } from './utils'

export type WalkFn<TValue> = (key: string, value: TValue) => boolean

export class LeafNode<TValue = any> {
  key: string
  value: TValue

  constructor(key: string, value: TValue) {
    this.key = key
    this.value = value
  }
}

export class RadixEdge<TValue = any> {
  label: string
  node: RadixNode<TValue> | null

  constructor() {
    this.label = ''
    this.node = null
  }
}

export class RadixNode<TValue = any> {
  leaf: LeafNode<TValue> | null
  prefix: string
  edges: RadixEdge<TValue>[]

  constructor() {
    this.leaf = null
    this.prefix = ''
    this.edges = []
  }

  isLeaf(): boolean {
    return this.leaf !== null
  }

  addEdge(e: RadixEdge<TValue>) {
    const n = this.edges.length
    const idx = search(n, (i) => this.edges[i].label.localeCompare(e.label) !== -1)
    this.edges = [...this.edges.slice(0, idx), e, ...this.edges.slice(idx)]
  }

  updateEdge(label: string, node: RadixNode<TValue>) {
    const n = this.edges.length
    const idx = search(n, (i) => this.edges[i].label.localeCompare(label) !== -1)
    if (idx < n && this.edges[idx].label === label) {
      this.edges[idx].node = node
    }
  }

  getEdge(label: string): RadixNode<TValue> | null {
    const n = this.edges.length
    const idx = search(n, (i) => this.edges[i].label.localeCompare(label) !== -1)
    if (idx < n && this.edges[idx].label === label) {
      return this.edges[idx].node
    }

    return null
  }

  deleteEdge(label: string) {
    const n = this.edges.length
    const idx = search(n, (i) => this.edges[i].label.localeCompare(label) !== -1)
    if (idx < n && this.edges[idx].label === label) {
      this.edges = [...this.edges.slice(0, idx), ...this.edges.slice(idx + 1)]
    }
  }

  mergeChild() {
    const e = this.edges[0]
    const child = e.node
    this.prefix = this.prefix + child!.prefix
    this.leaf = child!.leaf
    this.edges = child!.edges
  }
}

export class RadixTree<TValue> {
  root: RadixNode<TValue>
  size: number

  constructor() {
    this.root = new RadixNode()
    this.size = 0
  }

  length() {
    return this.size
  }

  put(key: string, value: TValue): this {
    let parent: RadixNode | null = null
    let n: RadixNode | null = this.root
    let search = key
    for (;;) {
      // Check key for exhaustion
      if (search.length === 0) {
        if (n!.isLeaf()) {
          n!.leaf!.value = value
          return this
        }
        n!.leaf = new LeafNode(key, value)
        this.size++
        return this
      }

      parent = n
      n = n!.getEdge(search.charAt(0))

      if (n === null) {
        const node = new RadixNode()
        node.leaf = new LeafNode(key, value)
        node.prefix = search
        const e = new RadixEdge()
        e.label = search.charAt(0)
        e.node = node
        parent?.addEdge(e)
        this.size++

        return this
      }

      const commonPrefix = longestCommonPrefix(search, n.prefix)
      if (commonPrefix === n.prefix.length) {
        search = search.slice(commonPrefix)
        continue
      }

      // Split the node
      this.size++
      const child = new RadixNode()
      child.prefix = search.slice(0, commonPrefix)
      parent.updateEdge(search.charAt(0), child)

      const e = new RadixEdge()
      e.label = n.prefix.charAt(commonPrefix)
      e.node = n
      child.addEdge(e)
      n.prefix = n.prefix.slice(commonPrefix)

      // Create new leaf node
      const leaf = new LeafNode(key, value)

      search = search.slice(commonPrefix)
      if (search.length === 0) {
        child.leaf = leaf
        return this
      }

      // Create new edge for the node
      const node = new RadixNode()
      node.leaf = leaf
      node.prefix = search
      const e1 = new RadixEdge()
      e1.label = search.charAt(0)
      e1.node = node
      child.addEdge(e1)

      return this
    }
  }

  get(key: string): TValue | null {
    let n: RadixNode | null = this.root
    let search = key
    for (;;) {
      // Check for key exhaustion
      if (search.length === 0) {
        if (n!.isLeaf()) {
          return n!.leaf!.value
        }
        break
      }

      // Look for an edge
      n = n!.getEdge(search.charAt(0))
      if (n === null) {
        break
      }

      // Consume the search prefix
      if (hasPrefix(search, n.prefix)) {
        search = search.slice(n.prefix.length)
      } else {
        break
      }
    }

    return null
  }

  delete(key: string): TValue | null {
    let parent: RadixNode | null = null
    let n: RadixNode | null = this.root
    let search = key
    let label = ''

    for (;;) {
      if (search.length === 0) {
        if (!n.isLeaf()) {
          break
        }
        /* Delete leaf */
        const leaf = n.leaf
        n.leaf = null
        this.size--

        if (parent !== null && n.edges.length === 0) {
          parent.deleteEdge(label)
        }

        if (n !== this.root && n.edges.length === 1) {
          n.mergeChild()
        }

        if (
          parent !== null &&
          parent !== this.root &&
          parent.edges.length === 1 &&
          !parent.isLeaf()
        ) {
          parent.mergeChild()
        }

        return leaf?.value
      }

      parent = n
      label = search.charAt(0)
      n = n!.getEdge(label)
      if (n === null) {
        break
      }

      if (hasPrefix(search, n.prefix)) {
        search = search.slice(n.prefix.length)
      } else {
        break
      }
    }

    return null
  }

  has(key: string): boolean {
    let n: RadixNode | null = this.root
    let search = key

    for (;;) {
      if (search.length === 0) {
        if (n.isLeaf()) {
          return true
        }
        break
      }
      n = n!.getEdge(search.charAt(0))
      if (n === null) {
        break
      }

      if (hasPrefix(search, n.prefix)) {
        search = search.slice(n.prefix.length)
      } else {
        break
      }
    }

    return false
  }

  walkPrefix(prefix: string, walkFn: WalkFn<TValue>) {
    let n: RadixNode | null = this.root
    let search = prefix

    for (;;) {
      if (search.length === 0) {
        this._recursiveWalk(n, walkFn)
        return
      }

      n = n!.getEdge(search.charAt(0))
      if (n === null) {
        break
      }

      if (hasPrefix(search, n.prefix)) {
        search = search.slice(n.prefix.length)
      } else if (hasPrefix(n.prefix, search)) {
        this._recursiveWalk(n, walkFn)
        return
      } else {
        break
      }
    }
  }

  walk(walkFn: WalkFn<TValue>) {
    this._recursiveWalk(this.root, walkFn)
  }

  private _recursiveWalk(n: RadixNode<TValue>, walkFn: WalkFn<TValue>): boolean {
    if (n.isLeaf() && walkFn(n.leaf!.key, n.leaf!.value)) {
      return true
    }

    for (let e of n.edges) {
      if (this._recursiveWalk(e.node!, walkFn)) {
        return true
      }
    }

    return false
  }
}
