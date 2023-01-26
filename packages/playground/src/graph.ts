import G6 from '@antv/g6'
import { Bucket, Effect, Key, pack, store, Target } from '@euv/react'
import { EdgeConfig, NodeConfig, TreeGraphData } from '@antv/g6-core/es/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * format the string
 * @param {string} str The origin string
 * @param {number} maxWidth max width
 * @param {number} fontSize font size
 * @return {string} the processed result
 */
function fittingString(
  str: string,
  maxWidth: number,
  fontSize: number
): string {
  let currentWidth = 0
  let res = str
  const pattern = new RegExp('[\u4E00-\u9FA5]+') // distinguish the Chinese charactors and letters

  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth) return

    if (pattern.test(letter)) {
      // Chinese charactors
      currentWidth += fontSize
    } else {
      // get the width of single letter according to the fontSize
      currentWidth += G6.Util.getLetterWidth(letter, fontSize)
    }

    if (currentWidth > maxWidth) {
      const left = str.substring(0, i)
      const right = str.substring(i)

      res = `${left}\n${right}`
    }
  })

  return res
}

const globalFontSize = 12
const storeNode: NodeConfig = {
  id: uuidv4(),
  label: '🏪store',
  style: {
    stroke: '#000'
  }
}
const nodes: NodeConfig[] = [storeNode]
const edges: EdgeConfig[] = []
const data: TreeGraphData = {
  id: uuidv4(),
  nodes: nodes,
  edges: edges
}

function addEffects(key: Key, bucket: Bucket, keyNode: NodeConfig) {
  const effects = bucket.get(key)

  if (effects) {
    for (const effect of effects) {
      edges.push({
        source: keyNode.id,
        target: effect.id
      })
    }
  }
}

function addKey(key: Key, bucket: Bucket, targetNode: NodeConfig) {
  const label = `🔑${String(key)}`
  const keyNode: NodeConfig = {
    id: uuidv4(),
    label: label,
    style: {
      stroke: '#F7B500'
    }
  }

  nodes.push(keyNode)
  addEffects(key, bucket, keyNode)
  edges.push({
    source: targetNode.id,
    target: keyNode.id
  })
}

function addKeys(target: Target, targetNode: NodeConfig) {
  const bucket = store.get(target)

  if (bucket) {
    const keys = [...bucket.keys()]

    for (const key of keys) {
      addKey(key, bucket, targetNode)
    }
  }
}

function addTarget(target: Target) {
  const text = fittingString(JSON.stringify(target), 100, globalFontSize)
  const label = `🪣${text}`
  const targetNode: NodeConfig = {
    id: uuidv4(),
    label: label,
    style: {
      stroke: '#32C5FF'
    }
  }

  nodes.push(targetNode)
  addKeys(target, targetNode)
  edges.push({
    source: storeNode.id,
    target: targetNode.id
  })
}

function addTargets() {
  const targets: Target[] = [...store.keys()]

  for (const target of targets) {
    addTarget(target)
  }
}

function addEffect(effect: Effect) {
  const label = `🧪${effect.name}`
  const parentId = effect.parentId
  const effectNode = {
    id: effect.id,
    label: label,
    style: {
      stroke: '#44D7B6'
    }
  }

  nodes.push(effectNode)

  if (parentId) {
    edges.push({
      source: parentId,
      target: effectNode.id
    })
  }
}

function addPack() {
  for (const effect of pack) {
    addEffect(effect)
  }
}

function init() {
  addTargets()
  addPack()
}

init()

const container = document.getElementById('container')
const width = container!.scrollWidth
const height = container!.scrollHeight || 500
const graph = new G6.Graph({
  container: 'container',
  width,
  height,
  fitView: true,
  modes: {
    default: ['drag-canvas', 'drag-node']
  },
  layout: {
    type: 'dagre',
    rankdir: 'LR',
    align: 'UL',
    controlPoints: true,
    nodesepFunc: () => 1,
    ranksepFunc: () => 1
  },
  defaultNode: {
    size: [120, 40],
    type: 'rect',
    style: {
      lineWidth: 1,
      stroke: '#0091FF',
      fill: '#fff',
      fontSize: globalFontSize
    }
  },
  defaultEdge: {
    type: 'polyline',
    size: 1,
    color: '#e2e2e2',
    style: {
      endArrow: {
        path: 'M 0,0 L 8,4 L 8,-4 Z',
        fill: '#e2e2e2'
      },
      radius: 20
    }
  }
})

graph.data(data)
graph.render()

if (typeof window !== 'undefined') {
  window.onresize = () => {
    if (!graph || graph.get('destroyed')) return
    if (!container || !container.scrollWidth || !container.scrollHeight) return
    graph.changeSize(container.scrollWidth, container.scrollHeight)
  }
}
