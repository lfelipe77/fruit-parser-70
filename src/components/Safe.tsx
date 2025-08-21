import React from "react";

export class Safe extends React.Component<React.PropsWithChildren, {err?: any}> {
  state = { err: undefined as any };
  
  static getDerivedStateFromError(err: any) { 
    return { err }; 
  }
  
  componentDidCatch(error: any, info: any) { 
    console.error("[Safe] caught", error, info);
  }
  
  render() { 
    if (this.state.err) {
      return (
        <div style={{padding: 16}}>
          Falha ao carregar esta seção.
        </div>
      );
    }
    return this.props.children; 
  }
}