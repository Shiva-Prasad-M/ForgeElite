import React from 'react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import './OAuth.css'; // Separate CSS for styling
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OAuth = () => {
  const auth = getAuth(app);
  const navigate=useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);

      const res = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        toast.success(data.message); 
        // Optionally store token and redirect
        localStorage.setItem('token', data.token);
        // window.location.href = "/dashboard";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('OAuth error:', error);
      alert("Google sign-in failed.");
    }
  };

  return (
    <button className="oauth-button" onClick={handleGoogleClick}>
      <AiFillGoogleCircle className="google-icon" />
      Continue with Google
    </button>
  );
};

export default OAuth;
