import { FilePlus2 } from "lucide-react";

type EmptyLibraryProps = { isSearchEmpty: boolean; onStartWriting: () => void };

export default function EmptyLibrary({ isSearchEmpty, onStartWriting }: EmptyLibraryProps) {
  if (isSearchEmpty) return <div className="py-20 text-center text-sm text-[#8a7a6f]">No documents match your search.</div>;
  return <section className="mx-auto max-w-md py-20 text-center sm:py-28"><div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[#f5e9de] text-[#9b5c42]"><FilePlus2 size={20} strokeWidth={1.5} /></div><h2 className="font-['Instrument_Serif',Georgia,serif] text-3xl font-normal tracking-[-0.025em] text-[#44362e]">Your library is waiting.</h2><p className="mt-3 text-sm leading-6 text-[#8a7a6f]">Every great idea begins with a single page.</p><button className="mt-7 rounded-lg bg-[#44362e] px-4 py-2.5 text-sm font-semibold text-[#fffaf5] transition hover:bg-[#5c4539]" onClick={onStartWriting}>Start Writing</button></section>;
}
