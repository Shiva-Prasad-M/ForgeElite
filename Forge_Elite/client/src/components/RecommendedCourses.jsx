import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import './RecommendedCourses.css';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51RKCnXRZScONxzFm2Wu8RCGRpQg2E5Dx4KMb4EbBO1iFJ726OisKeLVkigQdlBarpd7aeActQxm3G0olgpCjo2UY007UN8Q2g6'); // Replace with actual key

const RecommendedCourses = ({ courses }) => {

    const navigate = useNavigate();


  return (
    <div className="recommended-container">
      <h2>Recommended Courses for You</h2>
      <div className="courses-grid">
        {courses.map((course) => (
          <div className="course-card" key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p className="price">${(course.price / 100).toFixed(2)}</p>
            <button onClick={() => navigate('/payment', { state: { course } })}>
                Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
