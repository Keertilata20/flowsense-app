import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import "./App.css";
import Navbar from "./components/layout/Navbar";

type Mode = "fix" | "improve";
type Tab = "write" | "history" | "insights";
type Draft = { id: string; text: string; savedAt: string };

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function App() {
  const [text, setText] = useState(() => localStorage.getItem("flowsense-draft") ?? "");
  const [tab, setTab] = useState<Tab>("write");
  const [suggestion, setSuggestion] = useState("");
  const [suggestionMode, setSuggestionMode] = useState<Mode>("improve");
  const [loading, setLoading] = useState<Mode | null>(null);
  const [autoHelp, setAutoHelp] = useState(true);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<Draft[]>(() => {
    try { return JSON.parse(localStorage.getItem("flowsense-history") ?? "[]"); }
    catch { return []; }
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<number | null>(null);
  const lastAutoText = useRef("");

  useEffect(() => {
    localStorage.setItem("flowsense-draft", text);
  }, [text]);

  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const sentenceCount = text.trim() ? (text.match(/[.!?]+(?=\s|$)/g)?.length ?? 1) : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const requestSuggestion = async (mode: Mode, source = text) => {
    if (!source.trim()) {
      setNotice("Write a little something first, then I can help.");
      return;
    }
    setLoading(mode);
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, mode }),
      });
      if (!response.ok) throw new Error("Suggestion service unavailable");
      const data = await response.json();
      if (!data.result) throw new Error("No suggestion returned");
      setSuggestion(data.result);
      setSuggestionMode(mode);
    } catch {
      setNotice("I couldn't reach the writing helper. Make sure the local AI server is running, then try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = event.target.value;
    setText(nextText);
    setSuggestion("");
    setNotice("");
    event.target.style.height = "auto";
    event.target.style.height = `${Math.max(event.target.scrollHeight, 250)}px`;

    if (!autoHelp || nextText.trim().length < 40) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (nextText !== lastAutoText.current) {
        lastAutoText.current = nextText;
        requestSuggestion("improve", nextText);
      }
    }, 1600);
  };

  const saveDraft = () => {
    if (!text.trim()) {
      setNotice("Nothing to save yet.");
      return;
    }
    const draft = { id: crypto.randomUUID(), text, savedAt: new Date().toLocaleString() };
    const nextHistory = [draft, ...history].slice(0, 12);
    setHistory(nextHistory);
    localStorage.setItem("flowsense-history", JSON.stringify(nextHistory));
    setNotice("Saved to your writing history.");
  };

  const handleNew = () => {
    setText("");
    setSuggestion("");
    setNotice("Fresh page, ready when you are.");
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const downloadPDF = () => {
    if (!text.trim()) return;
    const document = new jsPDF();
    document.text(document.splitTextToSize(text, 180), 15, 18);
    document.save("flowsense-writing.pdf");
  };

  const downloadDOCX = async () => {
    if (!text.trim()) return;
    const document = new Document({ sections: [{ children: text.split(/\n/).map((line) => new Paragraph({ text: line })) }] });
    saveAs(await Packer.toBlob(document), "flowsense-writing.docx");
  };

  const downloadTXT = () => {
    if (!text.trim()) return;
    saveAs(new Blob([text], { type: "text/plain;charset=utf-8" }), "flowsense-writing.txt");
  };

  const renderWrite = () => (
    <main className="workspace write-layout">
      <section className="panel editor-panel">
        <div className="panel-heading">
          <div><h2>Your writing</h2><p>Write freely. Help appears when you want it.</p></div>
          <label className="auto-toggle"><input type="checkbox" checked={autoHelp} onChange={(e) => setAutoHelp(e.target.checked)} /><span />Auto help</label>
        </div>
        <div className="editor-surface">
          <textarea ref={textareaRef} value={text} onChange={handleChange} placeholder="Start writing your thought here..." className="textarea" aria-label="Writing editor" />
          <div className="editor-footer"><span>{wordCount} words · {charCount} characters</span><span>{readingMinutes} min read</span></div>
        </div>
        <div className="action-buttons">
          <button className="secondary-btn" disabled={loading !== null} onClick={() => requestSuggestion("fix")}>{loading === "fix" ? "Checking…" : "Fix writing"}</button>
          <button className="primary-btn" disabled={loading !== null} onClick={() => requestSuggestion("improve")}>{loading === "improve" ? "Thinking…" : "Improve with AI"}</button>
          <div className="export-menu"><button className="text-btn">Export</button><div className="export-options"><button onClick={downloadPDF}>PDF</button><button onClick={downloadDOCX}>Word</button><button onClick={downloadTXT}>Text</button></div></div>
        </div>
        {notice && <p className="notice" role="status">{notice}</p>}
      </section>

      <aside className="panel helper-panel">
        <div className="helper-heading"><div className="sparkle">✦</div><div><h2>FlowSense helper</h2><p>{autoHelp ? "Watching for a natural pause." : "Turn on Auto help for quiet suggestions."}</p></div></div>
        {loading && <div className="helper-empty"><div className="dots"><i /><i /><i /></div><p>Looking for a smoother way to say it…</p></div>}
        {!loading && suggestion && <div className="suggestion-card"><span className="suggestion-label">{suggestionMode === "fix" ? "Cleaned up" : "Suggested rewrite"}</span><p>{suggestion}</p><div className="suggestion-actions"><button className="secondary-btn" onClick={() => setSuggestion("")}>Dismiss</button><button className="primary-btn" onClick={() => { setText(suggestion); setSuggestion(""); setNotice("Suggestion applied."); }}>Use suggestion</button></div></div>}
        {!loading && !suggestion && <div className="helper-empty"><div className="helper-orb">✦</div><h3>Keep your flow</h3><p>Use the buttons below your draft for a rewrite or a quick grammar pass. Pause while writing and Auto help can step in too.</p></div>}
      </aside>
    </main>
  );

  return <div className="app">
    <Navbar
    activeTab={tab}
    setActiveTab={setTab}
    onNew={handleNew}
    onSave={saveDraft}
/>
    <section className="hero"><p className="eyebrow">A calmer way to write</p><h1>Writing that <em>flows</em> naturally</h1><p>Clarity, rhythm, and a helping hand when you need it.</p></section>
    {tab === "write" && renderWrite()}
    {tab === "history" && <main className="panel tab-panel"><h2>Writing history</h2><p className="panel-intro">Your saved drafts stay on this device.</p>{history.length ? <div className="history-list">{history.map((draft) => <button key={draft.id} className="history-item" onClick={() => { setText(draft.text); setTab("write"); setNotice("Saved draft opened."); }}><span>{draft.text.slice(0, 120) || "Untitled draft"}</span><small>{draft.savedAt}</small></button>)}</div> : <div className="empty-state">No saved drafts yet. Write something, then press Save.</div>}</main>}
    {tab === "insights" && <main className="panel tab-panel"><h2>Writing insights</h2><p className="panel-intro">A quick pulse check on your current draft.</p><div className="insight-grid"><div><strong>{wordCount}</strong><span>Words</span></div><div><strong>{sentenceCount}</strong><span>Sentences</span></div><div><strong>{readingMinutes} min</strong><span>Reading time</span></div><div><strong>{wordCount && sentenceCount ? Math.round(wordCount / sentenceCount) : 0}</strong><span>Words / sentence</span></div></div><p className="insight-note">{wordCount < 25 ? "Start writing to unlock a clearer view of your rhythm." : wordCount / Math.max(sentenceCount, 1) > 24 ? "Your sentences are on the longer side. A few shorter ones can add more pace." : "Your sentence length has a comfortable, readable rhythm."}</p></main>}
  </div>;
}

export default App;



