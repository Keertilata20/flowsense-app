import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

function App() {
  const [text, setText] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("flowsense");
    if (saved) setText(saved);
  }, []);

  const saveText = () => {
    localStorage.setItem("flowsense", text);
  };


const improveText = () => {
  if (!text) return;

  let improved = text;

  // 1. Fix lowercase "i"
  improved = improved.replace(/\bi\b/g, "I");

  // 2. Add space after period if missing
  improved = improved.replace(/\.(\S)/g, ". $1");

  // 3. Remove extra spaces
  improved = improved.replace(/\s+/g, " ").trim();

  // 4. Normalize multiple dots → single dot
  improved = improved.replace(/\.{2,}/g, ".");

  // 5. Capitalize sentence starts
  improved = improved.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) =>
    c.toUpperCase()
  );

  setText(improved);
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
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.logo}>
          <span style={styles.logoMark}></span>
          <span style={styles.logoText}>FlowSense</span>
        </div>

        <div style={styles.actions}>
          <button style={styles.button} onClick={handleNew}>
            New
          </button>

          <button style={styles.button} onClick={saveText}>
            Save
          </button>

          <div style={styles.dropdown}>
            <button
              style={styles.button}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              Download
            </button>

            {showDropdown && (
              <div style={styles.dropdownMenu}>
                <div style={styles.dropdownItem} onClick={downloadTXT}>
                  .txt
                </div>
                <div style={styles.dropdownItem} onClick={downloadDOCX}>
                  .doc
                </div>
                <div style={styles.dropdownItem} onClick={downloadPDF}>
                  .pdf
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.editorContainer}>
        <div style={styles.editorBox}>
          <textarea
            value={text}
            onChange={handleChange}
            placeholder="Start writing..."
            style={styles.textarea}
          />

          {showSuggestion && (
  <div style={styles.suggestionButton} onClick={improveText}>
    Improve ✨
  </div>
)}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    background: "#0f0f12",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },

  topBar: {
    position: "fixed" as const,
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "85%",
    maxWidth: "900px",
    height: "50px",

    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "0 16px",

    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",

    zIndex: 1000,
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  logoMark: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
  },

  logoText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  button: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ccc",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  editorContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  editorBox: {
    position: "relative" as const,
    width: "90%",
    maxWidth: "800px",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  textarea: {
    width: "100%",
    minHeight: "200px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f1f1f1",
    fontSize: "18px",
    lineHeight: "1.6",
    resize: "none" as const,
  },

  suggestionButton: {
    position: "absolute" as const,
    bottom: "20px",
    right: "20px",
    padding: "10px 16px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    cursor: "pointer",
  },

  dropdown: {
    position: "relative" as const,
  },

  dropdownMenu: {
    position: "absolute" as const,
    top: "120%",
    right: 0,
    background: "#111",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "5px",
  },

  dropdownItem: {
    padding: "6px 10px",
    cursor: "pointer",
  },
};

export default App;