import { useEffect, useRef, type RefObject } from "react";
import RichFormattingToolbar from "./RichFormattingToolbar";

type Props = { value: string; mode: "note" | "journal"; textareaRef?: RefObject<HTMLTextAreaElement | null>; onChange: (value: string) => void; onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void };
export default function FlowingEditor({ value, mode, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value; }, [value]);
  return <div className={`mx-auto min-h-[620px] w-full max-w-[820px] bg-[#fffdf9] ${mode === "journal" ? "sm:px-24" : "sm:px-20"}`}><RichFormattingToolbar targetRef={editorRef} /><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.innerHTML)} data-placeholder={mode === "journal" ? "Begin today's entry…" : "Begin with a thought…"} className="rich-editor min-h-[520px] w-full px-7 py-14 font-['Instrument_Serif',Georgia,serif] text-[1.35rem] leading-[1.85] tracking-[-0.008em] text-[#352b25] outline-none empty:before:pointer-events-none empty:before:block empty:before:text-[#b8aca1] empty:before:content-[attr(data-placeholder)] sm:min-h-[640px] sm:px-0 sm:py-20 sm:text-[1.5rem]" aria-label="Writing editor" /></div>;
}
