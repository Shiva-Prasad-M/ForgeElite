import React, { useState, useRef } from "react";
import Header from './Header';

const VoiceToGemini = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [response, setResponse] = useState("");

  const recognitionRef = useRef(null);

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    synth.speak(utterance);
  };

  const startListening = async () => {
    setResponse("");
    setTranscript("");
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
  
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
  
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === "audioinput");
  
      if (audioInputDevices.length === 0) {
        alert("No microphone devices found.");
        return;
      }
  
      console.log("Using mic:", audioInputDevices[0].label);
  
      // ✅ Removed "bluetooth" label check — allow any available mic
      // If needed, you can allow user selection later
  
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.interimResults = true;
        recognitionRef.current.continuous = true;
  
        let finalTranscript = "";
  
        recognitionRef.current.onresult = (event) => {
          let interimTranscript = "";
  
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPiece + " ";
            } else {
              interimTranscript += transcriptPiece;
            }
          }
  
          setTranscript(finalTranscript + interimTranscript);
        };
  
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
  
        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event);
          setIsListening(false);
        };
      }
  
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Mic access error:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };
  

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);

    if (!transcript.trim()) {
      alert("No speech detected. Try speaking again.");
    }
  };

  const sendToGemini = async () => {
    setResponse("");
    try {
      const res = await fetch("http://localhost:8000/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: transcript }),
      });

      const data = await res.json();
      const reply = data.response || "No response received.";
      setResponse(reply);
      speakText(reply);
    } catch (error) {
      console.error("Error sending to Gemini:", error);
      setResponse("Error fetching Gemini response.");
    }
  };

  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <Header />
      </div>
      <div style={styles.container}>
        <h2 style={styles.header}>🎤 Speak to Gemini</h2>

        <div style={styles.buttonGroup}>
          <button onClick={startListening} disabled={isListening} style={{ ...styles.button, backgroundColor: "#4CAF50" }}>
            {isListening ? "Listening..." : "Start Speaking"}
          </button>
          <button onClick={stopListening} disabled={!isListening} style={{ ...styles.button, backgroundColor: "#f44336" }}>
            Stop
          </button>
          <button onClick={() => { setTranscript(""); setResponse(""); }} style={{ ...styles.button, backgroundColor: "#777" }}>
            Clear
          </button>
        </div>

        <div style={styles.section}>
          <h4>📝 Transcription:</h4>
          <div style={styles.textBox}>
            {transcript || "Speak something..."}
          </div>
        </div>

        <button onClick={sendToGemini} disabled={!transcript} style={{ ...styles.button, marginTop: "1rem", backgroundColor: "#2196F3" }}>
          Send to Gemini
        </button>

        <div style={styles.section}>
          <h4>🤖 Gemini Response:</h4>
          <div style={styles.responseBox}>{response}</div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "700px",
    margin: "auto",
    backgroundColor: "rgb(194, 218, 255)",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#333",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  section: {
    marginTop: "1.5rem",
  },
  textBox: {
    border: "1px solid #ccc",
    padding: "1rem",
    minHeight: "100px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    fontSize: "1rem",
    whiteSpace: "pre-wrap",
  },
  responseBox: {
    backgroundColor: "#e8f0fe",
    padding: "1rem",
    borderRadius: "8px",
    minHeight: "100px",
    fontSize: "1rem",
    whiteSpace: "pre-wrap",
    color: "#1a237e",
  },
};

export default VoiceToGemini;
