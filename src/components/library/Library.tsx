import { useMemo, useState } from "react";
import DocumentCard from "./DocumentCard";
import EmptyLibrary from "./EmptyLibrary";
import LibraryHeader from "./LibraryHeader";
import type { Draft, SortOption } from "./types";
import { getDocumentTitle, getEditedTimestamp, getWordCount } from "./types";

type LibraryProps = { documents: Draft[]; onOpen: (document: Draft) => void; onRename: (id: string, title: string) => void; onDelete: (id: string) => void; onStartWriting: () => void };

export default function Library({ documents, onOpen, onRename, onDelete, onStartWriting }: LibraryProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const visibleDocuments = useMemo(() => documents.filter((document) => `${getDocumentTitle(document)} ${document.text}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).sort((a, b) => {
    if (sort === "oldest") return getEditedTimestamp(a) - getEditedTimestamp(b);
    if (sort === "alphabetical") return getDocumentTitle(a).localeCompare(getDocumentTitle(b));
    if (sort === "words") return getWordCount(b.text) - getWordCount(a.text);
    return getEditedTimestamp(b) - getEditedTimestamp(a);
  }), [documents, search, sort]);
  return <main className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14"><LibraryHeader count={documents.length} search={search} sort={sort} onSearchChange={setSearch} onSortChange={setSort} />{visibleDocuments.length ? <div className="grid gap-3 md:grid-cols-2">{visibleDocuments.map((document) => <DocumentCard key={document.id} document={document} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />)}</div> : <EmptyLibrary isSearchEmpty={Boolean(search.trim())} onStartWriting={onStartWriting} />}</main>;
}
