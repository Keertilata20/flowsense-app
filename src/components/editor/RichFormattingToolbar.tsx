import { Bold, Italic, Underline, Heading2, List, ListChecks, Quote } from "lucide-react";
export default function RichFormattingToolbar() {
  const runCommand = (command: string, value?: string) => { const active = globalThis.document.activeElement; if (active instanceof HTMLElement && active.isContentEditable) { globalThis.document.execCommand(command, false, value); active.focus(); } };
  const apply = (prefix: string, suffix = "") => {
    const active = globalThis.document.activeElement;
    if (active instanceof HTMLElement && active.isContentEditable) {
      const command = prefix === "**" ? "bold" : prefix === "*" ? "italic" : "underline";
      globalThis.document.execCommand(command);
      active.focus();
      return;
    }
    const editor = active instanceof HTMLTextAreaElement ? active : null;
    if (!editor) return;
    const start = editor.selectionStart; const end = editor.selectionEnd; const selected = editor.value.slice(start, end);
    const next = `${editor.value.slice(0, start)}${prefix}${selected || "text"}${suffix}${editor.value.slice(end)}`;
    editor.value = next; editor.dispatchEvent(new Event("input", { bubbles: true }));
    requestAnimationFrame(() => { editor.focus(); const cursor = start + prefix.length + (selected || "text").length + suffix.length; editor.setSelectionRange(cursor, cursor); });
  };
  const linePrefix = (prefix: string) => { const active = globalThis.document.activeElement; if (active instanceof HTMLElement && active.isContentEditable) { if (prefix === "## ") globalThis.document.execCommand("formatBlock", false, "<h2>"); else if (prefix === "> ") globalThis.document.execCommand("formatBlock", false, "<blockquote>"); else if (prefix === "- ") globalThis.document.execCommand("insertUnorderedList"); else if (prefix === "- [ ] ") globalThis.document.execCommand("insertUnorderedList"); active.focus(); return; } const editor = active instanceof HTMLTextAreaElement ? active : null; if (!editor) return; const start = editor.value.lastIndexOf("\n", editor.selectionStart - 1) + 1; const next = `${editor.value.slice(0, start)}${prefix}${editor.value.slice(start)}`; editor.value = next; editor.dispatchEvent(new Event("input", { bubbles: true })); requestAnimationFrame(() => editor.focus()); };
  const buttons = [
    ["Bold", <Bold size={15} />, () => apply("**", "**")], ["Italic", <Italic size={15} />, () => apply("*", "*")], ["Underline", <Underline size={15} />, () => apply("++", "++")],
    ["Heading", <Heading2 size={15} />, () => linePrefix("## ")], ["Bulleted list", <List size={15} />, () => linePrefix("- ")], ["Checklist", <ListChecks size={15} />, () => linePrefix("- [ ] ")], ["Quote", <Quote size={15} />, () => linePrefix("> ")],
  ] as const;
  return <div className="flex flex-wrap items-center gap-0.5 border-b border-[#ece2d8] px-5 py-2 sm:px-8" aria-label="Formatting toolbar">{buttons.map(([label, icon, action]) => <button key={label} type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={action} className="grid h-8 w-8 place-items-center rounded-md text-[#806f63] transition hover:bg-[#f7eee6] hover:text-[#4f3c31]">{icon}</button>)}<span className="mx-1 h-5 w-px bg-[#e5d9cf]" /><select aria-label="Font family" title="Font family" defaultValue="" onChange={(event) => runCommand("fontName", event.target.value)} className="h-8 rounded-md bg-transparent px-1 text-xs text-[#75665c] outline-none hover:bg-[#f7eee6]"><option value="">Font</option><option value="Georgia">Serif</option><option value="Inter">Sans</option><option value="Courier New">Mono</option></select><select aria-label="Font size" title="Font size" defaultValue="" onChange={(event) => runCommand("fontSize", event.target.value)} className="h-8 rounded-md bg-transparent px-1 text-xs text-[#75665c] outline-none hover:bg-[#f7eee6]"><option value="">Size</option><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">XL</option></select></div>;
}
