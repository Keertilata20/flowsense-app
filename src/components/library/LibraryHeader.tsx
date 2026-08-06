import type { SortOption } from "./types";
import SearchBar from "./SearchBar";

type LibraryHeaderProps = { count: number; search: string; sort: SortOption; onSearchChange: (value: string) => void; onSortChange: (sort: SortOption) => void };

export default function LibraryHeader({ count, search, sort, onSearchChange, onSortChange }: LibraryHeaderProps) {
  return <header className="mb-8 flex flex-col gap-5 sm:mb-10"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a36347]">Your workspace</p><div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 className="font-['Instrument_Serif',Georgia,serif] text-4xl tracking-[-0.035em] text-[#3d3028] sm:text-[2.8rem]">Library</h1><span className="text-sm text-[#8b7b70]">{count} {count === 1 ? "document" : "documents"}</span></div></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchBar value={search} onChange={onSearchChange} /><label className="flex items-center gap-2 text-xs font-medium text-[#7d6d62]">Sort by<select value={sort} onChange={(event) => onSortChange(event.target.value as SortOption)} className="cursor-pointer border-0 bg-transparent py-2 text-xs font-semibold text-[#58483e] outline-none"><option value="recent">Last edited</option><option value="oldest">Oldest</option><option value="alphabetical">Alphabetical</option><option value="words">Word count</option></select></label></div></header>;
}
