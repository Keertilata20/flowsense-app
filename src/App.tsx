import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import WriteScreen from "./components/editor/WriteScreen";
import Library from "./components/library/Library";
import { getDocumentTitle, type Draft } from "./components/library/types";

type Mode = "fix" | "improve";
type Tab = "write" | "history" | "insights";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function App() {
  const [text, setText] = useState(() => localStorage.getItem("flowsense-draft") ?? "");
  const [tab, setTab] = useState<Tab>("write");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState<Mode | null>(null);
  const [autoHelp, setAutoHelp] = useState(true);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<Draft[]>(() => { try { return JSON.parse(localStorage.getItem("flowsense-history") ?? "[]"); } catch { return []; } });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<number | null>(null);
  const lastAutoText = useRef("");

  useEffect(() => { localStorage.setItem("flowsense-draft", text); }, [text]);
  useEffect(() => () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const sentenceCount = text.trim() ? (text.match(/[.!?]+(?=\s|$)/g)?.length ?? 1) : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const requestSuggestion = async (mode: Mode, source = text) => {
    if (!source.trim()) { setNotice("Write a little something first, then try Improve."); return; }
    setLoading(mode); setNotice("");
    try {
      const response = await fetch(`${API_URL}/improve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: source, mode }) });
      if (!response.ok) throw new Error("Suggestion service unavailable");
      const data = await response.json();
      if (!data.result) throw new Error("No suggestion returned");
      setSuggestion(data.result);
    } catch { setNotice("Writing suggestions are unavailable right now. Please try again shortly."); }
    finally { setLoading(null); }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = event.target.value;
    setText(nextText); setSuggestion(""); setNotice("");
    event.target.style.height = "auto";
    event.target.style.height = `${Math.max(event.target.scrollHeight, 440)}px`;
    if (!autoHelp || nextText.trim().length < 40) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => { if (nextText !== lastAutoText.current) { lastAutoText.current = nextText; requestSuggestion("improve", nextText); } }, 1600);
  };

  const saveDraft = () => {
    if (!text.trim()) { setNotice("Nothing to save yet."); return; }
    const draft = { id: crypto.randomUUID(), text, title: getDocumentTitle({ text }), savedAt: new Date().toLocaleString(), updatedAt: Date.now() };
    const nextHistory = [draft, ...history].slice(0, 12);
    setHistory(nextHistory); localStorage.setItem("flowsense-history", JSON.stringify(nextHistory)); setNotice("Saved to your writing history.");
  };
  const handleNew = () => { setText(""); setSuggestion(""); setNotice("Fresh page, ready when you are."); window.setTimeout(() => textareaRef.current?.focus(), 0); };
  const downloadPDF = () => { if (!text.trim()) return; const document = new jsPDF(); document.text(document.splitTextToSize(text, 180), 15, 18); document.save("flowsense-writing.pdf"); };
  const downloadDOCX = async () => { if (!text.trim()) return; const document = new Document({ sections: [{ children: text.split(/\n/).map((line) => new Paragraph({ text: line })) }] }); saveAs(await Packer.toBlob(document), "flowsense-writing.docx"); };
  const downloadTXT = () => { if (!text.trim()) return; saveAs(new Blob([text], { type: "text/plain;charset=utf-8" }), "flowsense-writing.txt"); };
  const updateHistory = (nextHistory: Draft[]) => { setHistory(nextHistory); localStorage.setItem("flowsense-history", JSON.stringify(nextHistory)); };
  const renameDraft = (id: string, title: string) => updateHistory(history.map((draft) => draft.id === id ? { ...draft, title } : draft));
  const deleteDraft = (id: string) => updateHistory(history.filter((draft) => draft.id !== id));

  return <div className="app">
    <Navbar activeTab={tab} setActiveTab={setTab} onNew={handleNew} onSave={saveDraft} />
    {tab === "write" && <WriteScreen text={text} textareaRef={textareaRef} wordCount={wordCount} charCount={charCount} readingMinutes={readingMinutes} loading={loading !== null} suggestion={suggestion} status={notice} autoHelp={autoHelp} onChange={handleChange} onImprove={() => requestSuggestion("improve")} onSave={saveDraft} onSuggestionsChange={setAutoHelp} onDismissSuggestion={() => setSuggestion("")} onUseSuggestion={() => { setText(suggestion); setSuggestion(""); setNotice("Refinement applied."); }} onExportPDF={downloadPDF} onExportDOCX={downloadDOCX} onExportTXT={downloadTXT} />}
    {tab === "insights" && <section className="hero"><p className="eyebrow">A calmer way to write</p><h1>Writing that <em>flows</em> naturally</h1><p>Clarity, rhythm, and a helping hand when you need it.</p></section>}
    {tab === "history" && <Library documents={history} onOpen={(draft) => { setText(draft.text); setTab("write"); setNotice("Saved draft opened."); }} onRename={renameDraft} onDelete={deleteDraft} onStartWriting={() => { handleNew(); setTab("write"); }} />}
    {tab === "insights" && <main className="panel tab-panel"><h2>Writing insights</h2><p className="panel-intro">A quick pulse check on your current draft.</p><div className="insight-grid"><div><strong>{wordCount}</strong><span>Words</span></div><div><strong>{sentenceCount}</strong><span>Sentences</span></div><div><strong>{readingMinutes} min</strong><span>Reading time</span></div><div><strong>{wordCount && sentenceCount ? Math.round(wordCount / sentenceCount) : 0}</strong><span>Words / sentence</span></div></div><p className="insight-note">{wordCount < 25 ? "Start writing to unlock a clearer view of your rhythm." : wordCount / Math.max(sentenceCount, 1) > 24 ? "Your sentences are on the longer side. A few shorter ones can add more pace." : "Your sentence length has a comfortable, readable rhythm."}</p></main>}
  </div>;
}

export default App;
