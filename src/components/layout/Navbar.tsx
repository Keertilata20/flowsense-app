import "./Navbar.css";

const tabs: Tab[] = ["write", "history", "insights"];

type Tab = "write" | "history" | "insights";
type NavbarProps = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onNew: () => void;
  onSave: () => void;
};

export default function Navbar({
  activeTab,
  setActiveTab,
  onNew,
  onSave,
}: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <span className="logo-icon">🌊</span>
          <span>FlowSense</span>
        </div>
      </div>

      <div className="navbar-center">
        {tabs.map((tab) => (
          <button
            key={tab.charAt(0).toUpperCase() + tab.slice(1)}
            className={`nav-link ${
              activeTab === tab.toLowerCase() ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="navbar-right">
        <button className="secondary-btn" onClick={onNew}>
          New
        </button>

        <button className="primary-btn" onClick={onSave}>
          Save
        </button>
      </div>
    </nav>
  );
}