import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import Garages from './pages/Garages';
import GarageDetail from './pages/GarageDetail';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import Spinner from './components/Spinner';
import AdminRequests from './pages/AdminRequests';
import VehicleDetail from './pages/VehicleDetail';
import Appointments from './pages/Appointments';
import SearchResults from './pages/SearchResults';
import AssignedWork from './pages/AssignedWork';
import Analytics from './pages/Analytics';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Only redirect to login if we're done loading and there's no user
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Don't show sidebar on these pages
  const hideSidebarPaths = ['/', '/login', '/register'];
  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname) && user;

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // Using Tailwind's md breakpoint
      if (isMobile) {
        setIsSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f3e3] flex flex-col">
      {shouldShowSidebar && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onCollapse={setIsSidebarCollapsed} 
        />
      )}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out bg-[#f6f3e3] ${
          shouldShowSidebar 
            ? isSidebarCollapsed 
              ? 'ml-20' 
              : 'ml-64'
            : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/feed"
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              }
            />
            <Route
              path="/posts/:postId"
              element={
                <PrivateRoute>
                  <PostDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <PrivateRoute>
                  <Vehicles />
                </PrivateRoute>
              }
            />
            <Route
              path="/garages"
              element={
                <PrivateRoute>
                  <Garages />
                </PrivateRoute>
              }
            />
            <Route
              path="/garage/:garageId"
              element={
                <PrivateRoute>
                  <GarageDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/vehicles/:vehicleId"
              element={
                <PrivateRoute>
                  <VehicleDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <PrivateRoute>
                  <AdminRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Appointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/search-results"
              element={
                <PrivateRoute>
                  <SearchResults />
                </PrivateRoute>
              }
            />
            <Route
              path="/assigned-work"
              element={
                <PrivateRoute>
                  <AssignedWork />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
