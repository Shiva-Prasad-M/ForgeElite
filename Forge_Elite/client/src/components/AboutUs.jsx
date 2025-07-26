import React from 'react';
import { FaFileAlt, FaChartLine, FaLaptopCode, FaShieldAlt } from 'react-icons/fa'; // Import icons
import Header from './Header';  // Import Header component
import Footer from './Footer';  // Import Footer component
import './AboutUs.css';  // Make sure to import the CSS file for styling

const AboutUs = () => {
  return (
    <>
      <Header /> {/* Add Header here */}
      
      <section className="about-us">
        <h1>We Empower Freshers to Build the Career They Deserve</h1>
        <p>
          At ForgeElite, we believe in helping freshers unlock their true potential and land their dream job roles.
          We are more than just a job portal – we provide an AI-powered, end-to-end solution that guides candidates through every stage of their job search. 
          From resume analysis and mock interviews to personalized AI-driven career progress tracking, our platform is designed to optimize the hiring process for both candidates and employers.
          Our cutting-edge technology helps candidates refine their resumes with role-based feedback and scoring, ensuring they’re job-ready. 
          We empower them to practice their interview skills through an AI-powered interview simulator, which evaluates responses and helps them improve.
          At ForgeElite, we’re not just about finding jobs; we’re about shaping careers.
        </p>

        <h2 className="section-title">A Full-Spectrum Solution for Job Seekers and Employers</h2>
            <div className="features-column">
            <div className="feature">
                <FaFileAlt size={40} color="#2563eb" />
                <p><strong>AI-Driven Resume Analysis</strong>: Get personalized feedback and a score based on relevance, skills, and completeness.</p>
            </div>
            <div className="feature">
                <FaChartLine size={40} color="#2563eb" />
                <p><strong>Target-Based Progression</strong>: Track your growth with assessments, mock interviews, and resume improvements.</p>
            </div>
            <div className="feature">
                <FaLaptopCode size={40} color="#2563eb" />
                <p><strong>Interview Simulator</strong>: Practice real interviews and get real-time feedback to improve your performance.</p>
            </div>
            <div className="feature">
                <FaShieldAlt size={40} color="#2563eb" />
                <p><strong>Proctored Exams</strong>: Ensure integrity with real-time face verification and tab-switch detection.</p>
            </div>
            </div>


        <h2 className="section-title">Our Mission: Bridging the Gap Between Talent and Opportunity</h2>
        <p>
          We are committed to equipping job seekers with the tools, resources, and insights they need to succeed. Whether you're fresh out of college or just starting your career journey, ForgeElite is here to guide you every step of the way. 
          We empower freshers to stand out from the crowd, refine their skills, and get hired faster.
        </p>

        <h2 className="section-title">Our Story</h2>
        <p>
          For years, we've been committed to reshaping the job-seeking experience. Through innovation and deep understanding of what both freshers and employers need, ForgeElite is on a mission to build an ecosystem where talent meets opportunity – seamlessly.
        </p>
      </section>
      
      <Footer /> {/* Add Footer here */}
    </>
  );
}

export default AboutUs;
