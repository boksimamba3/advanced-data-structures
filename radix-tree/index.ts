import { hasPrefix, longestCommonPrefix, search } from './utils'

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

  getEdge(label: string) {
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
    let parent: RadixNode | null
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
      e.label = n.prefix[commonPrefix]
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

  delete(key: string): boolean {
    throw new Error('Method not implemented.')
  }
  contains(key: string): boolean {
    throw new Error('Method not implemented.')
  }
  longestPrefix(key: string): string {
    throw new Error('Method not implemented.')
  }
  keysStartingWith(prefix: string): string[] {
    throw new Error('Method not implemented.')
  }
}

const radix = new RadixTree()
radix.put('Boris', 10)
radix.put('Bos', 5)
//console.log(JSON.stringify(radix, null, 2))

console.log(radix.get('Bo'))
