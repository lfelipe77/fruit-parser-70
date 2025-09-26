import React from "react";
import type { ErrorBoundaryState, ReadonlyProps } from "@/types/common";
import { log } from "@/utils/log";

interface AppErrorBoundaryProps extends ReadonlyProps {
  readonly fallback?: React.ComponentType<{ error: Error }>;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) { 
    super(props); 
    this.state = { hasError: false }; 
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { 
    log.error("App error boundary caught error:", error, errorInfo);
    log.error("Error stack:", error.stack);
  }
  
  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div style={{ padding: 16 }}>
          <h1>Algo deu errado</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.error.message || this.state.error)}
          </pre>
          {/* TODO: Add friendly fallback UI */}
        </div>
      );
    }
    return this.props.children;
  }
}