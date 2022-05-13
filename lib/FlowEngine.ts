import { Flow, FlowDescription } from './Flow'
import { Context, Runtime, Tasks } from './Runtime'

export class FlowEngine {

  flow: Flow
  context: Context
  tasks: Tasks
  runtime: Runtime

  constructor(flowDescription: FlowDescription, context: Context = {}, tasks: Tasks) {
    this.flow = new Flow(flowDescription)
    this.context = context
    this.tasks = tasks
    this.runtime = new Runtime(this.flow, this.context, this.tasks)
  }

  run () {
    this.runtime.start()
    return this.runtime
  }
}