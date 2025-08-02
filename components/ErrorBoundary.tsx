import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 60% 20%, #232b4d 0%, #0c0c0c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          padding: "20px"
        }}>
          <div style={{
            background: "rgba(30,34,54,0.95)",
            borderRadius: 20,
            padding: "32px",
            maxWidth: 500,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ fontSize: 48, marginBottom: "16px" }}>⚠️</div>
            <h2 style={{ color: "#fff", margin: "0 0 16px 0" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#b0b8d0", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "rgba(123,97,255,0.8)",
                border: "1px solid rgba(123,97,255,0.3)",
                borderRadius: 8,
                padding: "12px 24px",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: "24px",
                textAlign: "left",
                color: "#b0b8d0",
                fontSize: 12
              }}>
                <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
                  Error Details (Development)
                </summary>
                <pre style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "12px",
                  borderRadius: 4,
                  overflow: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 