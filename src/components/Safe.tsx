import React from "react";

export class Safe extends React.Component<React.PropsWithChildren, {err?: any}> {
  state = { err: undefined as any };
  
  static getDerivedStateFromError(err: any) { 
    return { err }; 
  }
  
  componentDidCatch(error: any, info: any) { 
    console.error("[Safe] caught", error, info);
    console.error("[Safe] error stack:", error?.stack);
    console.error("[Safe] component stack:", info?.componentStack);
  }
  
  render() { 
    if (this.state.err) {
      return (
        <div style={{padding: 16, border: '1px solid #ff0000', backgroundColor: '#fff5f5'}}>
          <strong>Falha ao carregar esta seção.</strong>
          <details style={{marginTop: 8, fontSize: '12px', color: '#666'}}>
            <summary>Detalhes do erro</summary>
            <pre style={{whiteSpace: 'pre-wrap', marginTop: 4}}>
              {this.state.err?.message || 'Erro desconhecido'}
              {this.state.err?.stack && '\n\nStack:\n' + this.state.err.stack}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}