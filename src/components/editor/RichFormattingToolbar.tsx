/* eslint-disable react-hooks/refs */
import { Bold, Italic, Underline, Heading2, List, ListChecks, Quote } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

type Props = { targetRef: RefObject<HTMLElement | null> };

export default function RichFormattingToolbar({ targetRef }: Props) {
  const savedSelection = useRef<Range | null>(null);
  const [active, setActive] = useState({ bold: false, italic: false, underline: false, heading: false, list: false, checklist: false, quote: false, font: "", size: "" });
  const target = () => targetRef.current;
  const refresh = () => {
    const editor = target();
    const selection = globalThis.document.getSelection();
    if (!(editor instanceof HTMLElement) || !selection?.rangeCount || !editor.contains(selection.anchorNode)) return;
    const parent = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement;
    const list = parent?.closest("ul, ol");
    const block = parent?.closest("h1, h2, h3, blockquote");
    const format = globalThis.document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
    const font = globalThis.document.queryCommandValue("fontName").replace(/["']/g, "");
    const size = globalThis.document.queryCommandValue("fontSize");
    setActive({
      bold: globalThis.document.queryCommandState("bold"),
      italic: globalThis.document.queryCommandState("italic"),
      underline: globalThis.document.queryCommandState("underline"),
      heading: Boolean(block?.matches("h1, h2, h3") || /^h[1-3]$/.test(format)),
      list: Boolean(list),
      checklist: Boolean(list?.matches("ul[data-checklist]")),
      quote: Boolean(block?.matches("blockquote") || format === "blockquote"),
      font: ["Georgia", "Inter", "Courier New"].find((value) => value.toLowerCase() === font.toLowerCase()) ?? "",
      size: ["2", "3", "4", "5"].includes(size) ? size : "",
    });
  };
  const saveSelection = () => { const editor = target(); const selection = globalThis.document.getSelection(); if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) savedSelection.current = selection.getRangeAt(0).cloneRange(); };
  const restoreSelection = () => { if (!savedSelection.current) return; const selection = globalThis.document.getSelection(); selection?.removeAllRanges(); selection?.addRange(savedSelection.current); };
  useEffect(() => {
    const editor = target();
    const update = () => refresh();
    globalThis.document.addEventListener("selectionchange", update);
    globalThis.document.addEventListener("keyup", update);
    globalThis.document.addEventListener("mouseup", update);
    editor?.addEventListener("focus", update);
    refresh();
    return () => { globalThis.document.removeEventListener("selectionchange", update); globalThis.document.removeEventListener("keyup", update); globalThis.document.removeEventListener("mouseup", update); editor?.removeEventListener("focus", update); };
    // The toolbar intentionally observes the current selection rather than render state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef]);
  const command = (name: string, value?: string) => { const editor = target(); if (!(editor instanceof HTMLElement) || !editor.isContentEditable) return; editor.focus(); restoreSelection(); globalThis.document.execCommand(name, false, value); refresh(); };
  const apply = (kind: "bold" | "italic" | "underline") => command(kind);
  const line = (kind: "heading" | "list" | "check" | "quote") => { const editor = target(); if (!(editor instanceof HTMLElement) || !editor.isContentEditable) return; editor.focus(); if (kind === "heading") command("formatBlock", "h2"); else if (kind === "quote") command("formatBlock", "blockquote"); else if (kind === "list") command("insertUnorderedList"); else { command("insertUnorderedList"); const selection = globalThis.document.getSelection(); const list = selection?.anchorNode instanceof Element ? selection.anchorNode.closest("ul") : selection?.anchorNode?.parentElement?.closest("ul"); list?.setAttribute("data-checklist", "true"); refresh(); } };
  const buttons = [["Bold", <Bold size={15} />, () => apply("bold"), active.bold], ["Italic", <Italic size={15} />, () => apply("italic"), active.italic], ["Underline", <Underline size={15} />, () => apply("underline"), active.underline], ["Heading", <Heading2 size={15} />, () => line("heading"), active.heading], ["Bulleted list", <List size={15} />, () => line("list"), active.list && !active.checklist], ["Checklist", <ListChecks size={15} />, () => line("check"), active.checklist], ["Quote", <Quote size={15} />, () => line("quote"), active.quote]] as const;
  const activeClass = "bg-[#ead8c8] text-[#553b2d] shadow-inner";
  return <div className="flex flex-wrap items-center gap-0.5 border-b border-[#ece2d8] px-5 py-2 sm:px-8" aria-label="Formatting toolbar">{buttons.map(([label, icon, action, isActive]) => <button key={label} type="button" title={label} aria-label={label} aria-pressed={isActive} onMouseDown={(event) => { saveSelection(); event.preventDefault(); }} onClick={action} className={`grid h-8 w-8 items-center justify-center rounded-md text-[#806f63] transition hover:bg-[#f7eee6] hover:text-[#4f3c31] ${isActive ? activeClass : ""}`}>{icon}</button>)}<span className="mx-1 h-5 w-px bg-[#e5d9cf]" /><select aria-label="Font family" title="Font family" value={active.font} onMouseDown={saveSelection} onChange={(event) => command("fontName", event.target.value)} className={`h-8 rounded-md bg-transparent px-1 text-xs text-[#75665c] outline-none hover:bg-[#f7eee6] ${active.font ? activeClass : ""}`}><option value="">Font</option><option value="Georgia">Serif</option><option value="Inter">Sans</option><option value="Courier New">Mono</option></select><select aria-label="Font size" title="Font size" value={active.size} onMouseDown={saveSelection} onChange={(event) => command("fontSize", event.target.value)} className={`h-8 rounded-md bg-transparent px-1 text-xs text-[#75665c] outline-none hover:bg-[#f7eee6] ${active.size ? activeClass : ""}`}><option value="">Size</option><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">XL</option></select></div>;
}
