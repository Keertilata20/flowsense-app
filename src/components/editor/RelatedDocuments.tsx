import { ArrowUpRight, FileText } from "lucide-react";
import type { FlowDocument } from "../library/types";
import { getDocumentTitle } from "../library/types";

type RelatedDocumentsProps = { documents: FlowDocument[]; currentId: string | null; space: string | null; tags: string[]; onOpen: (document: FlowDocument) => void };
export default function RelatedDocuments({ documents, currentId, space, tags, onOpen }: RelatedDocumentsProps) {
  const related = documents.filter((document) => document.id !== currentId && (document.space === space || document.tags.some((tag) => tags.includes(tag)))).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
  if (!related.length) return null;
  return <aside className="mx-auto mt-8 w-full max-w-[794px] px-1 sm:px-2"><p className="mb-3 text-xs font-bold uppercase tracking-[.13em] text-[#a36347]">Related documents</p><div className="grid gap-2 sm:grid-cols-3">{related.map((document) => <button key={document.id} onClick={() => onOpen(document)} className="group rounded-lg border border-[#e8ddd3] bg-[#fffdf9] p-3 text-left transition hover:border-[#cdb6a3]"><div className="flex items-center justify-between text-[#a06b50]"><FileText size={14} /><ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></div><p className="mt-3 line-clamp-2 font-['Instrument_Serif',Georgia,serif] text-base leading-tight text-[#493a31]">{getDocumentTitle(document)}</p><p className="mt-1 text-[11px] text-[#938278]">{document.space}</p></button>)}</div></aside>;
}
