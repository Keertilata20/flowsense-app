import { BookOpen, FilePlus2, Save } from "lucide-react";
import "./Navbar.css";

type Tab = "home" | "write" | "history" | "insights";
type NavbarProps = { activeTab: Tab; setActiveTab: (tab: Tab) => void; onNew: () => void; onSave: () => void };
const tabs: Tab[] = ["home", "write", "history", "insights"];

export default function Navbar({ activeTab, setActiveTab, onNew, onSave }: NavbarProps) {
  return <nav className="navbar">
    <button className="brand" onClick={() => setActiveTab("write")} aria-label="FlowSense home">
      <span className="brand-mark"><BookOpen size={16} strokeWidth={1.8} /></span><span>FlowSense</span>
    </button>
    <div className="navbar-center">
      {tabs.map((tab) => <button key={tab} className={`nav-link ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>)}
    </div>
    <div className="navbar-right">
      {activeTab !== "home" && <button className="nav-new" onClick={onNew}><FilePlus2 size={15} /><span>New</span></button>}
      {activeTab === "write" && <button className="nav-save" onClick={onSave}><Save size={14} /><span>Save &amp; New</span></button>}
    </div>
  </nav>;
}
