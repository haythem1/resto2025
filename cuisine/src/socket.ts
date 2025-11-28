import { io, Socket } from 'socket.io-client'
import type { Order } from './types'

function getSocketUrl(): string {
  try {
    const stored = localStorage.getItem('kitchenServerUrl')
    if (stored) {
        return `${stored}:5000`
      
    }
    return 'http://localhost:5000'
  } catch {
    return 'http://localhost:5000'
  }
}

let socket: Socket | null = null

function getSocket(): Socket {
  if (!socket) {
    const url = getSocketUrl()
    console.log('Connecting to socket:', url)
    socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    })
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
    })
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }
  return socket
}

function reconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  getSocket()
}

export default {
  connected: false,
  connect() {
    const s = getSocket()
    this.connected = true
    return s
  },
  disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    this.connected = false
  },
  reconnect() {
    reconnectSocket()
  }
} as any as Socket

export function subscribeNewOrders(cb: (order: Order) => void) {
  const s = getSocket()
  s.on('newOrder', (order: Order) => {
    console.log('New order received:', order)
    cb(order)
  })
}

export function unsubscribeNewOrders(cb?: (order: Order) => void) {
  const s = getSocket()
  if (cb) s.off('newOrder', cb)
  else s.off('newOrder')
}
