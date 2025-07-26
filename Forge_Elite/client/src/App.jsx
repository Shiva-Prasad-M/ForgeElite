import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import TestPage from "./components/TestPage";
import Home from "./components/Home";
import Reference from "./components/Reference";
import PublicRoute from "./utils/PublicRoute";
import ProtectedRoute from "./utils/ProtectedRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { ToastContainer} from 'react-toastify';
import recommendedCourses from "./utils/recommendedCourses";
import RecommendedCourses from "./components/RecommendedCourses";
import PaymentFailure from "./components/PaymentFailure";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentPageWrapper from "./components/PaymentPageWrapper";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import LandingPage from "./components/LandingPage";
import VoiceToGemini from "./components/VoiceToGemini";
import RoomPage from "./components/RoomPage";
import AboutUs from "./components/AboutUs";

const App = () => {
  return (
    <Router>
      <ToastContainer/>
      
      <Routes>
      <Route
          path="/room/:roomId"
          element={
            <RoomPage/>
          }
        />
      <Route
          path="/interview_with_ai"
          element={
            <VoiceToGemini/>
          }
        />
        <Route
          path="/about-us"
          element={
            <AboutUs/>
          }
        />
      <Route
          path="/resumeanalyzer"
          element={
            <ProtectedRoute page="resumeanalyzer">
              <ResumeAnalyzer/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/send-reset-otp"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
       <Route
          path="/dashboard"
          element={
            <ProtectedRoute page="dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ProtectedRoute page="test">
              <TestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <LandingPage/>
          }
        />
        <Route
          path="/reference"
          element={
            <ProtectedRoute page="reference">
              <Reference />
            </ProtectedRoute>
          }
        />
        <Route path="/courses" element={
          <RecommendedCourses courses={recommendedCourses} />
        }/>
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/payment" element={<PaymentPageWrapper />} />

      </Routes>
    </Router>
  );
};

export default App;
