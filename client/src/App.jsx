import BackToTopButton from "./components/BackToTopButton";
import "./styles/BackToTopButton.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthForm from "./components/AuthForm";
import UserProfile from "./components/UserProfile";
import FileUpload from "./components/FileUpload";
import ReportTable from "./components/ReportTable";
import TrendChart from "./components/TrendChart";
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import LandingPage from "./components/LandingPage";
import Footer from "./components/Footer";
import ContactUs from "./components/ContactUs";
import { getCurrentUser } from "./utils/api";
import "./styles/App.css";
import FAQ from "./components/FAQ";
import { Link } from "react-router-dom";
import { FileText, Menu, X, LogOut } from 'lucide-react';
import DarkModeToggle from "./components/DarkModeToggle";
import { useLoading } from "./context/LoadingContext.jsx";

// Dashboard Component - Main authenticated app
function Dashboard({ user, setUser }) {
  const [reportData, setReportData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { loading } = useLoading(); // use global loading state

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setReportData(null);
    setTrendData(null);
    setError(null);
    toast.success("Successfully logged out. See you again!");
    setMenuOpen(false);
  };

  const handleFileProcessed = (data) => {
    setReportData(data);
    setError(null);
    toast.success("Report processed successfully!");
  };

  const handleTrendData = (trends) => {
    setTrendData(trends);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setReportData(null);
    setTrendData(null);
    toast.error(errorMessage);
  };

  const handleReset = () => {
    setReportData(null);
    setTrendData(null);
    setError(null);
  };

  return (
    <div className="app">
      {loading && (
        <div className="global-loading-overlay">
          <LoadingSpinner />
        </div>
      )}

      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <FileText className="landing-logo-icon" />
            <h1 className="landing-logo-text">Health Report Analyzer</h1>
            <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className="nav-button user-section">
            <Link to="/" className="btn-pill">
              Home
            </Link>
            <Link to="/contact" className="btn-pill">
              Contact Us
            </Link>
            <UserProfile
              className="user-section"
              user={user}
              onLogout={handleLogout}
            />
            <DarkModeToggle />
          </div>
        </div>

            {/* Mobile Menu Dropdown  */}
        {menuOpen && (
          <div className="mobile-menu">
            <div className="mobile-user-profile">
              <UserProfile user={user} onLogout={handleLogout} />
            </div>
            <Link to="/" className="btn-pill" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/contact" className="btn-pill" onClick={() => setMenuOpen(false)}>Contact Us</Link>
            <DarkModeToggle />
          </div>
          )}
      </header>

      <main className="app-main">
        {!reportData && !loading && !error && (
          <div className="welcome-dashboard-message">
            <h2>Welcome back, {user.firstName}!</h2>
            <p>Upload your lab report and get instant insights.</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={handleReset} className="btn-retry">
              Try Again
            </button>
          </div>
        )}

        {!reportData && !loading && (
          <FileUpload
            onFileProcessed={handleFileProcessed}
            onError={handleError}
          />
        )}

        {reportData && (
          <div className="results-section">
            <div className="results-header">
              <h2>📊 Analysis Results</h2>
              <button onClick={handleReset} className="btn-new-upload">
                Upload New Report
              </button>
            </div>

            <ReportTable data={reportData} onTrendData={handleTrendData} />

            {trendData && (
              <TrendChart data={trendData} reportId={reportData.reportId} />
            )}
          </div>
        )}
      </main>

      <FAQ />
      <Footer />
    </div>
  );
}

function App() {
  const { loading } = useLoading();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          await getCurrentUser();
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          toast.info(`Welcome back, ${parsedUser.firstName}!`);
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please log in again.");
        }
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
  };

  if (authLoading || loading) {
    return (
      <div className="app">
        <div className="global-loading-overlay">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Landing page */}
          <Route
            path="/"
            element={
              <>
                <LandingPage user={user} setUser={setUser} />
                <FAQ />
                <Footer />
              </>
            }
          />

          {/* Dashboard redirect */}
          <Route
            path="/home"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/" />}
          />

          {/* Login */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <header className="app-header">
                    <div className="header-content">
                      <div className="header-text">
                        <h1>🏥 Health Report Analyzer</h1>
                        <p>
                          Secure platform to analyze your health reports with AI
                          insights
                        </p>
                      </div>
                      <div className="header-actions">
                        <Link to="/" className="btn-home">
                          Back to Home
                        </Link>
                      </div>
                    </div>
                  </header>
                  <main className="app-main">
                    <AuthForm onLogin={handleLogin} isLogin={true} />
                  </main>
                  <Footer />
                </>
              )
            }
          />

          {/* Signup */}
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <header className="app-header">
                    <div className="header-content">
                      <div className="header-text">
                        <h1>🏥 Health Report Analyzer</h1>
                        <p>
                          Secure platform to analyze your health reports with AI
                          insights
                        </p>
                      </div>
                      <div className="header-actions">
                        <Link to="/" className="btn-home">
                          Back to Home
                        </Link>
                      </div>
                    </div>
                  </header>
                  <main className="app-main">
                    <AuthForm onLogin={handleLogin} isLogin={false} />
                  </main>
                  <Footer />
                </>
              )
            }
          />

          {/* Forgot Password */}
          <Route
            path="/forgot-password"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <header className="app-header">
                    <div className="header-content">
                      <div className="header-text">
                        <h1>🏥 Health Report Analyzer</h1>
                        <p>Reset your password</p>
                      </div>
                      <div className="header-actions">
                        <Link to="/" className="btn-home">
                          Back to Home
                        </Link>
                      </div>
                    </div>
                  </header>
                  <main className="app-main">
                    <ForgotPassword />
                  </main>
                  <Footer />
                </>
              )
            }
          />

          {/* Reset Password */}
          <Route
            path="/reset-password/:token"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <>
                  <header className="app-header">
                    <div className="header-content">
                      <div className="header-text">
                        <h1>🏥 Health Report Analyzer</h1>
                        <p>Enter your new password</p>
                      </div>
                      <div className="header-actions">
                        <Link to="/" className="btn-home">
                          Back to Home
                        </Link>
                      </div>
                    </div>
                  </header>
                  <main className="app-main">
                    <ResetPassword />
                  </main>
                  <Footer />
                </>
              )
            }
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={
              user ? (
                <>
                  <header className="app-header">
                    <div className="header-content">
                      <div className="header-text">
                        <h1>🏥 Health Report Analyzer</h1>
                        <p>We'd love to hear from you!</p>
                      </div>
                      <div className="header-actions">
                        <Link to="/dashboard" className="btn-home">
                          Back to Dashboard
                        </Link>
                      </div>
                    </div>
                  </header>
                  <main className="app-main">
                    <ContactUs user={user} />
                  </main>
                  <Footer />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <BackToTopButton />
      </div>
    </Router>
  );
}

export default App;
