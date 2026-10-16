import { useEffect, useRef, type RefObject } from "react";
import RichFormattingToolbar from "./RichFormattingToolbar";
import { sanitizeEditorHtml } from "../library/types";

type Props = { value: string; mode: "note" | "journal"; textareaRef?: RefObject<HTMLTextAreaElement | null>; onChange: (value: string) => void; onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void };
export default function FlowingEditor({ value, mode, onChange, onKeyDown }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditing = useRef(false);
  useEffect(() => { if (!isEditing.current && editorRef.current && editorRef.current.innerHTML !== sanitizeEditorHtml(value)) editorRef.current.innerHTML = sanitizeEditorHtml(value); }, [value]);
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => { event.preventDefault(); globalThis.document.execCommand("insertText", false, event.clipboardData.getData("text/plain")); };
  return <div className={`mx-auto min-h-[620px] w-full max-w-[820px] bg-[#fffdf9] ${mode === "journal" ? "sm:px-24" : "sm:px-20"}`}><RichFormattingToolbar targetRef={editorRef} /><div ref={editorRef} contentEditable suppressContentEditableWarning onFocus={() => { isEditing.current = true; }} onBlur={() => { isEditing.current = false; }} onKeyDown={onKeyDown} onPaste={handlePaste} onInput={(event) => onChange(event.currentTarget.innerHTML)} data-placeholder={mode === "journal" ? "Begin today's entry…" : "Begin with a thought…"} className="rich-editor min-h-[520px] w-full px-7 py-14 font-['Instrument_Serif',Georgia,serif] text-[1.35rem] leading-[1.85] tracking-[-0.008em] text-[#352b25] outline-none empty:before:pointer-events-none empty:before:block empty:before:text-[#b8aaa1] empty:before:content-[attr(data-placeholder)] sm:min-h-[640px] sm:px-0 sm:py-20 sm:text-[1.5rem]" aria-label="Writing editor" /> </div>;
}
