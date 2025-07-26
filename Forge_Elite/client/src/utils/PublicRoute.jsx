// PublicRoute.js
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PublicRoute = ({ children }) => {
  const [userStatus, setUserStatus] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      // Fetch user status (e.g., whether they passed or failed the test)
      const fetchUserStatus = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/user/status", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const { passed, lastAttempt, score } = response.data;
          setUserStatus({ passed, lastAttempt, score });
        } catch (error) {
          console.error("Error fetching user status:", error);
        }
      };

      fetchUserStatus();
    }
  }, [token]);

  if (token && userStatus !== null) {
    const { passed, lastAttempt, score } = userStatus;

    // If the user has not taken the test (no lastAttempt), redirect to dashboard
    if (lastAttempt === null) {
      return <Navigate to="/dashboard" />;
    }

    // If the user has taken the test but failed (passed is false or score is 0), redirect to reference page
    if (!passed || score === 0) {
      return <Navigate to="/reference" />;
    }

    // If the user passed the test, redirect to home
    if (passed) {
      return <Navigate to="/" />;
    }
  }

  return children; // Show the login/register page if not logged in
};

export default PublicRoute;
