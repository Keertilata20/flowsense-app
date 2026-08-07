import { FolderOpen, X } from "lucide-react";
import type { SpaceDefinition } from "./types";
import SpaceIcon from "./SpaceIcon";

type SpacePickerProps = { spaces: SpaceDefinition[]; onSelect: (space: string) => void; onClose: () => void };

export default function SpacePicker({ spaces, onSelect, onClose }: SpacePickerProps) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#3d3028]/15 px-5" role="dialog" aria-modal="true" aria-labelledby="space-picker-title">
    <div className="w-full max-w-sm rounded-2xl border border-[#e5d9cf] bg-[#fffdf9] p-6 shadow-[0_18px_44px_rgba(62,42,28,.14)]"><div className="flex items-start justify-between"><div><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5e9de] text-[#986047]"><FolderOpen size={17} strokeWidth={1.6} /></span><h2 id="space-picker-title" className="mt-4 font-['Instrument_Serif',Georgia,serif] text-2xl font-normal text-[#44362e]">Where should this live?</h2><p className="mt-1 text-sm text-[#8a7a6f]">Choose a space, then start writing.</p></div><button className="text-[#9c8d82] hover:text-[#5e4b3f]" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="mt-6 grid gap-2">{spaces.map((space) => <button key={space.id} className="flex items-center gap-3 rounded-lg border border-[#eee5dc] px-3.5 py-3 text-left text-sm font-medium text-[#5c4c42] transition hover:border-[#cfb7a4] hover:bg-[#fcf5ee]" onClick={() => onSelect(space.id)}><span className="text-[#986047]"><SpaceIcon icon={space.icon} size={16} /></span>{space.label}</button>)}</div></div>
  </div>;
}
