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
export type WritingMode = "note" | "journal" | "document";
export const WRITING_MODES: { id: WritingMode; label: string; description: string }[] = [
  { id: "note", label: "Note", description: "A light, flowing page for quick thoughts." },
  { id: "journal", label: "Journal", description: "A spacious canvas for personal writing." },
  { id: "document", label: "Document", description: "A4 pages with margins and page numbers." },
];

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
  status: "draft" | "in-progress" | "finished" | "archived";
  tags: string[];
  mode: WritingMode;
  /** Legacy fields are accepted while older localStorage entries migrate. */
  text?: string;
  savedAt?: string;
};

export function getContent(document: Pick<FlowDocument, "content" | "text">) { return document.content ?? document.text ?? ""; }
export function getPlainText(text: string) {
  if (!/<[a-z][\s\S]*>/i.test(text)) return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (typeof DOMParser === "undefined") return text.replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/blockquote)[^>]*>/gi, "\n").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const parsed = new DOMParser().parseFromString(`<div>${text}</div>`, "text/html");
  const blockTags = new Set(["P", "DIV", "H1", "H2", "H3", "BLOCKQUOTE"]);
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ?? "";
    if (!(node instanceof Element)) return Array.from(node.childNodes).map(walk).join("");
    if (node.tagName === "BR") return "\n";
    const prefix = node.tagName === "LI" ? "- " : "";
    const body = Array.from(node.childNodes).map(walk).join("");
    return `${prefix}${body}${blockTags.has(node.tagName) || node.tagName === "LI" ? "\n" : ""}`;
  };
  return walk(parsed.body.firstElementChild ?? parsed.body).replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
export function getEditorHtml(text: string) {
  if (!text.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text.split(/\n\n+/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`).join("");
}
export function sanitizeEditorHtml(text: string) {
  const html = getEditorHtml(text);
  if (typeof DOMParser === "undefined") return html;
  const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const allowed = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "H1", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE", "FONT", "DIV"]);
  parsed.body.querySelectorAll("*").forEach((element) => {
    if (!allowed.has(element.tagName)) { element.replaceWith(...Array.from(element.childNodes)); return; }
    Array.from(element.attributes).forEach((attribute) => { if (attribute.name !== "data-checklist" && attribute.name !== "data-threadloom-page-break" && attribute.name !== "face" && attribute.name !== "size") element.removeAttribute(attribute.name); });
  });
  return parsed.body.firstElementChild?.innerHTML ?? "";
}
export function getWordCount(text: string) { const plain = getPlainText(text); return plain ? plain.split(/\s+/).length : 0; }
export function getReadingMinutes(text: string) { return Math.max(1, Math.ceil(getWordCount(text) / 200)); }
export function getDocumentTitle(document: Pick<FlowDocument, "content" | "text" | "title">) {
  if (document.title?.trim()) return document.title.trim();
  const cleanText = getPlainText(getContent(document));
  const firstSentence = cleanText.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  if (firstSentence && firstSentence.split(/\s+/).length <= 12) return firstSentence;
  const words = cleanText.split(/\s+/).filter(Boolean).slice(0, 7);
  return words.length ? `${words.join(" ")}${cleanText.split(/\s+/).length > 7 ? "…" : ""}` : "Untitled note";
}
export function getPreview(text: string) { return getPlainText(text).slice(0, 165) || "An empty page"; }
export function getEditedTimestamp(document: FlowDocument) { return document.updatedAt || Date.parse(document.savedAt ?? "") || 0; }

export function normalizeDocument(raw: Partial<FlowDocument> & { text?: string; savedAt?: string }): FlowDocument {
  const content = raw.content ?? raw.text ?? "";
  const fallbackTime = Date.parse(raw.savedAt ?? "") || Date.now();
  const legacySpaces: Record<string, string> = { "🚀 Projects": "projects", "💼 Career": "career", "📚 Research": "research", "🌱 Personal": "personal" };
  return {
    id: raw.id ?? crypto.randomUUID(), title: raw.title?.trim() || getDocumentTitle({ content, title: "" }), content,
    space: legacySpaces[raw.space ?? ""] ?? raw.space ?? "personal", createdAt: raw.createdAt ?? fallbackTime, updatedAt: raw.updatedAt ?? fallbackTime,
    wordCount: raw.wordCount ?? getWordCount(content), readingTime: raw.readingTime ?? getReadingMinutes(content), favorite: raw.favorite ?? false, status: raw.status ?? "draft", tags: raw.tags ?? [], mode: raw.mode ?? "document",
  };
}
