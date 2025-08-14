import React from 'react';

export class DevErrorBoundary extends React.Component<{children: React.ReactNode},{err:any}> {
  constructor(p:any){ super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err:any){ return { err }; }
  componentDidCatch(err:any, info:any){ /* also surfaces in console when open */ }
  render(){
    if (!this.state.err) return this.props.children;
    return (
      <pre style={{whiteSpace:'pre-wrap',padding:12,color:'#f33',background:'#111',borderRadius:8}}>
        {String(this.state.err?.stack || this.state.err)}
      </pre>
    );
  }
}