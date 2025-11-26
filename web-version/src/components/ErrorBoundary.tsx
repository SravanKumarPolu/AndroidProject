import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card bg-base-200 max-w-md w-full">
            <div className="card-body">
              <h2 className="card-title text-error">Something went wrong</h2>
              <p className="text-base-content/70">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.reload();
                  }}
                >
                  Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

