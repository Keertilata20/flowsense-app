import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [text, setText] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<"fix" | "improve">("fix");
  const [improvedText, setImprovedText] = useState("");

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("flowsense");
    if (saved) setText(saved);
  }, []);

  const saveText = () => {
    localStorage.setItem("flowsense", text);
  };

const [loading, setLoading] = useState(false);
const improveText = async (selectedMode: "fix" | "improve") => {
  setLoading(true);

  try {
    const res = await fetch("http://localhost:3001/improve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        mode: selectedMode,
      }),
    });

    const data = await res.json();

    if (data.result) {
      setImprovedText(data.result);
    }

  } catch (err) {
    console.error(err);
  }

  setLoading(false);
};



    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    // auto expand
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    const newText = e.target.value;
    setText(newText);

    // STEP 1: last sentence detection
    const sentences = newText.split(".");
    const lastSentence = sentences[sentences.length - 1].trim();

    console.log("Last sentence:", lastSentence);

    // simple pause detection
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      if (newText.length > 20) {
        setShowSuggestion(true);
      }
    }, 2000);
  };

  const downloadPDF = () => {
    if (!text) return;

    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);
    doc.save("flowsense.pdf");
  };

  const downloadDOCX = async () => {
    if (!text) return;

    const doc = new Document({
      sections: [
        {
          children: [new Paragraph({ text })],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "flowsense.docx");
  };

  const downloadTXT = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "flowsense.txt");
  };

  const handleNew = () => {
    setText("");
    setShowSuggestion(false);
  };

 return (
  <div className="app">

    <header className="navbar">
      <div className="logo">
  <div className="logo-icon">
  <img
    src={logo}
    alt="FlowSense logo"
    className="logo-image"
  />
</div>

  <h2>FlowSense</h2>
</div>

<div className="nav-center">
  <button className="nav-tab active">
    Write
  </button>

  <button className="nav-tab">
    History
  </button>

  <button className="nav-tab">
    Insights
  </button>
</div>

      <div className="nav-actions">
        <button onClick={handleNew}>New</button>
        <button onClick={saveText}>Save</button>
      </div>
    </header>

    <section className="hero">
      <h1>
  Writing that <span><i>flows</i></span> naturally
</h1>
      <p>
        AI-powered clarity, rhythm and refinement
      </p>
      <div className="hero-accent"></div>
    </section>

    <main className="workspace">

      {/* LEFT PANEL */}
      <div className="panel editor-panel">
        <h3>Your Writing</h3>
        <p className="panel-subtext">
Write naturally. FlowSense will refine clarity and rhythm.
</p>

        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Start writing..."
          className="textarea"
        />

        <div className="action-buttons">

          <button className="secondary-btn"
            onClick={() => {
              setMode("fix");
              improveText("fix");
            }}
          >
             Fix
          </button>

          <button  className="primary-btn"
            onClick={() => {
              setMode("improve");
              improveText("improve");
            }}
          >
            {loading && mode === "improve"
              ? "Thinking..."
              : " Improve"}
          </button>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="panel ai-panel">
        <h3>AI Refinement</h3>
        <p className="panel-subtext">
AI-enhanced writing appears here.
</p>

        <div className="output-box">
          {improvedText || "Your improved writing will appear here."}
        </div>
      </div>

    </main>

  </div>
);
}



export default App;