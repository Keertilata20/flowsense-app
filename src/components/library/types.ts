export const DEFAULT_SPACES = [
  { id: "projects", label: "Projects", icon: "rocket" },
  { id: "career", label: "Career", icon: "briefcase" },
  { id: "research", label: "Research", icon: "book" },
  { id: "personal", label: "Personal", icon: "sprout" },
] as const;
export type SpaceDefinition = { id: string; label: string; icon: string; custom?: boolean };
export const UNASSIGNED_SPACE: SpaceDefinition = { id: "none", label: "No space yet", icon: "inbox" };
export type Space = (typeof DEFAULT_SPACES)[number]["id"];

export function getDefaultSpaces(): SpaceDefinition[] { return DEFAULT_SPACES.map((space) => ({ ...space })); }
export type SortOption = "recent" | "oldest" | "alphabetical" | "words";

export type FlowDocument = {
  id: string;
  title: string;
  content: string;
  space: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  readingTime: number;
  favorite: boolean;
  /** Legacy fields are accepted while older localStorage entries migrate. */
  text?: string;
  savedAt?: string;
};

export function getContent(document: Pick<FlowDocument, "content" | "text">) { return document.content ?? document.text ?? ""; }
export function getWordCount(text: string) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
export function getReadingMinutes(text: string) { return Math.max(1, Math.ceil(getWordCount(text) / 200)); }
export function getDocumentTitle(document: Pick<FlowDocument, "content" | "text" | "title">) {
  if (document.title?.trim()) return document.title.trim();
  const cleanText = getContent(document).replace(/\s+/g, " ").trim();
  const firstSentence = cleanText.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (firstSentence && firstSentence.split(/\s+/).length <= 12) return firstSentence;
  const words = cleanText.split(/\s+/).filter(Boolean).slice(0, 7);
  return words.length ? `${words.join(" ")}${cleanText.split(/\s+/).length > 7 ? "…" : ""}` : "Untitled note";
}
export function getPreview(text: string) { return text.replace(/\s+/g, " ").trim().slice(0, 165) || "An empty page"; }
export function getEditedTimestamp(document: FlowDocument) { return document.updatedAt || Date.parse(document.savedAt ?? "") || 0; }

export function normalizeDocument(raw: Partial<FlowDocument> & { text?: string; savedAt?: string }): FlowDocument {
  const content = raw.content ?? raw.text ?? "";
  const fallbackTime = Date.parse(raw.savedAt ?? "") || Date.now();
  const legacySpaces: Record<string, string> = { "🚀 Projects": "projects", "💼 Career": "career", "📚 Research": "research", "🌱 Personal": "personal" };
  return {
    id: raw.id ?? crypto.randomUUID(), title: raw.title?.trim() || getDocumentTitle({ content, title: "" }), content,
    space: legacySpaces[raw.space ?? ""] ?? raw.space ?? "personal", createdAt: raw.createdAt ?? fallbackTime, updatedAt: raw.updatedAt ?? fallbackTime,
    wordCount: raw.wordCount ?? getWordCount(content), readingTime: raw.readingTime ?? getReadingMinutes(content), favorite: raw.favorite ?? false,
  };
}
