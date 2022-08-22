import { createReadStream } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline/promises'

import { RadixTree } from '.'
import { getEditDistance } from './utils'

function loadWords(radixTree: RadixTree<string>) {
  const readline = createInterface({
    input: createReadStream(join(__dirname, 'words.txt')),
  })

  readline.on('line', (input) => {
    radixTree.put(input, input)
  })

  return new Promise(function (resolve, reject) {
    readline.on('close', resolve)
    readline.on('SIGINT', reject)
  })
}

;(async function () {
  const radixTree = new RadixTree<string>()
  await loadWords(radixTree)
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  readline.on('SIGINT', readline.close)
  for (;;) {
    const search = await readline.question('Search for:')
    const results: string[] = []
    radixTree.walkPrefix(search, (key) => {
      if (getEditDistance(search, key) <= 3) {
        results.push(key)
      }
      return results.length > 9
    })
    console.log(results)
  }
})()
