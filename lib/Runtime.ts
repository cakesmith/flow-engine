import { FlowNode, FlowDescription, Flow } from './Flow'

import EventEmitter from 'events'

export type Context = {[key: string]: any}
export type Message = {[key: string]: any}

export interface Task {
  run: (node: FlowNode, context: Context, message: Message) => Promise<Message>
}

export type Tasks = {[key: string]: Task}

const STATUS = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
}

export class Runtime extends EventEmitter {

  flow: Flow
  tasks: Tasks
  isRunning: boolean
  started: boolean
  completed: boolean
  state: {[key: string]: {status: string}}
  context: any


  constructor (flow: FlowDescription, context: any, tasks: Tasks) {
    super()
    this.flow = new Flow(flow)
    this.context = context
    this.tasks = tasks
    this.isRunning = false
    this.started = false
    this.completed = false
    this.state = {}
  }

  allNodesTraversed () {
    const completed = Object.keys(this.state).filter((s) => this.state[s].status === STATUS.COMPLETED)
    return completed.length === this.flow.nodes.length
  }

  start () {
    this.runNode(this.flow.startNode)
    this.isRunning = true
    this.emit('start', {node: this.flow.startNode})
  }

  async runNode (node: FlowNode, prevNode?: FlowNode, message = {}) {
    let canRun = false
    if (prevNode) {
      const inboundConnections = this.flow.getInboundConnections(node.id)
      const allCompleted = inboundConnections.filter((c) => this.state[c.id].status === STATUS.COMPLETED)
      if (inboundConnections.length === allCompleted.length) {
        canRun = true
      }
    } else {
      canRun = true
    }

    if (canRun) {
      this.state[node.id] = { status: STATUS.RUNNING }
      const task = this.tasks[node.taskName]
      try {
        const result = await task.run(node, this.context, message)
        this.completeNode(node, result)
      } catch (error) {
        this.emit('error', { error })
        throw error
      }
    }
  }

  completeNode(node: FlowNode, message: any) {
    this.state[node.id].status = STATUS.COMPLETED

    const outboundConnections = this.flow.getOutboundConnections(node.id)

    if (this.allNodesTraversed()) {
      this.isRunning = false
      this.emit('end', { message })
      return
    }

    // We have not reached the end, let us continue
    outboundConnections.forEach(outNode => this.runNode(outNode, node, message))
  }
}