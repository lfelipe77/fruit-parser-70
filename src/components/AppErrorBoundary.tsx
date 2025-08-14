import React from "react";

export class AppErrorBoundary extends React.Component<{children: React.ReactNode},{error?: Error}> {
  constructor(p:any){ 
    super(p); 
    this.state = { error: undefined }; 
  }
  
  static getDerivedStateFromError(error: Error){ 
    return { error }; 
  }
  
  componentDidCatch(error:Error, info:any){ 
    console.error("App error:", error, info);
    console.error("Error stack:", error.stack);
  }
  
  render(){
    if (this.state.error) {
      return (
        <div style={{padding:16}}>
          <h1>Algo deu errado</h1>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}