import { useEffect, useRef, type RefObject } from "react";
import "./PaginatedEditor.css";
import RichFormattingToolbar from "./RichFormattingToolbar";
import { sanitizeEditorHtml } from "../library/types";

const PAGE_CHARACTER_LIMIT = 1800;
const PAGE_BREAK = '<div data-threadloom-page-break="true"></div>';
type Props = { value: string; textareaRef: RefObject<HTMLTextAreaElement | null>; onChange: (value: string) => void; onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void };

function paginate(value: string) {
  if (!value) return [""];
  if (value.includes(PAGE_BREAK)) return value.split(PAGE_BREAK).map(sanitizeEditorHtml);
  const html = sanitizeEditorHtml(value);
  const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const blocks = Array.from(parsed.body.firstElementChild?.children ?? []);
  if (!blocks.length) return [html];
  const pages: string[] = [];
  let page = "";
  let pageLength = 0;
  blocks.forEach((block) => {
    const blockHtml = block.outerHTML;
    const blockLength = block.textContent?.length ?? 0;
    if (page && pageLength + blockLength > PAGE_CHARACTER_LIMIT) {
      pages.push(page);
      page = "";
      pageLength = 0;
    }
    page += blockHtml;
    pageLength += blockLength;
  });
  if (page || !pages.length) pages.push(page);
  return pages;
}

type EditablePageProps = { html: string; index: number; setPage: (index: number, node: HTMLDivElement | null) => void; onChange: (html: string) => void; onFocus: () => void; onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void; onPaste: (event: React.ClipboardEvent<HTMLDivElement>) => void };
function EditablePage({ html, index, setPage, onChange, onFocus, onKeyDown, onPaste }: EditablePageProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditing = useRef(false);
  useEffect(() => { if (!isEditing.current && editorRef.current && editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html; }, [html]);
  return <div ref={(node) => { editorRef.current = node; setPage(index, node); }} contentEditable suppressContentEditableWarning onFocus={() => { isEditing.current = true; onFocus(); }} onBlur={() => { isEditing.current = false; }} onKeyDown={onKeyDown} onPaste={onPaste} onInput={(event) => onChange(event.currentTarget.innerHTML)} className="rich-editor editor-textarea block min-h-[820px] w-full overflow-hidden border-0 bg-transparent p-0 font-['Instrument_Serif',Georgia,serif] text-[1.3rem] leading-[1.82] tracking-[-0.008em] text-[#352b25] outline-none empty:before:pointer-events-none empty:before:block empty:before:text-[#b8aaa1] empty:before:content-[attr(data-placeholder)] sm:min-h-[939px] sm:text-[1.48rem]" data-placeholder={index === 0 ? "Begin with a thought…" : "Continue writing…"} aria-label={`Writing page ${index + 1}`} />;
}

export default function PaginatedEditor({ value, textareaRef: _textareaRef, onChange, onKeyDown }: Props) {
  void _textareaRef;
  const activeEditorRef = useRef<HTMLElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pages = paginate(value);
  const setPage = (index: number, node: HTMLDivElement | null) => { pageRefs.current[index] = node; if (index === 0 && !activeEditorRef.current) activeEditorRef.current = node; };
  const updatePage = (index: number, html: string) => { const nextPages = [...pages]; nextPages[index] = html; onChange(nextPages.join(PAGE_BREAK)); };
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => { event.preventDefault(); globalThis.document.execCommand("insertText", false, event.clipboardData.getData("text/plain")); };
  return <div className="page-editor-shell px-1 pb-8 sm:px-6"><div className="mx-auto mb-4 w-full max-w-[794px] rounded-t-lg bg-[#fffdf9]"><RichFormattingToolbar targetRef={activeEditorRef} /></div><div className="mx-auto w-full max-w-[794px] space-y-6">{pages.map((page, index) => <article key={index} className="a4-page relative mx-auto min-h-[920px] w-full max-w-[794px] bg-[#fffdf9] px-8 py-14 shadow-[0_5px_18px_rgba(66,43,28,.07)] sm:min-h-[1123px] sm:px-[88px] sm:py-[92px]"><EditablePage html={page} index={index} setPage={setPage} onFocus={() => { activeEditorRef.current = pageRefs.current[index]; }} onKeyDown={onKeyDown} onPaste={handlePaste} onChange={(html) => updatePage(index, html)} /><span className="absolute bottom-7 left-0 w-full text-center text-xs tabular-nums text-[#b9aaa0] sm:bottom-10">{index + 1}</span></article>)}</div></div>;
}
