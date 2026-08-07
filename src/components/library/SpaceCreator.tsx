import { Folder, Plus, X } from "lucide-react";
import { useState } from "react";

type SpaceCreatorProps = { onCreate: (label: string) => void; onClose: () => void };
export default function SpaceCreator({ onCreate, onClose }: SpaceCreatorProps) {
  const [label, setLabel] = useState("");
  const submit = () => { if (label.trim()) onCreate(label); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#3d3028]/15 px-5" role="dialog" aria-modal="true" aria-labelledby="new-space-title"><div className="w-full max-w-sm rounded-2xl border border-[#e5d9cf] bg-[#fffdf9] p-6 shadow-[0_18px_44px_rgba(62,42,28,.14)]"><div className="flex items-start justify-between"><div><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5e9de] text-[#986047]"><Folder size={17} strokeWidth={1.6} /></span><h2 id="new-space-title" className="mt-4 font-['Instrument_Serif',Georgia,serif] text-2xl font-normal text-[#44362e]">Create a space</h2><p className="mt-1 text-sm text-[#8a7a6f]">Give a group of ideas a home.</p></div><button className="text-[#9c8d82] hover:text-[#5e4b3f]" onClick={onClose} aria-label="Close"><X size={18} /></button></div><input autoFocus value={label} onChange={(event) => setLabel(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Space name" className="mt-6 w-full rounded-lg border border-[#e3d7cc] bg-[#fffdf9] px-3.5 py-3 text-sm text-[#493a31] outline-none focus:border-[#c5a993] focus:ring-2 focus:ring-[#dcc6b5]/30" /><button onClick={submit} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#44362e] px-4 py-2.5 text-sm font-semibold text-[#fffaf5] hover:bg-[#5c4539]"><Plus size={15} />Create space</button></div></div>;
}
