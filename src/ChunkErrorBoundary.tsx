import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { errored: boolean }

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { errored: false }

  static getDerivedStateFromError(err: unknown): State {
    const msg = err instanceof Error ? err.message : String(err)
    const isChunk = msg.includes('Failed to fetch') ||
                    msg.includes('Loading chunk') ||
                    msg.includes('Importing a module') ||
                    msg.includes('dynamically imported module')
    if (isChunk) window.location.reload()
    return { errored: isChunk }
  }

  render() {
    if (this.state.errored) {
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#04020D', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(167,139,250,.3)',
            borderTopColor: '#A78BFA', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )
    }
    return this.props.children
  }
}
