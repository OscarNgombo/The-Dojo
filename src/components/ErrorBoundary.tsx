import * as React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
  renderFallback?: (args: {
    error: Error | null
    retry: () => void
  }) => React.ReactNode
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null }
  private renderCycle = 0

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error', error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKeys && prevProps.resetKeys) {
      const changed = this.props.resetKeys.some(
        (k, i) => k !== prevProps.resetKeys![i],
      )
      if (changed && this.state.hasError) {
        this.resetBoundary()
      }
    }
  }

  resetBoundary = () => {
    this.renderCycle++
    this.setState({ hasError: false, error: null })
  }

  handleRetry = () => {
    this.resetBoundary()
    try {
      this.props.onRetry?.()
    } catch (e) {
      console.error('[ErrorBoundary] onRetry threw', e)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.renderFallback) {
        return this.props.renderFallback({
          error: this.state.error,
          retry: this.handleRetry,
        })
      }
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          style={{
            padding: '2rem',
            maxWidth: 640,
            margin: '4rem auto',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--light-color)',
            boxShadow: 'var(--box-shadow)',
          }}
          role="alert"
          aria-live="assertive"
        >
          <h1 style={{ marginTop: 0, fontSize: '1.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--secondary-color)' }}>
            An unexpected error occurred. You can try again.
          </p>
          {this.state.error && (
            <pre
              style={{
                background: '#222',
                color: '#f5f5f5',
                padding: '0.75rem 1rem',
                fontSize: 12,
                overflowX: 'auto',
                borderRadius: 4,
                maxHeight: 200,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              marginTop: '1rem',
              background: 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1rem',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return (
      <React.Fragment key={this.renderCycle}>
        {this.props.children}
      </React.Fragment>
    )
  }
}
