import { Task } from '../../lib'

export class Read implements Task {
  async run () {
  // async run ({node, context, message} = {}) {
    return { done: true, async: false }
  }
}

module.exports = Read
