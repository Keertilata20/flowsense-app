import { FileText, FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Draft } from "./types";
import { getDocumentTitle, getPreview, getReadingMinutes, getWordCount } from "./types";

type DocumentCardProps = { document: Draft; onOpen: (document: Draft) => void; onRename: (id: string, title: string) => void; onDelete: (id: string) => void };

export default function DocumentCard({ document, onOpen, onRename, onDelete }: DocumentCardProps) {
  const title = getDocumentTitle(document);
  const [editing, setEditing] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const saveTitle = () => { const trimmed = nextTitle.trim(); if (trimmed) onRename(document.id, trimmed); setEditing(false); };
  const confirmDelete = () => { if (window.confirm(`Delete "${title}"? This cannot be undone.`)) onDelete(document.id); };
  return <article className="group relative rounded-xl border border-[#ebe1d8] bg-[#fffdf9] p-5 transition-colors hover:border-[#d7c4b5] sm:p-6">
    <div className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#f6ece3] text-[#9a6248]"><FileText size={15} strokeWidth={1.7} /></span><div className="min-w-0 flex-1">{editing ? <input autoFocus value={nextTitle} onChange={(event) => setNextTitle(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === "Enter") saveTitle(); if (event.key === "Escape") { setNextTitle(title); setEditing(false); } }} className="w-full rounded border border-[#cdb39f] bg-white px-2 py-1 font-['Instrument_Serif',Georgia,serif] text-xl text-[#42342c] outline-none" aria-label="Document title" /> : <button className="block max-w-full text-left font-['Instrument_Serif',Georgia,serif] text-xl leading-tight text-[#42342c] hover:text-[#87513a]" onClick={() => onOpen(document)}>{title}</button>}<p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#88786d]">{getPreview(document.text)}</p></div><details className="relative shrink-0"><summary className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md text-[#9c8d82] opacity-0 transition hover:bg-[#f6ece3] hover:text-[#624d40] group-hover:opacity-100 focus:opacity-100"><MoreHorizontal size={17} /><span className="sr-only">Document actions</span></summary><div className="absolute right-0 top-8 z-10 grid w-28 rounded-lg border border-[#e7dcd2] bg-[#fffdf9] p-1 shadow-[0_8px_20px_rgba(66,43,28,.08)]"><button className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-[#67564b] hover:bg-[#f7eee6]" onClick={() => onOpen(document)}><FolderOpen size={13} />Open</button><button className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-[#67564b] hover:bg-[#f7eee6]" onClick={() => setEditing(true)}><Pencil size={13} />Rename</button><button className="flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-[#9b5140] hover:bg-[#f9ece7]" onClick={confirmDelete}><Trash2 size={13} />Delete</button></div></details></div>
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#f1e9e1] pt-3 text-xs text-[#9b8c81]"><span>Edited {document.savedAt}</span><span>•</span><span>{getWordCount(document.text)} words</span><span>•</span><span>{getReadingMinutes(document.text)} min read</span></div>
  </article>;
}
