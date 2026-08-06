import { Search } from "lucide-react";

type SearchBarProps = { value: string; onChange: (value: string) => void };

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return <label className="flex w-full items-center gap-2 rounded-lg border border-[#e8ddd3] bg-[#fffdf9] px-3.5 py-2.5 text-[#8e7e72] focus-within:border-[#cbb39f] focus-within:ring-2 focus-within:ring-[#d9c5b5]/30 sm:max-w-[310px]">
    <Search size={16} strokeWidth={1.7} /><span className="sr-only">Search your library</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search your library" className="min-w-0 flex-1 bg-transparent text-sm text-[#473930] outline-none placeholder:text-[#ac9e93]" />
  </label>;
}
