import ELK from 'elkjs/lib/elk.bundled.js'
import _ from 'underscore'
import * as utils from './utils'

function getLargestId (obj, currentLargest) {
  if (_.isUndefined(currentLargest)) currentLargest = 0
  if (_.isUndefined(obj)) return currentLargest
  const keys = Object.keys(obj)
  if (keys.length === 0) return currentLargest
  return Math.max.apply(null, keys.map(x => parseInt(x)).concat([ currentLargest ]))
}

function makeAnchorNode (x, y) {
  return {
    node_type: 'midmarker',
    x,
    y,
    connected_segments: [],
    name: null,
    bigg_id: null,
    label_x: null,
    label_y: null,
    node_is_primary: null,
    data: null
  }
}

function getReactionMetaboliteNodeIds (reaction, nodes) {
  const ids = []
  for (let segmentId in reaction.segments) {
    const segment = reaction.segments[segmentId]
    ;[ segment.from_node_id, segment.to_node_id ].forEach(nodeId => {
      const node = nodes[nodeId]
      if (node && node.node_type === 'metabolite') ids.push(nodeId)
    })
  }
  return Array.from(new Set(ids))
}

function getCoeffForBiggId (reaction, biggId) {
  const found = reaction.metabolites.find(m => m.bigg_id === biggId)
  return found ? found.coefficient : null
}

function getReactionCenterGuess (reaction, nodes) {
  for (let segmentId in reaction.segments) {
    const segment = reaction.segments[segmentId]
    const fromNode = nodes[segment.from_node_id]
    const toNode = nodes[segment.to_node_id]
    if (fromNode && fromNode.node_type === 'midmarker') return fromNode
    if (toNode && toNode.node_type === 'midmarker') return toNode
  }
  const metIds = getReactionMetaboliteNodeIds(reaction, nodes)
  if (metIds.length === 0) return null
  const sum = metIds.reduce((acc, id) => utils.c_plus_c(acc, nodes[id]), { x: 0, y: 0 })
  return utils.c_times_scalar(sum, 1 / metIds.length)
}

function normPoints (points) {
  const out = []
  let last = null
  points.forEach(p => {
    if (!p) return
    if (!last || last.x !== p.x || last.y !== p.y) out.push({ x: p.x, y: p.y })
    last = p
  })
  return out
}

function pointsFromSections (sections) {
  if (!sections || sections.length === 0) return []
  const section = sections[0]
  const bends = section.bendPoints || []
  return normPoints([ section.startPoint, ...bends, section.endPoint ])
}

export async function getElkAutoLayoutData (map, options) {
  const elk = new ELK()
  const nodes = map.nodes
  const reactions = map.reactions

  const oldMetLabelDisplacements = {}
  for (let nodeId in nodes) {
    const node = nodes[nodeId]
    if (node.node_type !== 'metabolite') continue
    oldMetLabelDisplacements[nodeId] = {
      x: node.label_x - node.x,
      y: node.label_y - node.y
    }
  }

  const oldReactionLabelDisplacements = {}
  for (let reactionId in reactions) {
    const reaction = reactions[reactionId]
    const center = getReactionCenterGuess(reaction, nodes)
    if (!center) continue
    oldReactionLabelDisplacements[reactionId] = {
      x: reaction.label_x - center.x,
      y: reaction.label_y - center.y
    }
  }

  const elkChildren = []
  const elkMetNodeIdForEscherId = {}
  const elkRxnNodeIdForReactionId = {}

  for (let nodeId in nodes) {
    const node = nodes[nodeId]
    if (node.node_type !== 'metabolite') continue
    const elkId = `n${nodeId}`
    elkMetNodeIdForEscherId[nodeId] = elkId
    elkChildren.push({
      id: elkId,
      width: 40,
      height: 40
    })
  }

  for (let reactionId in reactions) {
    const elkId = `r${reactionId}`
    elkRxnNodeIdForReactionId[reactionId] = elkId
    elkChildren.push({
      id: elkId,
      width: 10,
      height: 10
    })
  }

  const elkEdges = []
  const edgeMetForElkEdge = {}
  for (let reactionId in reactions) {
    const reaction = reactions[reactionId]
    const metNodeIds = getReactionMetaboliteNodeIds(reaction, nodes)
    metNodeIds.forEach(nodeId => {
      const metNode = nodes[nodeId]
      const coeff = getCoeffForBiggId(reaction, metNode.bigg_id)
      if (coeff === null) return
      const source = coeff < 0 ? elkMetNodeIdForEscherId[nodeId] : elkRxnNodeIdForReactionId[reactionId]
      const target = coeff < 0 ? elkRxnNodeIdForReactionId[reactionId] : elkMetNodeIdForEscherId[nodeId]
      const edgeId = `e${reactionId}_${nodeId}`
      edgeMetForElkEdge[edgeId] = { reactionId, nodeId, coeff }
      elkEdges.push({
        id: edgeId,
        sources: [ source ],
        targets: [ target ]
      })
    })
  }

  const graph = {
    id: 'root',
    layoutOptions: Object.assign({
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.layered.spacing.edgeNodeBetweenLayers': '40',
      'elk.layered.crossingMinimization.semiInteractive': 'true'
    }, options && options.elkLayoutOptions ? options.elkLayoutOptions : {}),
    children: elkChildren,
    edges: elkEdges
  }

  const laidOut = await elk.layout(graph)

  const posByElkId = {}
  laidOut.children.forEach(n => {
    posByElkId[n.id] = {
      x: n.x + n.width / 2,
      y: n.y + n.height / 2
    }
  })

  let nextNodeId = getLargestId(nodes, 0)
  let nextSegmentId = getLargestId(map.reactions, 0)
  for (let reactionId in reactions) {
    nextSegmentId = getLargestId(reactions[reactionId].segments, nextSegmentId)
  }

  const newNodes = {}
  for (let nodeId in nodes) {
    const node = nodes[nodeId]
    if (node.node_type !== 'metabolite') continue
    const elkId = elkMetNodeIdForEscherId[nodeId]
    const pos = posByElkId[elkId]
    if (!pos) continue
    const displacement = oldMetLabelDisplacements[nodeId] || { x: 0, y: 30 }
    newNodes[nodeId] = Object.assign({}, utils.clone(node), {
      x: pos.x,
      y: pos.y,
      label_x: pos.x + displacement.x,
      label_y: pos.y + displacement.y,
      connected_segments: []
    })
  }

  const newReactions = {}
  const reactionCenterNodeId = {}
  for (let reactionId in reactions) {
    const reaction = reactions[reactionId]
    const elkId = elkRxnNodeIdForReactionId[reactionId]
    const pos = posByElkId[elkId]
    if (!pos) continue

    const centerId = String(++nextNodeId)
    reactionCenterNodeId[reactionId] = centerId
    newNodes[centerId] = makeAnchorNode(pos.x, pos.y)

    const d = oldReactionLabelDisplacements[reactionId] || { x: 15, y: -25 }
    newReactions[reactionId] = Object.assign({}, utils.clone(reaction), {
      label_x: pos.x + d.x,
      label_y: pos.y + d.y,
      segments: {}
    })
  }

  const elkEdgesById = {}
  laidOut.edges.forEach(e => { elkEdgesById[e.id] = e })

  for (let edgeId in edgeMetForElkEdge) {
    const meta = edgeMetForElkEdge[edgeId]
    const elkEdge = elkEdgesById[edgeId]
    if (!elkEdge || !elkEdge.sections || elkEdge.sections.length === 0) continue

    const { reactionId, nodeId, coeff } = meta
    const reaction = newReactions[reactionId]
    if (!reaction) continue

    const metNode = newNodes[nodeId]
    const rxnCenterId = reactionCenterNodeId[reactionId]
    if (!metNode || !rxnCenterId) continue

    const points = pointsFromSections(elkEdge.sections)
    const pointNodeIds = points.map(p => {
      const id = String(++nextNodeId)
      newNodes[id] = makeAnchorNode(p.x, p.y)
      return id
    })

    const sourceId = coeff < 0 ? nodeId : rxnCenterId
    const targetId = coeff < 0 ? rxnCenterId : nodeId
    const chain = [ sourceId, ...pointNodeIds, targetId ]

    for (let i = 0; i < chain.length - 1; i++) {
      const fromId = chain[i]
      const toId = chain[i + 1]
      const segId = String(++nextSegmentId)
      const seg = {
        b1: null,
        b2: null,
        from_node_id: fromId,
        to_node_id: toId,
        from_node_coefficient: null,
        to_node_coefficient: null,
        reversibility: reaction.reversibility,
        data: reaction.data,
        reverse_flux: reaction.reverse_flux,
        unconnected_segment_with_arrow: false
      }
      if (fromId === nodeId) seg.from_node_coefficient = coeff
      if (toId === nodeId) seg.to_node_coefficient = coeff
      reaction.segments[segId] = seg
    }
  }

  for (let nodeId in newNodes) {
    newNodes[nodeId].connected_segments = []
  }
  for (let reactionId in newReactions) {
    const reaction = newReactions[reactionId]
    for (let segmentId in reaction.segments) {
      const segment = reaction.segments[segmentId]
      const fromNode = newNodes[segment.from_node_id]
      const toNode = newNodes[segment.to_node_id]
      ;[ fromNode, toNode ].forEach(n => {
        if (!n) return
        n.connected_segments.push({ segment_id: segmentId, reaction_id: reactionId })
      })
    }
  }

  const largestIds = {
    reactions: map.largest_ids.reactions,
    nodes: getLargestId(newNodes, 0),
    segments: nextSegmentId,
    text_labels: map.largest_ids.text_labels
  }

  return {
    nodes: newNodes,
    reactions: newReactions,
    largest_ids: largestIds
  }

