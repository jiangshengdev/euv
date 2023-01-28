import G6 from '@antv/g6'
import {
  Bucket,
  calculator,
  Computed,
  Effect,
  Key,
  pack,
  store,
  Target
} from '@euv/react'
import { EdgeConfig, NodeConfig, TreeGraphData } from '@antv/g6-core/es/types'
import { v4 as uuidv4 } from 'uuid'
import { attachKey, labelKey, parentKey, uuidKey } from '@euv/shared'

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
      if (!effect.scheduler) {
        edges.push({
          source: keyNode.id,
          target: effect[uuidKey],
          label: 'track/trigger'
        })
      } else {
        edges.push({
          source: keyNode.id,
          target: effect[uuidKey],
          label: 'track'
        })
        edges.push({
          source: keyNode.id,
          target: effect.scheduler[uuidKey],
          label: 'trigger'
        })
      }
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
  const parentId: string = effect[parentKey]?.[uuidKey] ?? uuidv4()
  const effectNode: NodeConfig = {
    id: effect[uuidKey],
    label: `🧪${effect[labelKey]}`,
    style: {
      stroke: '#44D7B6'
    }
  }

  if (effect.scheduler) {
    effectNode.style!.lineDash = [5, 5]
  }

  nodes.push(effectNode)

  if (parentId) {
    edges.push({
      source: parentId,
      target: effectNode.id,
      label: 'wrap'
    })
  }
}

function addPack() {
  for (const effect of pack) {
    addEffect(effect)
  }
}

function addDep(
  computed: Computed<any>,
  dep: Set<Effect>,
  schedulerNode: NodeConfig
) {
  const valueNode: NodeConfig = {
    id: uuidv4(),
    label: '🔑get value',
    style: {
      stroke: '#F7B500'
    }
  }

  nodes.push(valueNode)
  edges.push({
    source: computed[uuidKey],
    target: valueNode.id
  })

  for (const effect of dep) {
    edges.push({
      source: valueNode.id,
      target: effect[uuidKey],
      label: 'track'
    })
    edges.push({
      source: schedulerNode.id,
      target: effect[uuidKey],
      label: 'trigger'
    })
  }
}

function addComputed(computed: Computed<any>) {
  const computedNode: NodeConfig = {
    id: computed[uuidKey],
    label: `🧮${computed[labelKey]}`,
    style: {
      stroke: '#FA6400'
    }
  }
  const schedulerNode: NodeConfig = {
    id: computed[attachKey][uuidKey] ?? uuidv4(),
    label: `🏗️scheduler`,
    style: {
      stroke: '#6D7278'
    }
  }

  nodes.push(schedulerNode)
  nodes.push(computedNode)

  if (computed.dep) {
    addDep(computed, computed.dep, schedulerNode)
  }

  edges.push({
    source: computedNode.id,
    target: computed.effect[uuidKey],
    label: '.effect'
  })
  edges.push({
    source: computed.effect[uuidKey],
    target: schedulerNode.id
  })
}

function addCalculator() {
  for (const computed of calculator) {
    addComputed(computed)
  }
}

function init() {
  addTargets()
  addPack()
  addCalculator()
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
    },
    labelCfg: {
      style: {
        fontSize: 8
      }
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
