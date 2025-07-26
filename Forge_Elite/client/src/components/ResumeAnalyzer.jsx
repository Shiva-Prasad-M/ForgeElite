import React, { useState } from "react";
import axios from "axios";
import "./ResumeAnalyzer.css";
import ResumeHeader from './ResumeAnalyzer_headerPage';
import Header from "./Header";

export default function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [feedback, setFeedback] = useState("");

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile || !targetRole) {
      alert("Please upload a resume and enter a target role.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("targetRole", targetRole);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/api/resume/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response.data);
      setScore(response.data.score || null);
      setMatchedSkills(response.data.matchedSkills || []);
      setMissingSkills(response.data.missingSkills || []);
      setFeedback(response.data.feedback || "No feedback returned.");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  let parsedFeedback = [];
  if (typeof feedback === "string") {
    parsedFeedback = feedback
      .split(/\d+\.\s+/)
      .filter((line) => line.trim().length > 0);
  } else if (typeof feedback === "object" && feedback !== null) {
    parsedFeedback = Object.values(feedback);
  }

  return (
    <>
    <div>
      <Header/>
    </div>
    <div>
      <ResumeHeader/>
    </div>
    <div className="container">
    <div className={`resume-analyzer-container ${score !== null ? "expanded" : ""}`}>
      <h2>Resume Analyzer</h2>

      <form onSubmit={handleSubmit} className="resume-analyzer-form">
        <input
          type="text"
          placeholder="Enter Target Role (e.g., Backend Engineer)"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />

        <input type="file" accept=".pdf" onChange={handleFileChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>
    </div>
      
    
    </div>

    <div>
    {score !== null && (
        <div className="results-grid">
          <div className="glass-card1">
            <h3 style={{color:'#a01e7f'}}>Skill Match Score</h3>
            <p>{score} / 100</p>
          </div>

          {/* <div className="glass-card">
            <h3>Matched Skills</h3>
            <ul>
              {matchedSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card">
            <h3>Missing Skills</h3>
            <ul>
              {missingSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div> */}

          
        </div>
      )}
    </div>
    <div className="missing-matchedskills">
           <div className="glass-card">
            <h3 style={{color:'#a01e7f'}}>Matched Skills</h3>
            <ul>
              {matchedSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card">
            <h3 style={{color:'#a01e7f'}}>Missing Skills</h3>
            <ul>
              {missingSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
    </div>
    <div className="glass-card4">
            <h3 style={{color:'#a01e7f'}}>AI Feedback</h3>
            <ul>
              {parsedFeedback.map((point, idx) => (
                <li key={idx}>{point.trim()}</li>
              ))}
            </ul>
          </div>
    </>
  );
}