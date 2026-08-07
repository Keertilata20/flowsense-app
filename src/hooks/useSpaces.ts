import { useEffect, useState } from "react";
import { getDefaultSpaces, type SpaceDefinition } from "../components/library/types";

const STORAGE_KEY = "flowsense-spaces";
export function useSpaces() {
  const [spaces, setSpaces] = useState<SpaceDefinition[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      return Array.isArray(stored) ? [...getDefaultSpaces(), ...stored.filter((space) => space?.custom && space.id && space.label)] : getDefaultSpaces();
    } catch { return getDefaultSpaces(); }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces.filter((space) => space.custom))); }, [spaces]);
  const createSpace = (label: string, icon = "folder") => {
    const cleanLabel = label.trim();
    if (!cleanLabel) return null;
    const id = `${cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const space = { id, label: cleanLabel, icon, custom: true };
    setSpaces((current) => [...current, space]);
    return space;
  };
  return { spaces, createSpace };
}
