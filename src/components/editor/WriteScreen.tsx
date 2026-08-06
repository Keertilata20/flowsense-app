import type { ChangeEvent, RefObject } from "react";
import { Check, X } from "lucide-react";
import EditorStatus from "./EditorStatus";
import WriteToolbar from "./WriteToolbar";

type WriteScreenProps = {
  text: string; textareaRef: RefObject<HTMLTextAreaElement | null>; wordCount: number; charCount: number; readingMinutes: number; loading: boolean; suggestion: string; status: string; autoHelp: boolean;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void; onImprove: () => void; onSave: () => void; onSuggestionsChange: (enabled: boolean) => void; onDismissSuggestion: () => void; onUseSuggestion: () => void; onExportPDF: () => void; onExportDOCX: () => void; onExportTXT: () => void;
};

export default function WriteScreen({ text, textareaRef, wordCount, charCount, readingMinutes, loading, suggestion, status, autoHelp, onChange, onImprove, onSave, onSuggestionsChange, onDismissSuggestion, onUseSuggestion, onExportPDF, onExportDOCX, onExportTXT }: WriteScreenProps) {
  return <main className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-9 sm:px-10 sm:pt-14">
    <header className="mb-7 sm:mb-9"><p className="font-['Instrument_Serif',Georgia,serif] text-[1.75rem] leading-tight tracking-[-0.025em] text-[#4b3c33] sm:text-[2rem]">Good evening. What would you like to write today?</p></header>
    <section className="overflow-hidden rounded-[14px] border border-[#e9dfd5] bg-[#fffdf9] transition-colors duration-150 focus-within:border-[#cdb7a5] focus-within:ring-2 focus-within:ring-[#d8c3b2]/35">
      <textarea ref={textareaRef} value={text} onChange={onChange} placeholder="Begin with a thought…" className="editor-textarea block min-h-[520px] w-full resize-none border-0 bg-transparent px-7 py-9 font-['Instrument_Serif',Georgia,serif] text-[1.38rem] leading-[1.82] tracking-[-0.008em] text-[#352b25] outline-none placeholder:text-[#b8aca1] sm:px-14 sm:py-12 sm:text-[1.58rem]" aria-label="Writing editor" />
      {loading && <div className="mx-7 mb-6 border-l-2 border-[#bd927a] bg-[#fcf5ee] px-4 py-3 text-sm text-[#785d4d] sm:mx-14">Refining your writing…</div>}
      {!loading && suggestion && <div className="mx-6 mb-5 rounded-xl border border-[#ead9ca] bg-[#fdf6ef] p-4 sm:mx-10"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#986044]">A possible refinement</p><p className="mt-2 font-['Instrument_Serif',Georgia,serif] text-lg leading-relaxed text-[#54443a]">{suggestion}</p></div><button className="text-[#9a887b] hover:text-[#604d41]" onClick={onDismissSuggestion} aria-label="Dismiss suggestion"><X size={17} /></button></div><button className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#885139] hover:text-[#633622]" onClick={onUseSuggestion}><Check size={14} />Use this version</button></div>}
      <EditorStatus wordCount={wordCount} charCount={charCount} readingMinutes={readingMinutes} status={status} suggestionsEnabled={autoHelp} onSuggestionsChange={onSuggestionsChange} />
      <WriteToolbar loading={loading} onImprove={onImprove} onSave={onSave} onExportPDF={onExportPDF} onExportDOCX={onExportDOCX} onExportTXT={onExportTXT} />
    </section>
  </main>;
}
