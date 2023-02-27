import type { Response } from 'express'
import type { SSEMessage } from '../types/SSE'
import { SSEClient } from './SSEclient'

type ID = string | number

export class SSEManager {
  clients: Map<ID, SSEClient>
  constructor() {
    this.clients = new Map()
  }

  public open(clientId: ID, context: Response) {
    const client = new SSEClient(context)
    client.initialize()
    this.clients.set(clientId, client)
  }

  public delete(clientId: ID) {
    this.clients.delete(clientId)
  }

  public deleteAll() {
    this.clients.clear()
  }

  public unicast(clientId: ID, message: SSEMessage) {
    const client = this.clients.get(clientId)
    if (client) {
      client.send(message)
    }
  }

  public broadcast(message: SSEMessage) {
    for (const [id] of this.clients) {
      this.unicast(id, message)
    }
  }

  public multicast(clientIds: ID[], message: SSEMessage) {
    for (const id of clientIds) {
      this.unicast(id, message)
    }
  }

  public count(): number {
    return this.clients.size
  }
}
