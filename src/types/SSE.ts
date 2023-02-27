export interface SSEMessage {
  id: string | number
  type: 'message' | 'notifications'
  retry?: number
  data: Record<string, string> | string
}
