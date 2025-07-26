import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";

import "./Header.css";

const Header = () => {
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/api/user/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setUsername(data.name);
        })
        .catch((error) => console.error("Error fetching username:", error));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsername("");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">ForgeElite</Link>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about-us">About ForgeElite</Link>
      </nav>

      {username ? (
        <div className="profile-wrapper" ref={dropdownRef}>
          <FiUser className="profile-icon" onClick={() => setDropdownOpen(!dropdownOpen)} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <p className="dropdown-username">{username}</p>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="sign-up-btn">
          <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Sign Up</Link>
        </button>
      )}
    </header>
  );
};

export default Header;
