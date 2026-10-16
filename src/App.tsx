import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import WriteScreen from "./components/editor/WriteScreen";
import Library from "./components/library/Library";
import SpacePicker from "./components/library/SpacePicker";
import SpaceCreator from "./components/library/SpaceCreator";
import WritingModePicker from "./components/library/WritingModePicker";
import { getContent, getDocumentTitle, getPlainText, getReadingMinutes, getWordCount, sanitizeEditorHtml, UNASSIGNED_SPACE, type FlowDocument, type SpaceDefinition, type WritingMode } from "./components/library/types";
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
  const [autoHelp, setAutoHelp] = useState(false);
  const [notice, setNotice] = useState("");
  const { documents, createDocument, updateDocument, deleteDocument, duplicateDocument, replaceDocuments } = useDocuments();
  const { spaces, createSpace, replaceSpaces } = useSpaces();
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

  useEffect(() => { try { localStorage.setItem("flowsense-draft", text); } catch (error) { console.error("Threadloom could not save the current draft", error); } }, [text]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (text.trim() && (!activeDocumentId || documents.find((document) => document.id === activeDocumentId)?.content !== text)) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [activeDocumentId, documents, text]);
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
  const hasUnsavedDraft = () => Boolean(text.trim() && (!activeDocumentId || documents.find((document) => document.id === activeDocumentId)?.content !== text));
  const confirmLeaveDraft = () => !hasUnsavedDraft() || window.confirm("You have unsaved writing. Leave it and discard this draft?");
  const openDocument = (document: FlowDocument) => { if (!confirmLeaveDraft()) return; setText(getContent(document)); setDraftTitle(document.title); setDraftTags(document.tags); setDraftMode(document.mode); setActiveDocumentId(document.id); setActiveSpace(document.space); setTab("write"); setNotice("Document opened."); };
  const saveAndNew = () => { if (text.trim()) saveDraft(); setShowModePicker(true); };
  const openNewDocument = (space: string, mode: WritingMode = draftMode) => { if (!confirmLeaveDraft()) return; setActiveDocumentId(null); setDraftTitle(""); setDraftTags([]); setDraftMode(mode); setActiveSpace(space); setText(""); setSuggestion(""); setNotice("Fresh page, ready when you are."); setShowSpacePicker(false); setShowModePicker(false); setTab("write"); window.setTimeout(() => textareaRef.current?.focus(), 0); };
  const handleNew = (space?: string) => { if (space) { setActiveSpace(space); setShowModePicker(true); } else { setActiveSpace(null); setShowModePicker(true); } };
  const downloadPDF = async () => {
    if (!text.trim()) return;
    const exportText = text;
    setNotice("Preparing PDF export…");
    const [{ default: JsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);
    const pdf = new JsPDF({ unit: "mm", format: "a4", compress: true });
    const exportNode = globalThis.document.createElement("div");
    exportNode.innerHTML = sanitizeEditorHtml(exportText).replace(/<div data-threadloom-page-break="true"><\/div>/g, '<div style="page-break-before: always;"></div>');
    exportNode.style.width = "170mm";
    exportNode.style.boxSizing = "border-box";
    exportNode.style.paddingBottom = "12mm";
    exportNode.style.color = "#352b25";
    exportNode.style.fontFamily = "'Instrument Serif', Georgia, serif";
    exportNode.style.fontSize = "12pt";
    exportNode.style.lineHeight = "1.55";
    exportNode.style.overflowWrap = "anywhere";
    exportNode.style.wordBreak = "break-word";
    exportNode.querySelectorAll("h1, h2, h3").forEach((heading) => { const element = heading as HTMLElement; element.style.margin = "0 0 8pt"; element.style.lineHeight = "1.2"; });
    exportNode.querySelectorAll("blockquote").forEach((quote) => { quote.setAttribute("style", "border-left: 3px solid #bd927a; margin: 10pt 0; padding-left: 10pt; color: #785d4d;"); });
    exportNode.querySelectorAll("p, ul, ol, blockquote").forEach((block) => { if (!block.getAttribute("style")) block.setAttribute("style", "margin: 0 0 8pt;"); });
    exportNode.style.position = "absolute";
    exportNode.style.left = "0";
    exportNode.style.top = "0";
    exportNode.style.zIndex = "-1";
    exportNode.setAttribute("aria-hidden", "true");
    exportNode.style.backgroundColor = "#ffffff";
    globalThis.document.body.appendChild(exportNode);
    try {
      const canvas = await html2canvas(exportNode, { backgroundColor: "#ffffff", scale: 2.5, useCORS: true, logging: false, width: exportNode.scrollWidth, height: exportNode.scrollHeight, windowWidth: exportNode.scrollWidth });
      const margin = 20;
      const contentWidth = 170;
      const contentHeight = 252;
      const pixelsPerMillimetre = canvas.width / contentWidth;
      const pageSliceHeight = Math.max(1, Math.floor(contentHeight * pixelsPerMillimetre));
      const pageCount = Math.max(1, Math.ceil(canvas.height / pageSliceHeight));
      for (let page = 0; page < pageCount; page += 1) {
        if (page > 0) pdf.addPage();
        const sourceY = page * pageSliceHeight;
        const sliceHeight = Math.min(pageSliceHeight, canvas.height - sourceY);
        const slice = globalThis.document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceHeight;
        const context = slice.getContext("2d");
        if (!context) throw new Error("Could not prepare PDF page");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, slice.width, slice.height);
        context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, slice.width, slice.height);
        const renderedHeight = sliceHeight / pixelsPerMillimetre;
        pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, margin, contentWidth, renderedHeight, undefined, "FAST");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(145, 132, 122);
        pdf.text(`${page + 1} / ${pageCount}`, 105, 287, { align: "center" });
      }
      pdf.save("threadloom-writing.pdf");
      setNotice("PDF downloaded.");
    } catch { setNotice("PDF export failed. Please try again."); }
    finally { exportNode.remove(); }
  };
  const downloadDOCX = async () => {
    if (!text.trim()) return;
    const exportText = text;
    setNotice("Preparing Word export…");
    const { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, PageNumber, Packer, Paragraph, TextRun } = await import("docx");
    const sanitized = sanitizeEditorHtml(exportText);
    const parsed = new DOMParser().parseFromString(`<div>${sanitized}</div>`, "text/html");
    type RunStyle = { bold?: boolean; italics?: boolean; underline?: object; font?: string; size?: number };
    const runsFor = (node: Node, style: RunStyle = {}): InstanceType<typeof TextRun>[] => {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ? [new TextRun({ text: node.nodeValue, ...style })] : [];
      if (!(node instanceof Element)) return Array.from(node.childNodes).flatMap((child) => runsFor(child, style));
      if (node.tagName === "BR") return [new TextRun({ break: 1 })];
      const nextStyle: RunStyle = { ...style };
      if (node.matches("strong, b")) nextStyle.bold = true;
      if (node.matches("em, i")) nextStyle.italics = true;
      if (node.matches("u")) nextStyle.underline = {};
      if (node.tagName === "FONT" && node.getAttribute("face")) nextStyle.font = node.getAttribute("face") ?? undefined;
      if (node.tagName === "FONT" && node.getAttribute("size")) nextStyle.size = Math.max(16, Number(node.getAttribute("size")) * 2);
      return Array.from(node.childNodes).flatMap((child) => runsFor(child, nextStyle));
    };
    const paragraphs: InstanceType<typeof Paragraph>[] = [];
    const addBlock = (element: Element, listType?: "bullet" | "number") => {
      if (element.matches("ul, ol")) { Array.from(element.children).filter((child) => child.matches("li")).forEach((child) => addBlock(child, element.tagName === "OL" ? "number" : "bullet")); return; }
      if (element.matches("div[data-threadloom-page-break]")) { paragraphs.push(new Paragraph({ pageBreakBefore: true })); return; }
      const children = runsFor(element, { font: "Instrument Serif", size: 28 });
      if (!children.length) { paragraphs.push(new Paragraph({ spacing: { after: 160 } })); return; }
      const options: Record<string, unknown> = { children, spacing: { after: 160 } };
      if (listType === "bullet") options.bullet = { level: 0 };
      if (listType === "number") options.numbering = { reference: "threadloom-numbered", level: 0 };
      if (element.matches("h1")) options.heading = HeadingLevel.HEADING_1;
      if (element.matches("h2")) options.heading = HeadingLevel.HEADING_2;
      if (element.matches("h3")) options.heading = HeadingLevel.HEADING_3;
      if (element.matches("blockquote")) { options.indent = { left: 720 }; options.border = { left: { style: BorderStyle.SINGLE, size: 6, color: "BD927A", space: 8 } }; }
      paragraphs.push(new Paragraph(options));
    };
    Array.from(parsed.body.firstElementChild?.children ?? []).forEach((element) => addBlock(element));
    const document = new Document({ numbering: { config: [{ reference: "threadloom-numbered", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT }] }] }, sections: [{ footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" of "), new TextRun({ children: [PageNumber.TOTAL_PAGES] })] })] }) }, children: paragraphs }] });
    saveAs(await Packer.toBlob(document), "threadloom-writing.docx");
    setNotice("Word document downloaded.");
  };
  const downloadTXT = () => { if (!text.trim()) return; const exportText = text; saveAs(new Blob([getPlainText(exportText)], { type: "text/plain;charset=utf-8" }), "threadloom-writing.txt"); setNotice("Plain text downloaded."); };
  const renameDraft = (id: string, title: string) => updateDocument(id, { title });
  const toggleFavorite = (id: string) => { const document = documents.find((item) => item.id === id); if (document) updateDocument(id, { favorite: !document.favorite }); };
  const moveDocument = (id: string, space: string) => updateDocument(id, { space, updatedAt: Date.now() });
  const bulkDelete = (ids: string[]) => ids.forEach((id) => deleteDocument(id));
  const bulkMove = (ids: string[], space: string) => ids.forEach((id) => moveDocument(id, space));
  const handleCreateSpace = (label: string) => { const space = createSpace(label); if (space) setActiveSpace(space.id); setShowSpaceCreator(false); };
  const exportBackup = () => { const payload = { app: "threadloom", version: 1, exportedAt: new Date().toISOString(), documents, spaces: spaces.filter((space) => space.custom) }; saveAs(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `threadloom-backup-${new Date().toISOString().slice(0, 10)}.json`); setNotice("Backup downloaded."); };
  const importBackup = (file: File) => { const reader = new FileReader(); reader.onload = () => { try { const payload = JSON.parse(String(reader.result)); if (!Array.isArray(payload?.documents) || !Array.isArray(payload?.spaces)) throw new Error("Invalid backup"); if (!window.confirm("Restore this backup? Your current documents and custom Spaces will be replaced.")) return; replaceDocuments(payload.documents); replaceSpaces(payload.spaces as SpaceDefinition[]); setActiveDocumentId(null); setText(""); setTab("home"); setNotice("Backup restored."); } catch { setNotice("That backup file is invalid or could not be restored."); } }; reader.readAsText(file); };

  return <div className="app">
    {!focusMode && <Navbar activeTab={tab} setActiveTab={setTab} onNew={handleNew} onSave={saveAndNew} />}
    {tab === "home" && <Home documents={documents} spaces={spaces} onNew={() => handleNew()} onOpenLibrary={(space) => { setActiveSpace(space ?? null); setTab("history"); }} onOpen={openDocument} />}
    {tab === "write" && <WriteScreen text={text} title={draftTitle} mode={draftMode} spaceLabel={spaces.find((space) => space.id === activeSpace)?.label ?? (activeSpace === "none" ? UNASSIGNED_SPACE.label : "Personal")} space={activeSpace} tags={draftTags} relatedDocuments={documents} currentDocumentId={activeDocumentId} statusValue={documents.find((document) => document.id === activeDocumentId)?.status ?? "draft"} favorite={Boolean(documents.find((document) => document.id === activeDocumentId)?.favorite)} focusMode={focusMode} textareaRef={textareaRef} wordCount={wordCount} charCount={charCount} readingMinutes={readingMinutes} loading={loading !== null} suggestion={suggestion} status={notice} autoHelp={autoHelp} onTextChange={handleTextChange} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveDraft(); } if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); setFocusMode((value) => !value); } }} onTitleChange={(title) => { setDraftTitle(title); if (activeDocumentId) updateDocument(activeDocumentId, { title }); }} onModeChange={(mode) => { if (mode === "document" && draftMode !== "document") setText(getPlainText(text)); setDraftMode(mode); if (activeDocumentId) updateDocument(activeDocumentId, { mode }); }} onStatusChange={(status) => { if (activeDocumentId) updateDocument(activeDocumentId, { status }); }} onTagsChange={(tags) => { setDraftTags(tags); if (activeDocumentId) updateDocument(activeDocumentId, { tags }); }} onToggleFavorite={() => { if (activeDocumentId) toggleFavorite(activeDocumentId); }} onToggleFocus={() => setFocusMode((value) => !value)} onImprove={() => requestSuggestion("improve")} onSave={saveDraft} onSuggestionsChange={setAutoHelp} onDismissSuggestion={() => setSuggestion("")} onUseSuggestion={() => { setText(suggestion); setSuggestion(""); setNotice("Refinement applied."); }} onExportPDF={downloadPDF} onExportDOCX={downloadDOCX} onExportTXT={downloadTXT} onOpenRelated={openDocument} />}
    {tab === "history" && <Library documents={documents} spaces={spaces} initialSpace={activeSpace} onOpen={openDocument} onRename={renameDraft} onDelete={deleteDocument} onFavorite={toggleFavorite} onMove={moveDocument} onDuplicate={(id) => duplicateDocument(id)} onBulkDelete={bulkDelete} onBulkMove={bulkMove} onStartWriting={handleNew} onCreateSpace={() => setShowSpaceCreator(true)} onSpaceChange={setActiveSpace} onExportBackup={exportBackup} onImportBackup={importBackup} />}
    {tab === "insights" && <InsightsDashboard documents={documents} spaces={spaces} />}
    {showModePicker && <WritingModePicker onSelect={(mode) => { setDraftMode(mode); setShowModePicker(false); if (activeSpace) openNewDocument(activeSpace, mode); else setShowSpacePicker(true); }} onClose={() => setShowModePicker(false)} />}
    {showSpacePicker && <SpacePicker spaces={spaces} onSelect={(space) => openNewDocument(space, draftMode)} onClose={() => setShowSpacePicker(false)} />}
    {showSpaceCreator && <SpaceCreator onCreate={handleCreateSpace} onClose={() => setShowSpaceCreator(false)} />}
  </div>;
}

export default App;
