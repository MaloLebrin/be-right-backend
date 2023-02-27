import type { Response } from 'express'
import type { SSEMessage } from '../types/SSE'

export class SSEClient {
  context: Response

  constructor(context: Response) {
    this.context = context
  }

  initialize() {
    const headers = {
      /* Permet d'indiquer au client qu'il s'agit d'une connexion SSE */
      'Content-Type': 'text/event-stream',
      /* Permet d'indiquer au client que la connexion est persistente */
      'Connection': 'keep-alive',
      /* Permet d'empêcher la mise en cache des messages */
      'Cache-Control': 'no-cache',
    }

    this.context.writeHead(200, headers)
  }

  send(message: SSEMessage) {
    const { id, type = 'message', retry, data } = message

    if (id) {
      this.context.write(`id: ${id}\n`)
    }
    if (type) {
      this.context.write(`event: ${type}\n`)
    }
    if (retry) {
      this.context.write(`retry: ${retry}\n`)
    }

    this.context.write(`data: ${typeof data === 'object' ? JSON.stringify(data) : data}\n\n`)
  }
}
