import React from "react";

export default class SafeBoundary extends React.Component<{ label?: string; children: React.ReactNode }, { err?: any }> {
  state = { err: null as any };
  
  componentDidCatch(err: any, info: any) {
    this.setState({ err });
    console.error("[ErrorBoundary]", this.props.label, err, info);
  }
  
  render() {
    if (this.state.err) {
      return (
        <div className="p-4 text-red-600">
          Ocorreu um erro nesta seção. Recarregue a página.
        </div>
      );
    }
    return this.props.children;
  }
}