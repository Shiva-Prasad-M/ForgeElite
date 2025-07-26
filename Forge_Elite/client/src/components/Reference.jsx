import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Reference.css";

const Reference = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:8000/api/user/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch status");

        const data = await res.json();
        setStatus(data);
        setUsername(data.name || "User");
      } catch (err) {
        console.error("Failed to fetch status:", err);
        setError("Could not fetch your status. Please try again later.");
      }
    };

    fetchStatus();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getNextAttemptDate = (lastAttempt) => {
    const date = new Date(lastAttempt);
    date.setDate(date.getDate() + 7);
    return date.toLocaleString();
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!status) return <p>Loading...</p>;

  const lowScoreTopics = Object.entries(status.topicPercentages || {}).filter(
    ([, percent]) => parseFloat(percent) < 50
  );

  return (
    <div className="reference-page">
      {/* Top Bar */}
      <div className="top-bar">
        <span className="username">👤 {username}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Scrollable Content */}
      <div className="content-wrapper">
        {/* Topic Scores */}
        <div className="content-card">
          <h2>📊 Your Topic-wise Scores</h2>
          <ul className="topic-list">
            {Object.entries(status.topicPercentages).map(([topic, percent]) => (
              <li key={topic} className="topic-item">
                <span className="topic-name">{topic}</span>: <span className="percentage">{percent}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Topics to Improve */}
        {lowScoreTopics.length > 0 && (
          <div className="content-card warning">
            <h3>📚 Topics to Improve</h3>
            <ul className="topic-list">
              {lowScoreTopics.map(([topic]) => {
                const linkObj = status.references.find(ref => ref.topic === topic);
                return (
                  <li key={topic} className="topic-item">
                    <span className="topic-name">{topic}</span> — <span className="percentage">{status.topicPercentages[topic]}%</span>
                    <br />
                    {linkObj && (
                      <a
                        className="study-link"
                        href={linkObj.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Study More
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="content-card">
          <h3>🕒 Next Attempt</h3>
          <p><strong>{getNextAttemptDate(status.lastAttempt)}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Reference;
