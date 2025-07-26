import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, page }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user status");

        const data = await res.json();
        setStatus(data);
        setLoading(false);

        const hasTakenTest = !!data.lastAttempt;
        const passed = data.passed === true;

        // 🚫 Rule 1: Block /dashboard and /test if test taken
        if ((page === "dashboard" || page === "test") && hasTakenTest) {
          navigate("/home");
        }

        // 🚫 Rule 2: Block /home if test failed
        if (page === "home" && hasTakenTest && !passed) {
          navigate("/reference");
        }

        // 🚫 Rule 3: Block /reference if test passed
        if (page === "reference" && passed) {
          navigate("/home");
        }

      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchStatus();
  }, [navigate, page]);

  if (loading) return <p>Loading...</p>;

  return children;
};

export default ProtectedRoute;
