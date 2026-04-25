import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

function App() {
  const [text, setText] = useState("");
  const [isStruggling, setIsStruggling] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showFullSuggestion, setShowFullSuggestion] = useState(false);
  const [lastSuggestionTime, setLastSuggestionTime] = useState(0);
  const [lastSuggestion, setLastSuggestion] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const continuations = [
    "...and I believe this is important",
    "...and this made me realize something",
    "...and I’m still figuring it out",
    "...and it’s not easy to explain",
  ];

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
  const saved = localStorage.getItem("flowsense");
  if (saved) setText(saved);
}, []);

const saveText = () => {
  localStorage.setItem("flowsense", text);
};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    // auto expand
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    
    const newText = e.target.value;

    setText(newText);

    // pause detection
 
  

    // reset timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      const nowTime = Date.now();

      if (nowTime - lastSuggestionTime > 3000 && newText.length > 20) {
        setShowSuggestion(true);
        setLastSuggestionTime(nowTime);
      }
    });

    // struggle detection
    if (newText.length < text.length) {
      setDeleteCount((prev) => prev + 1);
    } else {
      setDeleteCount(0);
    }

    if (deleteCount >= 3) {
      setIsStruggling(true);
    } else {
      setIsStruggling(false);
    }

    setTimeout(() => setDeleteCount(0), 2000);
  };

  const downloadPDF = () => {
  if (!text) return;

  const doc = new jsPDF();

  const lines = doc.splitTextToSize(text, 180); // wrap text
  doc.text(lines, 10, 10);
  doc.setFont("Times", "Normal");
doc.setFontSize(12);

  doc.save("flowsense.pdf");
};


const downloadDOCX = async () => {
  if (!text) return;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: text,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "flowsense.docx");
};

const downloadTXT = () => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "flowsense.txt";
  a.click();

  URL.revokeObjectURL(url);
};

  const handleNew = () => {
    setText("");
    setShowSuggestion(false);
    
    setIsStruggling(false);
  };

  const shouldSuggest = showSuggestion && text.length > 20;

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
  <div style={styles.logo}>
  <span style={styles.logoMark}></span>
  <span style={styles.logoText}>FlowSense</span>
</div>
        <div style={styles.actions}
        >
          <button style={styles.button}
          onMouseEnter={(e) =>
  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
}
onMouseLeave={(e) =>
  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
} 

onClick={handleNew}>
            New
          </button>
          <button style={styles.button} 
          onClick={saveText}
          onMouseEnter={(e) =>
  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
}
onMouseLeave={(e) =>
  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
}>Save</button>


<div style={styles.dropdown}>
  <button
  style={styles.button} onMouseEnter={(e) =>
  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
}
onMouseLeave={(e) =>
  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
}
  onClick={() => setShowDropdown((prev) => !prev)}
>
  Download
</button>

  {showDropdown && (
<div
  style={{
    ...styles.dropdownMenu,
    transform: showDropdown ? "translateY(0px)" : "translateY(-5px)",
    opacity: showDropdown ? 1 : 0,
    pointerEvents: showDropdown ? "auto" : "none",
  }}
>
    <div
  style={styles.dropdownItem}
  onClick={downloadTXT}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  .txt
</div>
   <div
  style={styles.dropdownItem}
  onClick={downloadDOCX}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  .doc
</div>
    <div
  style={styles.dropdownItem}
  onClick={downloadPDF}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  .pdf
</div>
  </div>
)}
</div>
          
          
        </div>
      </div>

      <div style={styles.editorContainer}>
        <div style={styles.editorBox}
        onClick={() => setShowFullSuggestion(false)}>
          <textarea
            value={text}
            onChange={handleChange}
           placeholder="What’s on your mind today?"
            style={styles.textarea}
            onFocus={(e) =>
  (e.currentTarget.parentElement!.style.boxShadow =
    "0 0 120px rgba(120,80,255,0.25)")
}

  onBlur={(e) =>
    (e.currentTarget.parentElement!.style.boxShadow =
      "0 20px 60px rgba(0,0,0,0.6)")
  }
          />

          {/* 👻 Ghost Hint */}

          {/* 💡 Full Suggestion */}
         {shouldSuggest && (
  <div
    onClick={() => setShowFullSuggestion(prev => !prev)}
    style={styles.suggestionButton}
  > Continue →
    

    {showFullSuggestion && (
      <div
        style={{
    ...styles.suggestion,
    opacity: showFullSuggestion ? 1 : 0,
    transform: showFullSuggestion
      ? "translateY(0px)"
      : "translateY(5px)",
  }}
        onClick={() => {
          if (isStruggling) {
            const sentences = text.split(".");
            sentences[sentences.length - 1] =
              " I’m trying to express something clearly";
            setText(sentences.join("."));
          } else {
            const random =
              continuations[
                Math.floor(Math.random() * continuations.length)
              ];

            if (random !== lastSuggestion) {
              setText(text + " " + random);
              setLastSuggestion(random);
            }
          }
          setShowFullSuggestion(false);
        }}
      >
        {isStruggling
          ? "Refine this sentence?"
          : "Continue this thought?"}
      </div>
    )}
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
    background: `
radial-gradient(circle at 20% 30%, #2a1a3a, transparent 40%),
radial-gradient(circle at 80% 70%, #1a2a3a, transparent 40%),
#0f0f12
`,
animation: "bgMove 12s ease infinite",
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
  backdropFilter: "blur(10px)",

  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",

  overflow: "visible",
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
  boxShadow: "0 0 12px rgba(124,58,237,0.6)",
},

logoText: {
  fontSize: "14px",
  color: "rgba(255,255,255,0.7)",
  fontWeight: 500,
  letterSpacing: "0.5px",
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
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.2s ease",
},

  editorContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },

  editorBox: {
    width: "90%",
    maxWidth: "800px",
    padding: "30px",
    borderRadius: "20px",

    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(25px)",
    caretColor: "#c4b5fd",
    boxShadow: `
    0 0 80px rgba(120, 80, 255, 0.08),
    0 20px 60px rgba(0,0,0,0.6)
  `,
  animation: "pulse 6s ease-in-out infinite",
  },

  textarea: {
    width: "100%",
    minHeight: "200px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f1f1f1",
    caretColor: "#a78bfa",
    fontSize: "20px",
    lineHeight: "1.8",
    letterSpacing: "0.5px",
    fontWeight: 300,

    resize: "none" as const,
  },

  suggestionHint: {
    marginTop: "30px",
    color: "#aaa",
     textAlign: "center" as const,
    fontSize: "28px",
    opacity: 0.9,
    cursor: "pointer",
    transition: "all 0.3s ease",
    padding: "10px",
  },

  suggestion: {
    marginTop: "10px",
    color: "#bbb",
    fontSize: "15px",
    fontStyle: "italic",
    cursor: "pointer",
    transition: "all 0.3s ease",
  
  },

  dropdown: {
  position: "relative" as const,
},

dropdownMenu: {
  position: "absolute" as const,
  top: "120%",
  right: "-5px",
  background: "rgba(20,20,30,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "6px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  minWidth: "120px",
  zIndex: 1000,
},
dropdownItem: {
  padding: "8px 12px",
  borderRadius: "6px",
  color: "#ccc",
  cursor: "pointer",
  transition: "all 0.2s ease",
},

suggestionButton: {
  marginTop: "25px",
  padding: "12px 18px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ddd",
  fontSize: "14px",
  textAlign: "center" as const,
  cursor: "pointer",
  backdropFilter: "blur(10px)",
  transition: "all 0.2s ease",
  position: "absolute" as const,
  bottom: "20px",
  right: "20px",
},

};

export default App;