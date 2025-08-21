import React from "react";

type State = { hasError: boolean; error?: any };

export default class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>, State
> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // minimal log
    console.error("GlobalErrorBoundary", error, info);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 16, fontFamily: "system-ui" }}>
        <h1>Algo deu errado 😵</h1>
        <p>Tente recarregar a página (Ctrl/Cmd + Shift + R).</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {String(this.state.error ?? "Erro desconhecido")}
        </pre>
      </div>
    );
  }
}