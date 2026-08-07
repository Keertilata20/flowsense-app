import { useEffect, useMemo, useState } from "react";
import DocumentCard from "./DocumentCard";
import EmptyLibrary from "./EmptyLibrary";
import LibraryHeader from "./LibraryHeader";
import type { FlowDocument, SortOption, SpaceDefinition } from "./types";
import { getContent, getDocumentTitle, getEditedTimestamp, getWordCount } from "./types";

type LibraryProps = { documents: FlowDocument[]; spaces: SpaceDefinition[]; onOpen: (document: FlowDocument) => void; onRename: (id: string, title: string) => void; onDelete: (id: string) => void; onFavorite: (id: string) => void; onMove: (id: string, space: string) => void; onStartWriting: (space?: string) => void; onCreateSpace: () => void; onSpaceChange?: (space: string | null) => void };
function sortDocuments(documents: FlowDocument[], sort: SortOption) { return [...documents].sort((a, b) => sort === "oldest" ? getEditedTimestamp(a) - getEditedTimestamp(b) : sort === "alphabetical" ? getDocumentTitle(a).localeCompare(getDocumentTitle(b)) : sort === "words" ? getWordCount(getContent(b)) - getWordCount(getContent(a)) : getEditedTimestamp(b) - getEditedTimestamp(a)); }

export default function Library({ documents, spaces, onOpen, onRename, onDelete, onFavorite, onMove, onStartWriting, onCreateSpace, onSpaceChange }: LibraryProps) {
  const [search, setSearch] = useState(""); const [sort, setSort] = useState<SortOption>("recent"); const [space, setSpace] = useState("all");
  useEffect(() => { onSpaceChange?.(space === "all" ? null : space); }, [onSpaceChange, space]);
  const filtered = useMemo(() => sortDocuments(documents.filter((document) => (space === "all" || document.space === space) && `${getDocumentTitle(document)} ${getContent(document)}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), sort), [documents, search, sort, space]);
  const favorites = filtered.filter((document) => document.favorite); const recent = filtered.slice(0, 6);
  const section = (title: string, items: FlowDocument[]) => items.length > 0 && <section className="mb-10"><div className="mb-3 flex items-baseline gap-3"><h2 className="font-['Instrument_Serif',Georgia,serif] text-2xl font-normal tracking-[-0.02em] text-[#493a31]">{title}</h2><span className="text-xs text-[#9a8a7e]">{items.length}</span></div><div className="grid gap-3 md:grid-cols-2">{items.map((document) => <DocumentCard key={`${title}-${document.id}`} document={document} spaces={spaces} onOpen={onOpen} onRename={onRename} onDelete={onDelete} onFavorite={onFavorite} onMove={onMove} />)}</div></section>;
  return <main className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14"><LibraryHeader count={filtered.length} search={search} sort={sort} space={space} spaces={spaces} onSearchChange={setSearch} onSortChange={setSort} onSpaceChange={setSpace} onCreateSpace={onCreateSpace} />{filtered.length ? <>{section("Favorites", favorites)}{section("Recent Documents", recent)}</> : <EmptyLibrary isSearchEmpty={Boolean(search.trim())} onStartWriting={() => onStartWriting(space === "all" ? undefined : space)} />}</main>;
}
