import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import WriteScreen from "./components/editor/WriteScreen";
import Library from "./components/library/Library";
import SpacePicker from "./components/library/SpacePicker";
import SpaceCreator from "./components/library/SpaceCreator";
import WritingModePicker from "./components/library/WritingModePicker";
import { getContent, getDocumentTitle, getPlainText, getReadingMinutes, getWordCount, UNASSIGNED_SPACE, type FlowDocument, type WritingMode } from "./components/library/types";
import { useDocuments } from "./hooks/useDocuments";
import { useSpaces } from "./hooks/useSpaces";
import Home from "./components/home/Home";
import InsightsDashboard from "./components/insights/InsightsDashboard";

type Mode = "fix" | "improve";
type Tab = "home" | "write" | "history" | "insights";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function App() {
  const [text, setText] = useState(() => localStorage.getItem("flowsense-draft") ?? "");
  const [tab, setTab] = useState<Tab>("home");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState<Mode | null>(null);
  const [autoHelp, setAutoHelp] = useState(true);
  const [notice, setNotice] = useState("");
  const { documents, createDocument, updateDocument, deleteDocument, duplicateDocument } = useDocuments();
  const { spaces, createSpace } = useSpaces();
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftMode, setDraftMode] = useState<WritingMode>("note");
  const [focusMode, setFocusMode] = useState(false);
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const [showSpaceCreator, setShowSpaceCreator] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<number | null>(null);
  const autosaveRef = useRef<number | null>(null);
  const lastAutoText = useRef("");

  useEffect(() => { localStorage.setItem("flowsense-draft", text); }, [text]);
  useEffect(() => () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); if (autosaveRef.current) window.clearTimeout(autosaveRef.current); }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const requestSuggestion = async (mode: Mode, source = text) => {
    if (!source.trim()) { setNotice("Write a little something first, then try Improve."); return; }
    setLoading(mode); setNotice("");
    try {
      const response = await fetch(`${API_URL}/improve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: getPlainText(source), mode }) });
      if (!response.ok) throw new Error("Suggestion service unavailable");
      const data = await response.json();
      if (!data.result) throw new Error("No suggestion returned");
      setSuggestion(data.result);
    } catch { setNotice("Writing suggestions are unavailable right now. Please try again shortly."); }
    finally { setLoading(null); }
  };

  const handleTextChange = (nextText: string) => {
    setText(nextText); setSuggestion(""); setNotice("");
    if (activeDocumentId) { const current = documents.find((document) => document.id === activeDocumentId); updateDocument(activeDocumentId, { content: nextText, title: current?.title === "Untitled note" ? getDocumentTitle({ content: nextText, title: "" }) : current?.title, updatedAt: Date.now(), wordCount: getWordCount(nextText), readingTime: getReadingMinutes(nextText) }); setNotice("Saving…"); if (autosaveRef.current) window.clearTimeout(autosaveRef.current); autosaveRef.current = window.setTimeout(() => setNotice("Saved just now"), 650); }
    if (!autoHelp || nextText.trim().length < 40) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => { if (nextText !== lastAutoText.current) { lastAutoText.current = nextText; requestSuggestion("improve", nextText); } }, 1600);
  };

  const saveDraft = () => {
    if (!text.trim()) { setNotice("Nothing to save yet."); return; }
    const now = Date.now();
    if (activeDocumentId) updateDocument(activeDocumentId, { content: text, title: draftTitle.trim() || "Untitled note", tags: draftTags, mode: draftMode, updatedAt: now, wordCount: getWordCount(text), readingTime: getReadingMinutes(text) });
    else { const document = createDocument(text, activeSpace ?? "personal", draftMode); setActiveDocumentId(document.id); updateDocument(document.id, { title: draftTitle.trim() || "Untitled note", tags: draftTags }); }
    setNotice("Saved to your writing library.");
  };
  const saveAndNew = () => { if (text.trim()) saveDraft(); setShowModePicker(true); };
  const openNewDocument = (space: string, mode: WritingMode = draftMode) => { setActiveDocumentId(null); setDraftTitle(""); setDraftTags([]); setDraftMode(mode); setActiveSpace(space); setText(""); setSuggestion(""); setNotice("Fresh page, ready when you are."); setShowSpacePicker(false); setShowModePicker(false); setTab("write"); window.setTimeout(() => textareaRef.current?.focus(), 0); };
  const handleNew = (space?: string) => { if (space) { setActiveSpace(space); setShowModePicker(true); } else { setActiveSpace(null); setShowModePicker(true); } };
  const downloadPDF = () => { if (!text.trim()) return; const document = new jsPDF({ unit: "mm", format: "a4" }); const lines = document.splitTextToSize(text, 170) as string[]; const linesPerPage = 42; for (let index = 0; index < lines.length; index += linesPerPage) { if (index > 0) document.addPage(); document.text(lines.slice(index, index + linesPerPage), 20, 24, { maxWidth: 170, lineHeightFactor: 1.55 }); document.setFontSize(9); document.setTextColor(145, 132, 122); document.text(String(Math.floor(index / linesPerPage) + 1), 105, 285, { align: "center" }); document.setFontSize(12); document.setTextColor(53, 43, 37); } document.save("flowsense-writing.pdf"); };
  const downloadDOCX = async () => { if (!text.trim()) return; const document = new Document({ sections: [{ children: text.split(/\n/).map((line) => new Paragraph({ text: line })) }] }); saveAs(await Packer.toBlob(document), "flowsense-writing.docx"); };
  const downloadTXT = () => { if (!text.trim()) return; saveAs(new Blob([text], { type: "text/plain;charset=utf-8" }), "flowsense-writing.txt"); };
  const renameDraft = (id: string, title: string) => updateDocument(id, { title });
  const toggleFavorite = (id: string) => { const document = documents.find((item) => item.id === id); if (document) updateDocument(id, { favorite: !document.favorite }); };
  const moveDocument = (id: string, space: string) => updateDocument(id, { space, updatedAt: Date.now() });
  const bulkDelete = (ids: string[]) => ids.forEach((id) => deleteDocument(id));
  const bulkMove = (ids: string[], space: string) => ids.forEach((id) => moveDocument(id, space));
  const handleCreateSpace = (label: string) => { const space = createSpace(label); if (space) setActiveSpace(space.id); setShowSpaceCreator(false); };

  return <div className="app">
    {!focusMode && <Navbar activeTab={tab} setActiveTab={setTab} onNew={handleNew} onSave={saveAndNew} />}
    {tab === "home" && <Home documents={documents} spaces={spaces} onNew={() => handleNew()} onOpenLibrary={() => setTab("history")} onOpen={(document) => { setText(getContent(document)); setDraftTitle(document.title); setDraftTags(document.tags); setDraftMode(document.mode); setActiveDocumentId(document.id); setActiveSpace(document.space); setTab("write"); setNotice("Document opened."); }} />}
{tab === "write" && <WriteScreen text={text} title={draftTitle} mode={draftMode} spaceLabel={spaces.find((space) => space.id === activeSpace)?.label ?? (activeSpace === "none" ? UNASSIGNED_SPACE.label : "Personal")} space={activeSpace} tags={draftTags} relatedDocuments={documents} currentDocumentId={activeDocumentId} statusValue={documents.find((document) => document.id === activeDocumentId)?.status ?? "draft"} favorite={Boolean(documents.find((document) => document.id === activeDocumentId)?.favorite)} focusMode={focusMode} textareaRef={textareaRef} wordCount={wordCount} charCount={charCount} readingMinutes={readingMinutes} loading={loading !== null} suggestion={suggestion} status={notice} autoHelp={autoHelp} onTextChange={handleTextChange} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveDraft(); } if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); setFocusMode((value) => !value); } }} onTitleChange={(title) => { setDraftTitle(title); if (activeDocumentId) updateDocument(activeDocumentId, { title }); }} onModeChange={(mode) => { if (mode === "document" && draftMode !== "document") setText(getPlainText(text)); setDraftMode(mode); if (activeDocumentId) updateDocument(activeDocumentId, { mode }); }} onStatusChange={(status) => { if (activeDocumentId) updateDocument(activeDocumentId, { status }); }} onTagsChange={(tags) => { setDraftTags(tags); if (activeDocumentId) updateDocument(activeDocumentId, { tags }); }} onToggleFavorite={() => { if (activeDocumentId) toggleFavorite(activeDocumentId); }} onToggleFocus={() => setFocusMode((value) => !value)} onImprove={() => requestSuggestion("improve")} onSave={saveDraft} onSuggestionsChange={setAutoHelp} onDismissSuggestion={() => setSuggestion("")} onUseSuggestion={() => { setText(suggestion); setSuggestion(""); setNotice("Refinement applied."); }} onExportPDF={downloadPDF} onExportDOCX={downloadDOCX} onExportTXT={downloadTXT} onOpenRelated={(document) => { setText(getContent(document)); setDraftTitle(document.title); setDraftTags(document.tags); setDraftMode(document.mode); setActiveDocumentId(document.id); setActiveSpace(document.space); setNotice("Related document opened."); }} />}
    {tab === "history" && <Library documents={documents} spaces={spaces} onOpen={(document: FlowDocument) => { setText(getContent(document)); setDraftTitle(document.title); setDraftTags(document.tags); setDraftMode(document.mode); setActiveDocumentId(document.id); setActiveSpace(document.space); setTab("write"); setNotice("Document opened."); }} onRename={renameDraft} onDelete={deleteDocument} onFavorite={toggleFavorite} onMove={moveDocument} onDuplicate={(id) => duplicateDocument(id)} onBulkDelete={bulkDelete} onBulkMove={bulkMove} onStartWriting={handleNew} onCreateSpace={() => setShowSpaceCreator(true)} onSpaceChange={setActiveSpace} />}
    {tab === "insights" && <InsightsDashboard documents={documents} spaces={spaces} />}
    {showModePicker && <WritingModePicker onSelect={(mode) => { setDraftMode(mode); setShowModePicker(false); if (activeSpace) openNewDocument(activeSpace, mode); else setShowSpacePicker(true); }} onClose={() => setShowModePicker(false)} />}
    {showSpacePicker && <SpacePicker spaces={spaces} onSelect={(space) => openNewDocument(space, draftMode)} onClose={() => setShowSpacePicker(false)} />}
    {showSpaceCreator && <SpaceCreator onCreate={handleCreateSpace} onClose={() => setShowSpaceCreator(false)} />}
  </div>;
}

export default App;
