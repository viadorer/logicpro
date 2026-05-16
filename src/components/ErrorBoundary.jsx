import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Misto zhasle obrazovky alespon zaznamenat do konzole.
    // Pro produkci napojit Sentry.
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "120px 20px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Něco se pokazilo</h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Stránku se nepodařilo zobrazit. Zkuste obnovit nebo se vrátit na úvod.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn--fill btn--sm"
              onClick={() => { this.handleReset(); window.location.reload(); }}
            >
              Obnovit stránku
            </button>
            <a href="/" className="btn btn--outline btn--sm">Domů</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
