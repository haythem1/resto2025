import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          color: '#ef4444', 
          padding: '20px', 
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3 style={{ color: '#ef4444' }}>❌ Erreur de rendu</h3>
          <p><strong>Message:</strong></p>
          <p>{this.state.error?.message}</p>
          <p><strong>Stack:</strong></p>
          <p>{this.state.error?.stack}</p>
        </div>
      )
    }

    return this.props.children
  }
}
