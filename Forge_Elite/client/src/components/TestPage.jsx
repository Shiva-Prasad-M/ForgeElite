import React, { useEffect, useRef, useState, useCallback } from "react";
import "./TestPage.css";
import { initWebcam, captureAndSendImage } from "../utils/webcam";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [userId, setUserId] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [faceMismatchCount, setFaceMismatchCount] = useState(0);
  const [faceMismatch, setFaceMismatch] = useState(false);
  const [deviceDetection, setDeviceDetection] = useState(null);
  const [disqualified, setDisqualified] = useState(false);
  const [webcamError, setWebcamError] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const checkFaceMatch = useCallback(async (imageData, uid) => {
    try {
      const res = await fetch("http://localhost:5000/compare-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, userId: uid }),
      });

      const result = await res.json();

      if (!result.match) {
        setFaceMismatchCount((prev) => {
          const newCount = prev + 1;

          if (newCount >= 5) {
            toast.error("🚫 Face mismatch limit exceeded. Logging out after evaluation.");

            fetch("http://localhost:8000/api/tests/evaluate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ userId: uid, cheating: true, answers }),
            }).then(() => {
              localStorage.removeItem("token");
              navigate("/login");
              window.location.reload();
            });
          }

          return newCount;
        });

        setFaceMismatch(true);
      } else {
        setFaceMismatch(false);
        setFaceMismatchCount(0);
      }
    } catch (err) {
      console.error("❌ Face match error:", err);
      setFaceMismatch(true);
    }
  }, [answers, navigate]);

  const detectDevices = useCallback(async (imageData, uid) => {
    try {
      const res = await fetch("http://localhost:5000/proctor/detect-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const result = await res.json();
      console.log(result);

      if (result.action === "logout") {
        setDeviceDetection(result.devices);
        toast.error(`🚫 Device detected (${result.devices.join(", ")}). Logging out.`);

        await fetch("http://localhost:8000/api/tests/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: uid, cheating: true, answers }),
        });

        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload();
      }
    } catch (err) {
      console.error("❌ Device detection failed:", err);
    }
  }, [answers, navigate]);

  const handleTabSwitch = useCallback(async () => {
    if (document.hidden && !disqualified) {
      toast.warn("⚠️ Tab switch detected!");
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);

      await fetch("http://localhost:5000/proctor/tab-warning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Tab switched",
          timestamp: new Date(),
          userId,
        }),
      });

      if (newCount > 1) {
        setDisqualified(true);

        await fetch("http://localhost:8000/api/tests/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId, cheating: true, answers }),
        });

        stopWebcam();
        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload();
      }
    }
  }, [disqualified, tabSwitchCount, userId, answers, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");

    if (!token || !storedId) {
      toast.warn("⚠️ Session expired");
      navigate("/login");
      return;
    }

    setUserId(storedId);

    if (videoRef.current) {
      initWebcam(videoRef, setWebcamError)
        .then(() => setWebcamError(false))
        .catch(() => {
          setWebcamError(true);
          navigate("/login");
        });
    }

    if (questions.length === 0) {
      fetch("http://localhost:8000/api/tests/questions/mixed")
        .then((res) => res.json())
        .then((data) => {
          setQuestions(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to load questions:", err);
          setLoading(false);
        });
    }

    const interval = setInterval(async () => {
      const imageData = captureAndSendImage(videoRef, canvasRef);
      if (imageData) {
        await checkFaceMatch(imageData, storedId);
        await detectDevices(imageData, storedId);
      }
    }, 5000);

    document.addEventListener("visibilitychange", handleTabSwitch);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleTabSwitch);
    };
  }, [checkFaceMatch, detectDevices, handleTabSwitch, navigate, questions]);

  const handleAnswerChange = (id, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [id]: selectedIndex }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warn("⚠️ Session expired. Login again.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/tests/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, answers, cheating: false }),
      });

      const data = await res.json();

      stopWebcam();

      if (data.status.passed) {
        toast.success(`✅ Passed with ${data.status.score}%`);
        navigate("/home");
      } else {
        toast.error(`❌ Failed with ${data.status.score}%. Retake after 7 days.`);
        navigate("/reference");
      }
    } catch (err) {
      console.error("❌ Submission failed:", err);
      toast.error("Something went wrong during submission. Please try again.");
    }
  };

  const isSubmitDisabled =
    loading || questions.length === 0 || questions.some((q) => answers[q._id] === undefined);

  return (
    <div className="test-container">
      <h2>📘 Objective Test</h2>
      {loading && <p>⏳ Loading questions...</p>}
      {webcamError && <p className="alert-message">🚫 Webcam access denied.</p>}

      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="question-box">
        {questions.map((q, index) => (
          <div key={q._id} className="question">
            <p>
              <strong>Q{index + 1}:</strong> {q.question}
            </p>
            {q.options.map((opt, optIndex) => (
              <label key={optIndex} className="option-label">
                <input
                  type="radio"
                  name={`question-${q._id}`}
                  value={optIndex}
                  checked={answers[q._id] === optIndex}
                  onChange={() => handleAnswerChange(q._id, optIndex)}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="submit-btn" disabled={isSubmitDisabled}>
        ✅ Submit Test
      </button>

      <ToastContainer position="top-center" autoClose={4000} pauseOnHover={false} />
    </div>
  );
};

export default TestPage;
