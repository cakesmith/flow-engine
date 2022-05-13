type Props = {[key: string]: any}

export type FlowNode = {
  id: string
  name: string
  taskName: string
  props: Props
}

export type FlowDescription = {
  nodes: Array<FlowNode>
  connections: Array<Connection>
}

type Connection = {
  source: FlowNode,
  target: FlowNode
}

export class Flow {

  nodes: Array<FlowNode> = []
  connections: Array<Connection> = []

  constructor(flow: FlowDescription) {
    this.nodes = flow.nodes
    this.connections = flow.connections
  }

  getNode (id: string) {
    return this.nodes.find((n) => n.id === id)
  }
  getInboundConnections (nodeId: string) {
    return this.connections.filter(c => c.target.id === nodeId).map(n => n.source)
  }
  getOutboundConnections (nodeId: string) {
    return this.connections.filter(c => c.source.id === nodeId).map(n => n.target)
  }
  get startNode () {
    // Find a node with no inbound connections
    const starts = this.nodes.filter((n) => {
      const inbound = this.getInboundConnections(n.id)
      return inbound.length === 0
    });

    if (starts.length > 1) {
      throw new Error('Flow Engine does not support multiple start nodes')
    }
    return starts[0] || undefined
  }

  get endNode() {
    const nodesCount = this.nodes.length
    if (nodesCount === 0) {
      return undefined
    }
    return this.nodes[nodesCount - 1]
  }
}