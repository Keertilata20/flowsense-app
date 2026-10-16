import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Threadloom rendering error", error, info); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-[#f7f1eb] px-6 text-center text-[#493a31]"><section className="max-w-md rounded-2xl border border-[#e8ddd3] bg-[#fffdf9] p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a36347]">Threadloom</p><h1 className="mt-3 font-['Instrument_Serif',Georgia,serif] text-3xl">Something went wrong</h1><p className="mt-3 text-sm leading-6 text-[#806f63]">Your writing may still be stored locally. Reload the app and try again.</p><button onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-[#40332b] px-4 py-2.5 text-sm font-semibold text-[#fffaf5]">Reload Threadloom</button></section></main>;
  }
}
