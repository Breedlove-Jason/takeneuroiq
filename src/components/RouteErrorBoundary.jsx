import { Component } from 'react';

export default class RouteErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous) {
    if (previous.path !== this.props.path && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="mx-auto max-w-xl px-5 py-16"><div className="neuro-panel" role="alert"><h1 className="text-2xl font-bold">Let’s reload that page.</h1><p className="my-5 leading-7 text-slate-300">A new version may be available, or the connection was interrupted. Your saved practice history is still on this device.</p><button className="neuro-button" onClick={() => window.location.reload()}>Reload NeuroIQ</button></div></main>;
  }
}
