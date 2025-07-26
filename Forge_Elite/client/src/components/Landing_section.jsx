// StatsSection.jsx
import React from "react";
import "./Landing_section.css";

export default function Landing_section() {
  return (
    <section className="stats-section">
      <div className="stat-card image-card" >
      <img
          src="/Girlimages.jpg"
          alt="Plant Piping"
        />
         <h2 style={{marginTop:'30px'}}>Upload. Analyze. Improve</h2>
         <p>Turn Your Resume Into an Offer</p>
      </div>

      <div className="stat-card dark-card">
      <img
          src="https://thumbs.dreamstime.com/z/ai-stealing-our-jobs-ai-job-interview-generative-ai-ai-getting-interviewed-job-ai-taking-our-jobs-office-robot-machine-274169275.jpg"
          alt="Plant Piping"
        />
        <h2>100+</h2>
        <p>Our Esteemed Clients and Partners</p>
      </div>
{/* 
      <div className="stat-card light-card center-card">
        <div className="icon">📊</div>
        
        <div>
        <img
          src="/Satisfied_Customers.png"
          alt="Plant Piping"
        />
          <p>Total Projects</p>
          <h2>10000+ Active Users</h2>
          <span>
           Trust Us to Level Up
            Increase of <span className="highlight">126</span> this month
          </span>
        </div>
      </div> */}

      <div className="stat-card pastel-card">
      <img
          src="/Crack_ur_company.jpg"
          alt="Plant Piping"
        />
        <h2>Achieve Dreams </h2>
        <p>Years of Dedicated Service</p>
        {/* <h2 style={{color:'white'}}>Achieve Dreams </h2> */}
        
        
      </div>

      {/* <div className="stat-card dark-card">
        <div className="icon">⏱</div>
        <p>Achieve Optimal Efficiency and Boost Productivity</p>
      </div> */}
    </section>
  );
}