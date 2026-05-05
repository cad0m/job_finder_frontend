import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import UploadResume from './pages/UploadResume';

import ProfileReview from './pages/ProfileReview';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';
import ApplicationPack from './pages/ApplicationPack';
import Apply from './pages/Apply';
import Profile from './pages/Profile';

import Search from './pages/Search';
import Saved from './pages/Saved';
import Applied from './pages/Applied';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />

          <Route path="/review" element={<ProtectedRoute><ProfileReview /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/job-details/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/apply/:jobId" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
          <Route path="/apply-legacy/:jobId" element={<ProtectedRoute><ApplicationPack /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="/applied" element={<ProtectedRoute><Applied /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
