import { FileText, BookOpen, NotebookPen, X } from "lucide-react";
import { WRITING_MODES, type WritingMode } from "./types";

const icons = { note: NotebookPen, journal: BookOpen, document: FileText };
type Props = { onSelect: (mode: WritingMode) => void; onClose: () => void };

export default function WritingModePicker({ onSelect, onClose }: Props) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#3d3028]/15 px-5" role="dialog" aria-modal="true" aria-labelledby="mode-picker-title">
    <div className="w-full max-w-sm rounded-2xl border border-[#e5d9cf] bg-[#fffdf9] p-6 shadow-[0_18px_44px_rgba(62,42,28,.14)]"><div className="flex items-start justify-between"><div><h2 id="mode-picker-title" className="font-['Instrument_Serif',Georgia,serif] text-2xl font-normal text-[#44362e]">How would you like to write?</h2><p className="mt-1 text-sm text-[#8a7a6f]">You can change this later from the editor.</p></div><button className="text-[#9c8d82] hover:text-[#5e4b3f]" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="mt-6 grid gap-2">{WRITING_MODES.map((mode) => { const Icon = icons[mode.id]; return <button key={mode.id} className="flex items-start gap-3 rounded-lg border border-[#eee5dc] px-3.5 py-3 text-left transition hover:border-[#cfb7a4] hover:bg-[#fcf5ee]" onClick={() => onSelect(mode.id)}><span className="mt-0.5 text-[#986047]"><Icon size={17} strokeWidth={1.7} /></span><span><span className="block text-sm font-medium text-[#5c4c42]">{mode.label}</span><span className="mt-0.5 block text-xs text-[#98877b]">{mode.description}</span></span></button>; })}</div></div>
  </div>;
}
