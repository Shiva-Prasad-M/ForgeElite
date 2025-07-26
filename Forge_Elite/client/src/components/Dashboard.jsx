import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";  // Importing react-toastify
import "react-toastify/dist/ReactToastify.css"; // Importing the required CSS
import "./Dashboard.css";

const Dashboard = () => {
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasSelfie, setHasSelfie] = useState(false);

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelfieStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:8000/api/user/selfie-exists", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!res.ok) {
          // If the response is not OK (status code not 200-299), handle errors
          if (res.status === 401) {
            toast.error("Session expired. Please log in again.");
            navigate("/login");
          } else {
            toast.error("Failed to check selfie status.");
          }
          return;
        }
  
        const data = await res.json();
        setHasSelfie(data.exists);
      } catch (err) {
        console.error("Error checking selfie:", err);
        toast.error("There was an error checking selfie status.");
      }
    };
  
    fetchSelfieStatus();
  }, [navigate]);
  

  const takeSelfie = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelfie(imageSrc);
  };

  const submitSelfie = async () => {
    const token = localStorage.getItem("token");
    if (!selfie || !token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/proctor/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: selfie }),
      });

      const data = await res.json();

      if (data.status === "Valid face detected. No external devices found.") {
        setHasSelfie(true);
        toast.success("✅ Selfie submitted successfully!");
        const video = webcamRef.current?.video;
        const stream = video?.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      } else if (data.warning) {
        toast.warning("⚠️ " + data.warning);
      } else if (data.status === "Device detected") {
        toast.error("🚫 Device Detected: " + data.devices.join(", ") + ". Submission blocked.");
      } else {
        toast.error("❌ Failed to upload selfie. Reason: " + (data.error || "Unknown error"));
      }

    } catch (err) {
      console.error("Error uploading selfie:", err);
      toast.error("❌ Error submitting selfie. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const openInstructions = () => {
    setShowInstructions(true);
  };

  const startTest = () => {
    setShowInstructions(false);
    navigate("/test");
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">🎓 Welcome to the Test Dashboard</h2>

      {!hasSelfie ? (
        <div className="webcam-section">
          {!selfie ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="webcam-view"
                videoConstraints={{ facingMode: "user" }}
              />
              <button className="btn primary-btn take-selfie-btn" onClick={takeSelfie}>
                📸 Take Selfie
              </button>
            </>
          ) : (
            <div className="selfie-preview">
              <img src={selfie} alt="Your Selfie" className="selfie-img" />
              <div className="btn-group">
                <button className="btn primary-btn" onClick={submitSelfie}>
                  ✅ Submit Selfie
                </button>
                <button className="btn danger-btn" onClick={() => setSelfie(null)}>
                  🔁 Retake Selfie
                </button>
              </div>
            </div>
          )}
        </div>      
      ) : (
        <div className="success-section">
          <p className="success-text">✅ Selfie saved. You can now start the test.</p>
          <button className="btn success-btn" onClick={openInstructions}>
            🚀 Take Me to Test
          </button>
        </div>
      )}

      {showInstructions && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>📋 Test Instructions</h3>
            <ul>
              <li>The test contains multiple-choice questions.</li>
              <li>Ensure your face is clearly visible at all times.</li>
              <li>Do not switch tabs or minimize the window.</li>
              <li>External devices (phones, tablets) are not allowed.</li>
              <li>The test duration is fixed, and webcam will be monitored.</li>
              <li>You need 70% or more to PASS the Test!</li>
              <li>If you fail, you can retake the test after 7 days.</li>
            </ul>
            <div className="btn-group">
              <button className="btn success-btn" onClick={startTest}>
                ✅ I Agree, Start Test
              </button>
              <button className="btn neutral-btn" onClick={() => setShowInstructions(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
