import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa"; // Importing icons
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-section">
          <h3>About Us</h3>
          <ul>
            <li><Link to="#about-us">Corporate Site</Link></li>
            <li><Link to="#about-us">Transparency in Coverage</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us Here</h3>
          <ul className="social-media">
            <li><Link to="#facebook"><FaFacebook size={24} /></Link></li>
            <li><Link to="#twitter"><FaTwitter size={24} /></Link></li>
            <li><Link to="#linkedin"><FaLinkedin size={24} /></Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Corporate Headquarters</h3>
          <p>200 N. LaSalle St., Suite 1000</p>
          <p>Chicago, IL 60601</p>
        </div>

        <div className="footer-section">
          <h3>Technology Headquarters</h3>
          <p>5550-A Peachtree Pkwy, Suite 200</p>
          <p>Norcross, GA 30092</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2022 ForgeElite, LLC. All rights reserved.</p>
        <div className="footer-terms">
          <Link to="#security">Security & Fraud</Link> | 
          <Link to="#privacy-policy">Privacy Policy</Link> | 
          <Link to="#terms-conditions">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
