export type Draft = { id: string; text: string; savedAt: string; title?: string; updatedAt?: number };
export type SortOption = "recent" | "oldest" | "alphabetical" | "words";

export function getDocumentTitle(draft: Pick<Draft, "text" | "title">) {
  if (draft.title?.trim()) return draft.title.trim();
  const cleanText = draft.text.replace(/\s+/g, " ").trim();
  const firstSentence = cleanText.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (firstSentence && firstSentence.split(/\s+/).length <= 12) return firstSentence;
  const words = cleanText.split(/\s+/).filter(Boolean).slice(0, 7);
  return words.length ? `${words.join(" ")}${cleanText.split(/\s+/).length > 7 ? "…" : ""}` : "Untitled note";
}

export function getWordCount(text: string) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
export function getReadingMinutes(text: string) { return Math.max(1, Math.ceil(getWordCount(text) / 200)); }
export function getPreview(text: string) { return text.replace(/\s+/g, " ").trim().slice(0, 165) || "An empty page"; }
export function getEditedTimestamp(draft: Draft) { return draft.updatedAt ?? (Date.parse(draft.savedAt) || 0); }
