type EditorStatusProps = {
  wordCount: number;
  charCount: number;
  readingMinutes: number;
  status: string;
  suggestionsEnabled: boolean;
  onSuggestionsChange: (enabled: boolean) => void;
};

export default function EditorStatus({ wordCount, charCount, readingMinutes, status, suggestionsEnabled, onSuggestionsChange }: EditorStatusProps) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e8df] px-7 py-4 text-xs text-[#91847a] sm:px-14">
    <div className="flex items-center gap-3 tabular-nums"><span>{wordCount} words</span><span className="text-[#c6b8ad]">•</span><span>{charCount} characters</span><span className="text-[#c6b8ad]">•</span><span>{readingMinutes} min read</span></div>
    <div className="flex items-center gap-4">
      <label className="flex cursor-pointer items-center gap-2 text-[#7c6d63]">
        <input className="peer sr-only" type="checkbox" checked={suggestionsEnabled} onChange={(event) => onSuggestionsChange(event.target.checked)} />
        <span className="h-4 w-7 rounded-full bg-[#dcd0c5] p-0.5 transition peer-checked:bg-[#9a6248]"><span className="block h-3 w-3 rounded-full bg-white shadow-sm transition peer-checked:translate-x-3" /></span>
        Suggestions
      </label>
      <span aria-live="polite">{status || "Saved locally"}</span>
    </div>
  </div>;
}
