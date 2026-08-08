import { useCallback, useEffect, useState } from "react";
import { getReadingMinutes, getWordCount, normalizeDocument, type FlowDocument } from "../components/library/types";

const STORAGE_KEY = "flowsense-history";

function readDocuments() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.map(normalizeDocument) : [];
  } catch { return []; }
}

export function useDocuments() {
  const [documents, setDocuments] = useState<FlowDocument[]>(readDocuments);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(documents)); }, [documents]);
  const update = useCallback((updater: (current: FlowDocument[]) => FlowDocument[]) => setDocuments(updater), []);
  const createDocument = useCallback((content: string, space: string) => {
    const now = Date.now();
    const document = normalizeDocument({ id: crypto.randomUUID(), title: "", content, space, createdAt: now, updatedAt: now, wordCount: getWordCount(content), readingTime: getReadingMinutes(content), favorite: false, status: "draft" });
    setDocuments((current) => [document, ...current].slice(0, 50));
    return document;
  }, []);
  const updateDocument = useCallback((id: string, patch: Partial<FlowDocument>) => update((current) => current.map((document) => document.id === id ? normalizeDocument({ ...document, ...patch }) : document)), [update]);
  const deleteDocument = useCallback((id: string) => update((current) => current.filter((document) => document.id !== id)), [update]);
  return { documents, createDocument, updateDocument, deleteDocument };
}
