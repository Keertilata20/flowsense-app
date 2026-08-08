import { ChevronDown, Download } from "lucide-react";
import { useEffect, useRef } from "react";

type WriteToolbarProps = {
  loading: boolean;
  onImprove: () => void;
  onSave: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onExportTXT: () => void;
};

export default function WriteToolbar({ loading, onImprove, onSave, onExportPDF, onExportDOCX, onExportTXT }: WriteToolbarProps) {
  const exportMenu = useRef<HTMLDetailsElement>(null);
  useEffect(() => { const close = (event: PointerEvent) => { if (exportMenu.current && !exportMenu.current.contains(event.target as Node)) exportMenu.current.open = false; }; globalThis.document.addEventListener("pointerdown", close); return () => globalThis.document.removeEventListener("pointerdown", close); }, []);
  const closeExport = () => { if (exportMenu.current) exportMenu.current.open = false; };
  return <div className="flex flex-wrap items-center gap-1 px-7 pb-6 sm:px-14">
    <button className="rounded-md px-3 py-2 text-xs font-semibold text-[#625148] transition hover:bg-[#f6ede5] disabled:cursor-wait disabled:opacity-60" disabled={loading} onClick={onImprove}>
      {loading ? "Improving…" : "Improve"}
    </button>
    <details ref={exportMenu} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-[#75665c] transition hover:bg-[#f7eee6]"><Download size={14} strokeWidth={1.7} />Export<ChevronDown size={13} /></summary>
      <div className="absolute bottom-10 left-0 z-10 grid w-32 gap-0.5 rounded-lg border border-[#e6dcd2] bg-[#fffdf9] p-1.5 shadow-[0_12px_28px_rgba(76,51,35,0.12)]">
        <button className="rounded-md px-2.5 py-2 text-left text-xs text-[#68594e] hover:bg-[#f7eee6]" onClick={() => { closeExport(); onExportPDF(); }}>PDF</button>
        <button className="rounded-md px-2.5 py-2 text-left text-xs text-[#68594e] hover:bg-[#f7eee6]" onClick={() => { closeExport(); onExportDOCX(); }}>Word document</button>
        <button className="rounded-md px-2.5 py-2 text-left text-xs text-[#68594e] hover:bg-[#f7eee6]" onClick={() => { closeExport(); onExportTXT(); }}>Plain text</button>
      </div>
    </details>
    <button className="ml-auto rounded-md bg-[#40332b] px-3.5 py-2 text-xs font-semibold text-[#fffaf5] transition hover:bg-[#594439]" onClick={onSave}>Save draft</button>
  </div>;
}
