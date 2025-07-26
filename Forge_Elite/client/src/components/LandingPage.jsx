import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "./LandingPage.css";
import Landing_section from "./Landing_section";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleTryDemoClick = () => {
    if (!isLoggedIn) {
      toast.info("Please sign up first to try the demo.");
    } else {
      navigate("/resumeanalyzer");
    }
  };

  return (
    <>
      <div>
        <Header />
      </div>
      <div>
        <section className="landing">
          <h1 style={{ color: '#f2f6ff' }}>
            Level Up Smartly <br /> with <span>Latest Technology</span>
          </h1>
          <p>
            Learn Fast. Land Big. Unlock your tech future.
          </p>
          <div className="buttons">
            {!isLoggedIn && (
              <button className="get-started" onClick={() => navigate("/register")}>
                Get Started
              </button>
            )}
            <button className="try-demo" onClick={handleTryDemoClick}>
              Try Demo
            </button>
          </div>
        </section>
      </div>
      <div>
        <Landing_section />
      </div>
      <div>
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
};

export default LandingPage;
