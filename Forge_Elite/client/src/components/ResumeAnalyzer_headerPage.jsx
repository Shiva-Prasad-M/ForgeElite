import React from 'react'
import "./ResumeAnalyzer_headerPage.css"
const ResumeAnalyzer_headerPage = () => {
  return (
    <div className="container">
        <div className="left-box">
            <img src="/ResumeAnalyser_pic.png" alt="Motivational" className="image" />
        </div>
        <div className="right-box">
           <h1 className="headline">Ready to level up your career ?</h1>
             <p className="description">
              Upload your resume to get a personalized score and actionable feedback from our AI-powered reviewer
             </p>
        </div>
     </div>
  )
}

export default ResumeAnalyzer_headerPage